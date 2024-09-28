'use strict';

import {copyOptions} from '../meta-utils.js';

const defaultLess = (a, b) => a < b;

const merge = (a, b, less) => {
  if (!a) return b;
  if (!b) return a;
  if (less(b.value, a.value)) [a, b] = [b, a]; // swap

  const temp = a.right;
  a.right = a.left;
  a.left = merge(b, temp, less);

  return a;
};

export class SkewHeapNode {
  constructor(value) {
    this.value = value;
    this.right = this.left = null;
  }
  clear() {
    this.left = this.right = null;
  }
  clone() {
    const node = new SkewHeapNode(this.value);
    node.left = this.left && this.left.clone();
    node.right = this.right && this.right.clone();
    return node;
  }
}

export class SkewHeap {
  constructor(options, ...args) {
    copyOptions(this, SkewHeap.defaults, options);
    if (typeof this.compare == 'function') {
      this.less = (a, b) => this.compare(a, b) < 0;
    }
    this.root = null;
    this.size = 0;
    this.merge(...args);
  }
  get isEmpty() {
    return !this.root;
  }
  get length() {
    return this.size;
  }
  get top() {
    return this.root ? this.root.value : undefined;
  }
  peek() {
    return this.root ? this.root.value : undefined;
  }
  push(value) {
    this.root = merge(this.root, new SkewHeapNode(value), this.less);
    ++this.size;
    return this;
  }
  pop() {
    if (!this.root) return;
    const z = this.root;
    this.root = merge(this.root.left, this.root.right, this.less);
    --this.size;
    return z.value;
  }
  pushPop(value) {
    // this.push(value);
    // return this.pop();
    if (!this.root || this.less(value, this.root.value)) return value;
    const z = this.root;
    this.root = merge(z.left, new SkewHeapNode(value), this.less);
    this.root = merge(this.root, z.right, this.less);
    return z.value;
  }
  replaceTop(value) {
    // const z = this.pop();
    // this.push(value);
    // return z;
    if (!this.root) {
      this.root = new SkewHeapNode(value);
      this.size = 1;
      return; // undefined
    }
    const z = this.root;
    this.root = merge(z.left, new SkewHeapNode(value), this.less);
    this.root = merge(this.root, z.right, this.less);
    return z.value;
  }
  merge(...args) {
    for (const other of args) {
      this.root = merge(this.root, other.root, this.less);
      this.size += other.size;
      other.root = null;
      other.size = 0;
    }
    return this;
  }
  make(...args) {
    return new SkewHeap(this, ...args);
  }
  clone() {
    const heap = new SkewHeap(this);
    heap.root = this.root && this.root.clone();
    heap.size = this.size;
    return heap;
  }
}

SkewHeap.defaults = {less: defaultLess, compare: null};

export default SkewHeap;
