import {CacheLRU} from './cache-lru.js';

/** Random eviction cache. Evicts a randomly selected entry. */
export class CacheRandom<K = unknown, V = unknown> extends CacheLRU<K, V> {
  /** Next ID counter for random ordering. */
  nextId: number;

  /**
   * @param capacity - Maximum number of entries (default 10).
   */
  constructor(capacity?: number);

  /**
   * Reset all IDs and rebuild the internal heap.
   * @returns `this` for chaining.
   */
  resetIds(): this;
}

export default CacheRandom;
