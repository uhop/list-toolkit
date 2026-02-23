import {addAlias} from '../meta-utils.js';
import MinHeap from '../heap/min-heap.js';
import CacheLRU from './cache-lru.js';

/**
 * LFU (Least Frequently Used) cache. Evicts the least frequently accessed entry.
 * Extends {@link CacheLRU} with a min-heap for frequency tracking.
 */
export class CacheLFU extends CacheLRU {
  /** @param {number} [capacity=10] - Maximum number of entries. */
  constructor(capacity = 10) {
    super(capacity);
    this.heap = new MinHeap({less: (a, b) => a.value.counter < b.value.counter});
  }
  /** @override */
  use(key) {
    const node = this.dict.get(key);
    if (node) ++node.value.counter;
    return node;
  }
  /** @override */
  update(node, value) {
    node.value.counter = 1;
    node.value.value = value;
    return this;
  }
  /** @override */
  addNew(key, value) {
    this.list.pushFront({key, value, counter: 1});
    const node = this.list.front;
    this.dict.set(key, node);
    this.heap.push(node);
    return node;
  }
  /** @override */
  evictAndReplace(key, value) {
    const node = this.heap.top;
    this.dict.delete(node.value.key);
    node.value = {key, value, counter: 1};
    this.dict.set(key, node);
    this.heap.updateTop();
    return node;
  }
  /** @override */
  remove(key) {
    const node = this.dict.get(key);
    if (node) {
      this.dict.delete(key);
      this.list.removeNode(node);
      this.heap.remove(node);
    }
    return this;
  }
  /** @override */
  clear() {
    super.clear();
    this.heap.clear();
    return this;
  }
  /**
   * Reset all frequency counters.
   * @param {number} [initialValue=1] - Value to set all counters to.
   * @returns {CacheLFU} `this` for chaining.
   */
  resetCounters(initialValue = 1) {
    for (const item of this.heap.array) {
      item.value.counter = initialValue;
    }
    return this;
  }
}

addAlias(CacheLFU.prototype, 'remove', 'delete');

export default CacheLFU;
