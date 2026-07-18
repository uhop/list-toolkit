// @ts-self-types="./stack.d.ts"

import ValueList from './value-list.js';
import {addAliases} from './meta-utils.js';
import {pushValuesFront} from './list-utils.js';

export class Stack {
  constructor(underlyingList = ValueList) {
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
  peek() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  push(value) {
    this.list.pushFront(value);
    ++this.size;
    return this;
  }
  pop() {
    if (!this.list.isEmpty) {
      --this.size;
      return this.list.popFront();
    }
    // return undefined;
  }
  pushValues(values) {
    pushValuesFront(this, values);
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
    return new Stack(underlyingList).pushValues(values);
  }
}

addAliases(Stack.prototype, {push: 'pushFront, add', pop: 'remove', pushValues: 'addValues'});

export default Stack;
