import {CacheLRU} from './cache-lru.js';

/**
 * SLRU (Segmented LRU) cache. New entries land in a probationary segment; a hit
 * promotes an entry into the protected segment, whose overflow demotes its LRU
 * entry back to probation. Eviction takes the probationary LRU first, so one-shot
 * scans never displace the proven-hot protected entries (scan resistance).
 */
export class CacheSLRU<K = unknown, V = unknown> extends CacheLRU<K, V> {
  /** Maximum size of the protected segment. */
  protectedCapacity: number;
  /** Current size of the protected segment. */
  protectedSize: number;

  /**
   * @param capacity - Maximum number of entries (default 10).
   * @param protectedCapacity - Maximum protected-segment size (default 80% of capacity; clamped to `[1, capacity]`).
   */
  constructor(capacity?: number, protectedCapacity?: number);
}

export default CacheSLRU;
