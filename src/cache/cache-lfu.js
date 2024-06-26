'use strict';

import {addAlias} from '../meta-utils.js';
import MinHeap from '../heap/min-heap.js';
import CacheLRU from './cache-lru.js';

// Evicts the least frequently used items.

export class CacheLFU extends CacheLRU {
  constructor(capacity = 10) {
    super(capacity);
    this.heap = new MinHeap({less: (a, b) => a.value.counter < b.value.counter});
  }
  use(key) {
    const node = this.dict.get(key);
    if (node) ++node.value.counter;
    return node;
  }
  update(node, value) {
    node.value.counter = 1;
    node.value.value = value;
    return this;
  }
  addNew(key, value) {
    this.list.pushFront({key, value, counter: 1});
    const node = this.list.front;
    this.dict.set(key, node);
    this.heap.push(node);
    return node;
  }
  evictAndReplace(key, value) {
    const node = this.heap.top;
    this.dict.delete(node.value.key);
    node.value = {key, value, counter: 1};
    this.dict.set(key, node);
    this.heap.updateTop();
    return node;
  }
  remove(key) {
    const node = this.dict.get(key);
    if (node) {
      this.dict.delete(key);
      this.list.removeNode(node);
      this.heap.remove(node);
    }
    return this;
  }
  clear() {
    super.clear();
    this.heap.clear();
    return this;
  }
  resetCounters(initialValue = 1) {
    for (const item of this.heap) {
      item.counter = initialValue;
    }
    return this;
  }
}

addAlias(CacheLFU.prototype, 'remove', 'delete');

export default CacheLFU;
