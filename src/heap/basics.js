'use strict';

import {copyOptions} from '../meta-utils.js';

const defaultLess = (a, b) => a < b;
const defaultEqual = (a, b) => a === b;

export class HeapBase {
  constructor(options) {
    copyOptions(this, HeapBase.defaults, options);
  }

  // main methods
  get isEmpty() {
    throw new Error('Not implemented');
  }
  get top() {
    throw new Error('Not implemented');
  }
  peek() {
    return this.top;
  }
  pop() {
    throw new Error('Not implemented');
  }
  push() {
    throw new Error('Not implemented');
  }
  clear() {
    throw new Error('Not implemented');
  }

  // performance methods
  pushPop(value) {
    this.push(value);
    return this.pop();
  }
  replaceTop(value) {
    const z = this.pop();
    this.push(value);
    return z;
  }

  // helper methods
  merge(...args) {
    throw new Error('Not implemented');
  }
  clone() {
    throw new Error('Not implemented');
  }
  make(...args) {
    return new this.constructor(this, ...args);
  }
}

HeapBase.defaults = {less: defaultLess, equal: defaultEqual, compare: null};

export default HeapBase;
