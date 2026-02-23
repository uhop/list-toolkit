export * from './cache/cache-lru.js';
import Cache from './cache/cache-lru.js';

/**
 * Convenience wrapper around the cache decorator.
 * @param object - Object owning the method.
 * @param key - Method name.
 * @param cache - Cache instance (default: new CacheLRU).
 * @returns The wrapped function.
 */
export function cacheDecorator(object: object, key: PropertyKey, cache?: Cache): object;

export default Cache;
