import {CacheLRU, CacheOptions} from './cache-lru.js';

/** LFU (Least Frequently Used) cache. Evicts the least frequently accessed entry; ties are broken by evicting the least recently used among them. All operations are O(1). */
export class CacheLFU<K = unknown, V = unknown> extends CacheLRU<K, V> {
  /**
   * @param capacity - Maximum number of entries (default 10).
   */
  constructor(capacity?: number | CacheOptions);

  /**
   * Reset all frequency counters to a given value.
   * @param initialValue - Counter value to set (default 1).
   * @returns `this` for chaining.
   */
  resetCounters(initialValue?: number): this;
}

export default CacheLFU;
