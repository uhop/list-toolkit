import CacheLRU from './cache-lru.js';

/**
 * FIFO (First In First Out) cache. Evicts the oldest entry.
 * Extends {@link CacheLRU} with FIFO eviction policy.
 */
export class CacheFIFO extends CacheLRU {
  /** @override */
  use(key) {
    return this.dict.get(key);
  }
  /** @override */
  addNew(key, value) {
    this.list.pushBack({key, value});
    const node = this.list.back;
    this.dict.set(key, node);
    return node;
  }
  /** @override */
  evictAndReplace(key, value) {
    const node = this.list.front;
    this.list.moveToBack(node);
    this.dict.delete(node.value.key);
    this.dict.set(key, node);
    node.value = {key, value};
    return node;
  }
}

export default CacheFIFO;
