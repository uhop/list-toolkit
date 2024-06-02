'use strict';

import ValueList from './value-list.js';
import {addAlias} from './meta-utils.js';
import {pushValuesFront} from './list-utils.js';

export class Stack {
  constructor(UnderlyingList = ValueList) {
    this.size = 0;
    this.list = new UnderlyingList();
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
      return this.list.popFront().value;
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
}

addAlias(Stack, 'push', 'pushFront');

export default Stack;
