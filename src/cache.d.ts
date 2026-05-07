export * from './cache/cache-lru.js';
import Cache from './cache/cache-lru.js';
import {WrappedFn} from './cache/decorator.js';

/**
 * Convenience wrapper around the cache decorator. Replaces `object[key]` with
 * a memoized wrapper backed by `cache`.
 * @param object - Object owning the method.
 * @param key - Method name.
 * @param cache - Cache instance (default: new CacheLRU).
 * @returns The wrapped function (with `.fn` for the original and `.cache` for the cache).
 */
export function cacheDecorator(object: object, key: PropertyKey, cache?: Cache): WrappedFn<any>;

export default Cache;
