import {CacheLRU} from './cache-lru.js';

/** A wrapped function with attached cache and original function reference. */
export interface WrappedFn<F extends (...args: any[]) => any, K = unknown, V = unknown> {
  (...args: Parameters<F>): ReturnType<F>;
  /** The original unwrapped function. */
  fn: F;
  /** The cache backing this wrapper. */
  cache: CacheLRU<K, V>;
}

/**
 * Wrap a function with caching. The first argument is used as the cache key.
 * @param fn - Function to wrap.
 * @param cache - Cache instance to use.
 * @returns A wrapped function with `.fn` and `.cache` properties.
 */
export function decorateFn<F extends (...args: any[]) => any>(fn: F, cache: CacheLRU): WrappedFn<F>;

/**
 * Decorate an own property descriptor's `value` with caching.
 * @param object - Object owning the property.
 * @param key - Property name.
 * @param cache - Cache instance to use.
 * @returns The wrapped function.
 */
export function decorate(object: object, key: PropertyKey, cache: CacheLRU): WrappedFn<any>;

/**
 * Decorate a method on an object with caching (direct assignment).
 * @param object - Object owning the method.
 * @param key - Method name.
 * @param cache - Cache instance to use.
 * @returns The wrapped function.
 */
export function decorateMethod(object: object, key: PropertyKey, cache: CacheLRU): WrappedFn<any>;

/**
 * Retrieve the cache from a previously decorated property.
 * @param object - Object owning the property.
 * @param key - Property name.
 * @returns The cache instance.
 */
export function getCache(object: object, key: PropertyKey): CacheLRU;

export default decorate;
