'use strict';

import HeapBase from './basics.js';

const defaultLess = (a, b) => a < b;

const merge = (a, b, less) => {
  if (!a) return b;
  if (!b) return a;
  if (less(b.value, a.value)) [a, b] = [b, a]; // swap

  a.right = merge(a.right, b, less);

  if (!a.left) {
    [a.left, a.right] = [a.right, a.left]; // swap
    a.s = 1;
    return a;
  }

  if (a.left.s < a.right.s) {
    [a.left, a.right] = [a.right, a.left]; // swap
  }
  a.s = a.right.s + 1;
  return a;
};

export class LeftistHeapNode {
  constructor(value) {
    this.value = value;
    this.right = this.left = null;
    this.s = 1;
  }
  clear() {
    this.left = this.right = null;
    this.s = 1;
  }
  clone() {
    const node = new LeftistHeapNode(this.value);
    node.left = this.left && this.left.clone();
    node.right = this.right && this.right.clone();
    return node;
  }
}

export class LeftistHeap extends HeapBase {
  constructor(options, ...args) {
    super(options);
    if (typeof this.compare == 'function') {
      this.less = (a, b) => this.compare(a, b) < 0;
    }
    this.root = null;
    this.size = 0;
    if (args.length) this.merge(...args);
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
    this.root = merge(this.root, new LeftistHeapNode(value), this.less);
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
    if (!this.root || this.less(value, this.root.value)) return value;
    const z = this.root;
    this.root = merge(z.left, new LeftistHeapNode(value), this.less);
    this.root = merge(this.root, z.right, this.less);
    return z.value;
  }
  replaceTop(value) {
    if (!this.root) {
      this.root = new LeftistHeapNode(value);
      this.size = 1;
      return; // undefined
    }
    const z = this.root;
    this.root = merge(z.left, new LeftistHeapNode(value), this.less);
    this.root = merge(this.root, z.right, this.less);
    return z.value;
  }
  clear() {
    this.root = null;
    this.size = 0;
    return this;
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
  clone() {
    const heap = new LeftistHeap(this);
    heap.root = this.root && this.root.clone();
    heap.size = this.size;
    return heap;
  }

  static from(array, options = HeapBase.defaults) {
    const heap = new LeftistHeap(options);
    for (const value of array) heap.push(value);
    return heap;
  }
}

export default LeftistHeap;
