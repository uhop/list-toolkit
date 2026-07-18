import {CacheLRU} from './cache-lru.js';

/**
 * CLOCK (second chance) cache. Reads only set a reference bit — the cheapest
 * possible read path, with no list bookkeeping. On eviction a hand sweeps the
 * ring: entries referenced since its last pass get a second chance (bit cleared),
 * the first unreferenced entry is evicted. Approximates LRU at FIFO cost.
 */
export class CacheClock<K = unknown, V = unknown> extends CacheLRU<K, V> {
  /**
   * @param capacity - Maximum number of entries (default 10).
   */
  constructor(capacity?: number);
}

export default CacheClock;
