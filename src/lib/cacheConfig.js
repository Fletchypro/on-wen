/**
 * Cache Configuration Constants
 * Used throughout the application to maintain consistent caching strategies.
 */

// 1 Year in seconds
export const CACHE_LONG_TERM = 31536000;

// 1 Month in seconds
export const CACHE_MEDIUM_TERM = 2592000;

// 1 Day in seconds
export const CACHE_SHORT_TERM = 86400;

// 1 Hour in seconds
export const CACHE_VERY_SHORT_TERM = 3600;

/**
 * Helper to generate standard Cache-Control header strings
 * @param {string} strategy - 'long', 'medium', 'short', 'no-store'
 * @returns {string} Cache-Control header value
 */
export const getCacheHeader = (strategy) => {
  switch (strategy) {
    case 'long':
      return `public, max-age=${CACHE_LONG_TERM}, immutable`;
    case 'medium':
      return `public, max-age=${CACHE_MEDIUM_TERM}`;
    case 'short':
      return `public, max-age=${CACHE_SHORT_TERM}, must-revalidate`;
    case 'no-store':
      return 'no-store, no-cache, must-revalidate, proxy-revalidate';
    default:
      return `public, max-age=${CACHE_SHORT_TERM}`;
  }
};

/**
 * Cache Busting Strategy Documentation
 * 
 * 1. Build Artifacts (JS/CSS):
 *    - Handled by Vite's build process which appends content hashes (e.g., index.a1b2c3.js).
 *    - Strategy: Long-term cache (1 year/immutable).
 *    - Busting: Happens automatically on new builds because filenames change.
 * 
 * 2. Static Images:
 *    - Strategy: Long-term cache.
 *    - Busting: Requires manual renaming or query parameters (e.g., logo.png?v=2) if the file content changes but name stays same.
 * 
 * 3. HTML (Index):
 *    - Strategy: Short-term cache (1 day) or Network-First.
 *    - Reason: Needs to point to the new hashed JS/CSS files immediately after deployment.
 * 
 * 4. API Responses:
 *    - Strategy: Variable. Dynamic data usually uses 'no-store' or very short cache.
 */

export const CACHE_CONFIG = {
  version: 'v1.0.0',
  strategies: {
    static: 'cache-first',
    api: 'network-first',
    html: 'network-first'
  }
};