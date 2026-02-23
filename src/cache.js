export * from './cache/cache-lru.js';
import Cache from './cache/cache-lru.js';
import decorator from './cache/decorator.js';

/**
 * Convenience decorator that wraps a property with LRU caching.
 * @param {object} object - Object owning the property.
 * @param {string} key - Property name.
 * @param {object} [cache] - Cache instance (default: new CacheLRU).
 * @returns {Function} The wrapped function.
 */
export const cacheDecorator = (object, key, cache = new Cache()) => decorator(object, key, cache);

export default Cache;
