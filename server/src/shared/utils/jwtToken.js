import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'super_secret_ims_access_token_key_12345';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_ims_refresh_token_key_67890';

export const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes (short-lived for security)
export const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days (keeps you logged in for 7 days)

/**
 * Sign a short-lived access token (15 mins)
 */
export const signAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Sign a long-lived refresh token (7 days)
 */
export const signRefreshToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(), // Unique token identifier
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
    }
  );
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

/**
 * Compute SHA-256 cryptographic hash of a token for secure database storage
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Summarize user agent string into human-friendly device/browser name
 */
export const parseUserAgent = (ua = '') => {
  if (!ua) return 'Unknown Device';
  
  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';

  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${browser} on ${os}`;
};

// Backward compatibility alias
export const signToken = signAccessToken;
export const verifyToken = verifyAccessToken;
