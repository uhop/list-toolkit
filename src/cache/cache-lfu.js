'use strict';

import {addAlias} from '../meta-utils.js';
import MinHeap from '../min-heap.js';
import CacheLRU from './cache-lru.js';

// Evicts on the first-in-first-out basis.

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
    this.heap.replaceTop(node);
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

addAlias(CacheLFU, 'delete', 'remove');

export default CacheLFU;
