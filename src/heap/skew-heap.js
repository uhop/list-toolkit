// @ts-self-types="./skew-heap.d.ts"

import HeapBase from './basics.js';

// iterative top-down formulation of the recursive merge — identical decisions and
// resulting shape, O(1) auxiliary space instead of a worst-O(n) recursion stack
const merge = (a, b, less) => {
  if (!a) return b;
  if (!b) return a;
  if (less(b.value, a.value)) [a, b] = [b, a]; // swap

  const root = a;
  for (;;) {
    const temp = a.right;
    a.right = a.left;
    if (!temp) {
      a.left = b;
      return root;
    }
    if (less(temp.value, b.value)) {
      a.left = temp;
      a = temp;
    } else {
      a.left = b;
      a = b;
      b = temp;
    }
  }
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
    const node = new SkewHeapNode(this.value),
      stack = [[this, node]];
    while (stack.length) {
      const [source, copy] = stack.pop();
      if (source.left) {
        copy.left = new SkewHeapNode(source.left.value);
        stack.push([source.left, copy.left]);
      }
      if (source.right) {
        copy.right = new SkewHeapNode(source.right.value);
        stack.push([source.right, copy.right]);
      }
    }
    return node;
  }
}

export class SkewHeap extends HeapBase {
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
    if (!this.root || this.less(value, this.root.value)) return value;
    const z = this.root;
    this.root = merge(z.left, new SkewHeapNode(value), this.less);
    this.root = merge(this.root, z.right, this.less);
    return z.value;
  }
  replaceTop(value) {
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
    const heap = new SkewHeap(this);
    heap.root = this.root && this.root.clone();
    heap.size = this.size;
    return heap;
  }

  static from(array, options = HeapBase.defaults) {
    const heap = new SkewHeap(options);
    for (const value of array) heap.push(value);
    return heap;
  }
}

export default SkewHeap;
