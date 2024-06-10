'use strict';

import ValueList from './value-list.js';
import {addAliases} from './meta-utils.js';
import {pushValuesBack} from './list-utils.js';

export class Queue {
  constructor(underlyingList = new ValueList()) {
    this.list = underlyingList;
    this.size = this.list.getLength();
  }
  get isEmpty() {
    return this.list.isEmpty;
  }
  get top() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  peek() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  add(value) {
    this.list.pushBack(value);
    ++this.size;
  }
  remove() {
    if (!this.list.isEmpty) {
      --this.size;
      return this.list.popFront().value;
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
}

addAliases(Queue.prototype, {add: 'push, pushBack, enqueue', remove: 'pop, popFront, dequeue'});

export default Queue;
