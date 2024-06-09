'use strict';

import {addAlias} from '../meta-utils.js';
import MinHeap from '../min-heap.js';
import CacheLRU from './cache-lru.js';

// Evicts items randomly.

export class CacheRandom extends CacheLRU {
  constructor(capacity = 10) {
    super(capacity);
    this.heap = new MinHeap({less: (a, b) => a.value.id > b.value.id});
    this.nextId = 0;
  }
  use(key) {
    return this.dict.get(key);
  }
  update(node, value) {
    node.value.value = value;
    return this;
  }
  addNew(key, value) {
    this.list.pushFront({key, value, id: this.nextId++});
    const node = this.list.front;
    this.dict.set(key, node);
    this.heap.push(node);
    return node;
  }
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
    this.nextId = 0;
    return this;
  }
  resetIds() {
    this.nextId = 0;
    for (const item of this.heap) {
      item.id = this.nextId++;
    }
    const array = this.heap.array;
    this.heap.clear().merge(array);
    return this;
  }
}

addAlias(CacheRandom.prototype, 'remove', 'delete');

export default CacheRandom;
