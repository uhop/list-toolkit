'use strict';

import ValueList from './value-list.js';
import {addAlias} from './meta-utils.js';

export class Cache {
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.list = new ValueList();
    this.dict = new Map();
  }
  get isEmpty() {
    return this.list.isEmpty;
  }
  get size() {
    return this.dict.size;
  }
  find(key) {
    const node = this.dict.get(key);
    return typeof node == 'object' ? node.value.value : undefined;
  }
  remove(key) {
    const node = this.dict.get(key);
    if (typeof node == 'object') {
      this.dict.delete(key);
      this.list.removeNode(node);
    }
    return this;
  }
  register(key, value) {
    const node = this.dict.get(key);
    if (typeof node == 'object') {
      this.list.moveToFront(node);
      node.value.value = value;
      return this;
    }
    if (this.dict.size >= this.capacity) {
      const node = this.list.back;
      this.list.moveToFront(node);
      this.dict.delete(node.value.key);
      this.dict.set(key, node);
      node.value = {key, value};
      return this;
    }
    this.list.pushFront({key, value});
    this.dict.set(key, this.list.front);
    return this;
  }
  clear() {
    this.dict.clear();
    this.list.clear();
    return this;
  }
  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
  getReverseIterator() {
    return this.list.getReverseIterator();
  }
}

addAlias(Cache, 'add', 'register');

export default Cache;
