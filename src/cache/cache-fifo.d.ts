import {CacheLRU} from './cache-lru.js';

/** FIFO (First In First Out) cache. Evicts the oldest entry. */
export class CacheFIFO<K = unknown, V = unknown> extends CacheLRU<K, V> {}

export default CacheFIFO;
