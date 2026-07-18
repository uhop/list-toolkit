// @ts-self-types="./deque.d.ts"

import ValueList from './value-list.js';
import {addAliases} from './meta-utils.js';
import {pushValuesFront, pushValuesBack} from './list-utils.js';

export class Deque {
  constructor(underlyingList = new ValueList()) {
    // accepts a list instance or a list class
    this.list = typeof underlyingList == 'function' ? new underlyingList() : underlyingList;
    this.size = this.list.getLength();
  }
  get isEmpty() {
    return this.list.isEmpty;
  }
  get front() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  get back() {
    return this.list.isEmpty ? undefined : this.list.back.value;
  }
  peekFront() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  peekBack() {
    return this.list.isEmpty ? undefined : this.list.back.value;
  }
  pushFront(value) {
    this.list.pushFront(value);
    ++this.size;
    return this;
  }
  pushBack(value) {
    this.list.pushBack(value);
    ++this.size;
    return this;
  }
  popFront() {
    if (!this.list.isEmpty) {
      --this.size;
      return this.list.popFront();
    }
    // return undefined;
  }
  popBack() {
    if (!this.list.isEmpty) {
      --this.size;
      return this.list.popBack();
    }
    // return undefined;
  }
  pushValuesFront(values) {
    pushValuesFront(this, values);
    return this;
  }
  pushValuesBack(values) {
    pushValuesBack(this, values);
    return this;
  }
  rotate(n = 1) {
    const size = this.size;
    if (size < 2) return this;
    n %= size;
    if (!n) return this;
    if (n < 0) n += size;
    if (n <= size >> 1) {
      for (let i = 0; i < n; ++i) this.list.pushFrontNode(this.list.popBackNode());
    } else {
      for (let i = size - n; i > 0; --i) this.list.pushBackNode(this.list.popFrontNode());
    }
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

addAliases(Deque.prototype, {
  pushFront: 'unshift, addFront',
  pushBack: 'push, add, addBack',
  popFront: 'shift, removeFront',
  popBack: 'pop, removeBack'
});

export default Deque;
