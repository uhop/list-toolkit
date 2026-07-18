// @ts-self-types="./queue.d.ts"

import ValueList from './value-list.js';
import {addAliases} from './meta-utils.js';
import {pushValuesBack} from './list-utils.js';

export class Queue {
  constructor(underlyingList = new ValueList()) {
    // accepts a list instance or a list class
    this.list = typeof underlyingList == 'function' ? new underlyingList() : underlyingList;
    this.size = this.list.getLength();
  }
  get isEmpty() {
    return this.list.isEmpty;
  }
  get top() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  get front() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  peek() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  add(value) {
    this.list.pushBack(value);
    ++this.size;
    return this;
  }
  remove() {
    if (!this.list.isEmpty) {
      --this.size;
      return this.list.popFront();
    }
    // return undefined;
  }
  addValues(values) {
    pushValuesBack(this, values);
    return this;
  }
  clear() {
    this.list.clear();
    this.size = 0;
    return this;
  }
  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
  getReverseIterator() {
    return this.list.getReverseIterator?.();
  }
  static from(values, underlyingList) {
    return new Queue(underlyingList).addValues(values);
  }
}

addAliases(Queue.prototype, {add: 'push, pushBack, enqueue', remove: 'pop, popFront, dequeue', addValues: 'pushValues'});

export default Queue;
