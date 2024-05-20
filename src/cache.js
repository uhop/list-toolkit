'use strict';

import ValueList from './value-list.js';

export class Cache {
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.size = 0;
    this.list = new ValueList();
    this.dict = {};
  }
  find(key) {
    const node = this.dict[key];
    if (typeof node == 'object') {
      return node.value.value;
    }
  }
  remove(key) {
    const node = this.dict[key];
    if (typeof node == 'object') {
      delete this.dict[key];
      this.list.remove(node);
      --this.size;
    }
    return this;
  }
  register(key, value) {
    const node = this.dict[key];
    if (typeof node == 'object') {
      this.list.moveToFront(node);
      node.value.value = value;
      return this;
    }
    if (this.size >= this.capacity) {
      const node = this.list.back;
      this.list.moveToFront(node);
      delete this.dict[node.value.key];
      this.dict[key] = node;
      node.value = {key, value};
      return this;
    }
    this.list.pushFront({key, value});
    ++this.size;
    this.dict[key] = this.list.front;
    return this;
  }
  clear() {
    this.dict = {};
    this.list.clear();
    this.size = 0;
    return this;
  }
  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
  getReverseIterator() {
    return this.list.getReverseIterator();
  }
}

export default Cache;
