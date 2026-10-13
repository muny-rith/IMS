/**
 * rateLimit.middleware.js - Enterprise In-Memory Sliding-Window Rate Limiter
 * 
 * Provides defense-in-depth protection against brute-force attacks and request floods
 * while injecting standard RFC RateLimit-* headers.
 */

const rateLimitStore = new Map();

// Periodic cleanup of stale rate-limit entries every 3 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 3 * 60 * 1000).unref();

/**
 * Creates an Express rate-limiting middleware
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests allowed per windowMs
 * @param {string} options.message - Error message when limit is exceeded
 * @param {function} options.keyGenerator - Key identification function
 */
export const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 100,
  message = 'Too many requests. Please try again later.',
  keyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client',
} = {}) => {
  return (req, res, next) => {
    const clientKey = `${req.baseUrl || ''}:${keyGenerator(req)}`;
    const now = Date.now();

    let record = rateLimitStore.get(clientKey);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(clientKey, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    // RFC RateLimit headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        status: 'fail',
        statusCode: 429,
        message,
        retryAfter: resetSeconds,
      });
    }

    next();
  };
};

/**
 * Pre-configured rate limiters for IMS
 */

// Stricter limiter for authentication endpoints (prevents brute-force)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                  // Max 20 login attempts per 15 min
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

// General limiter across all API routes (prevents scraping and resource exhaustion)
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  max: 600,                 // 600 requests/minute per client
  message: 'API rate limit exceeded. Please throttle requests.',
});

export const getRateLimitStats = () => ({
  activeTrackedClients: rateLimitStore.size,
});

export default createRateLimiter;
