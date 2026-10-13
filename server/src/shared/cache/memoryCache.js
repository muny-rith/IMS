/**
 * memoryCache.js - Enterprise Server-Side In-Memory TTL Cache
 * 
 * Provides ultra-fast RAM caching for read-heavy database queries,
 * reducing PostgreSQL pool connection overhead and response latency.
 */

const cache = new Map();

export const SERVER_CACHE_TTL = {
  METADATA: 5 * 60 * 1000,   // 5 minutes (Categories, Brands, Attributes)
  PRODUCTS: 2 * 60 * 1000,   // 2 minutes (Product lists)
  DETAIL: 3 * 60 * 1000,     // 3 minutes (Single item details)
  DASHBOARD: 1 * 60 * 1000,  // 1 minute (Aggregated Dashboard KPIs)
};

class MemoryCache {
  constructor() {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Store data in RAM cache with a TTL
   * @param {string} key 
   * @param {*} data 
   * @param {number} ttlMs 
   */
  set(key, data, ttlMs = SERVER_CACHE_TTL.PRODUCTS) {
    if (!key) return;
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Retrieve cached data if valid and fresh
   * @param {string} key 
   * @returns {*} cached data or null
   */
  get(key) {
    if (!key) return null;
    const item = cache.get(key);
    if (!item) {
      this.misses += 1;
      return null;
    }

    const isExpired = Date.now() - item.timestamp >= item.ttl;
    if (isExpired) {
      cache.delete(key);
      this.misses += 1;
      return null;
    }

    this.hits += 1;
    return item.data;
  }

  /**
   * Check if a valid, unexpired key exists in cache
   * @param {string} key 
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Invalidate a single key or all keys matching a prefix/regex pattern
   * Example: invalidate('products') removes 'products:list', 'products:1', etc.
   * @param {string|RegExp} pattern 
   */
  invalidate(pattern) {
    if (!pattern) return;

    if (pattern instanceof RegExp) {
      for (const key of cache.keys()) {
        if (pattern.test(key)) {
          cache.delete(key);
        }
      }
      return;
    }

    const prefix = String(pattern);
    for (const key of cache.keys()) {
      if (key === prefix || key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear() {
    cache.clear();
  }

  /**
   * Return cache diagnostics
   */
  stats() {
    return {
      size: cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 
        ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1) + '%' 
        : '0%',
    };
  }
}

export const serverCache = new MemoryCache();
export default serverCache;
