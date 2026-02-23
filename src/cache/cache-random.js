import {addAlias} from '../meta-utils.js';
import MinHeap from '../heap/min-heap.js';
import CacheLRU from './cache-lru.js';

/**
 * Random eviction cache. Evicts a randomly chosen entry.
 * Extends {@link CacheLRU} with random eviction via a min-heap.
 */
export class CacheRandom extends CacheLRU {
  /** @param {number} [capacity=10] - Maximum number of entries. */
  constructor(capacity = 10) {
    super(capacity);
    this.heap = new MinHeap({less: (a, b) => a.value.id > b.value.id});
    this.nextId = 0;
  }
  /** @override */
  use(key) {
    return this.dict.get(key);
  }
  /** @override */
  update(node, value) {
    node.value.value = value;
    return this;
  }
  /** @override */
  addNew(key, value) {
    this.list.pushFront({key, value, id: this.nextId++});
    const node = this.list.front;
    this.dict.set(key, node);
    this.heap.push(node);
    return node;
  }
  /** @override */
  evictAndReplace(key, value) {
    const index = Math.floor(this.heap.length * Math.random());

    const node = this.heap.array[index],
      isDecreased = value > node.value.value;

    this.dict.delete(node.value.key);
    this.dict.set(key, node);

    node.value.key = key;
    node.value.value = value;

    this.heap.updateByIndex(index, isDecreased);

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
    this.nextId = 0;
    return this;
  }
  /**
   * Reset all internal IDs and rebuild the heap.
   * @returns {CacheRandom} `this` for chaining.
   */
  resetIds() {
    this.nextId = 0;
    for (const item of this.heap.array) {
      item.value.id = this.nextId++;
    }
    const array = this.heap.array;
    this.heap.clear().merge(array);
    return this;
  }
}

addAlias(CacheRandom.prototype, 'remove', 'delete');

export default CacheRandom;
