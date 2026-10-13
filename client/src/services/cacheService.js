/**
 * cacheService.js - Enterprise In-Memory TTL Cache Manager
 * 
 * Provides instantaneous 0ms client-side data retrieval, configurable TTLs,
 * and pattern-based cache invalidation (MoonPulse Architecture Pattern).
 */

const cache = new Map();

export const CACHE_TTL = {
  METADATA: 5 * 60 * 1000,   // 5 minutes (Categories, Brands, Attributes)
  PRODUCTS: 2 * 60 * 1000,   // 2 minutes (Product lists)
  DETAIL: 3 * 60 * 1000,     // 3 minutes (Single item details)
  DASHBOARD: 1 * 60 * 1000,  // 1 minute (Dashboard analytics)
};

class CacheService {
  /**
   * Store data in cache with a TTL
   * @param {string} key 
   * @param {*} data 
   * @param {number} ttlMs (default: 2 minutes)
   */
  set(key, data, ttlMs = CACHE_TTL.PRODUCTS) {
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
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp >= item.ttl;
    if (isExpired) {
      cache.delete(key);
      return null;
    }

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
   * Example: invalidate('products') removes 'products_list', 'products_detail_1', etc.
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
   * Clear all items from the in-memory cache
   */
  clear() {
    cache.clear();
  }

  /**
   * Get total number of active cached items
   * @returns {number}
   */
  size() {
    return cache.size;
  }
}

export const cacheService = new CacheService();
export default cacheService;
