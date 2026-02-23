import HeapBase from './basics.js';

const merge = (a, b, less) => {
  if (!a) return b;
  if (!b) return a;
  if (less(b.value, a.value)) [a, b] = [b, a]; // swap

  const temp = a.right;
  a.right = a.left;
  a.left = merge(b, temp, less);

  return a;
};

/** Node for a skew heap. */
export class SkewHeapNode {
  /** @param {*} value - Value to store. */
  constructor(value) {
    this.value = value;
    this.right = this.left = null;
  }
  /** Reset child links. */
  clear() {
    this.left = this.right = null;
  }
  /**
   * Deep-clone this node and its subtree.
   * @returns {SkewHeapNode} A new node tree.
   */
  clone() {
    const node = new SkewHeapNode(this.value);
    node.left = this.left && this.left.clone();
    node.right = this.right && this.right.clone();
    return node;
  }
}

/** Skew heap — a self-adjusting merge-based min-heap. */
export class SkewHeap extends HeapBase {
  /**
   * @param {object} [options] - Ordering options (`less`, `compare`).
   * @param {...SkewHeap} args - Initial heaps to merge.
   */
  constructor(options, ...args) {
    super(options);
    if (typeof this.compare == 'function') {
      this.less = (a, b) => this.compare(a, b) < 0;
    }
    this.root = null;
    this.size = 0;
    if (args.length) this.merge(...args);
  }
  /** Whether the heap has no elements. */
  get isEmpty() {
    return !this.root;
  }
  /** The number of elements. */
  get length() {
    return this.size;
  }
  /** The minimum element without removing it. */
  get top() {
    return this.root ? this.root.value : undefined;
  }
  /**
   * Alias for `top`.
   * @returns {*} The minimum element.
   */
  peek() {
    return this.root ? this.root.value : undefined;
  }
  /**
   * Add an element.
   * @param {*} value - Element to add.
   * @returns {SkewHeap} `this` for chaining.
   */
  push(value) {
    this.root = merge(this.root, new SkewHeapNode(value), this.less);
    ++this.size;
    return this;
  }
  /**
   * Remove and return the minimum element.
   * @returns {*} The removed element, or `undefined` if empty.
   */
  pop() {
    if (!this.root) return;
    const z = this.root;
    this.root = merge(this.root.left, this.root.right, this.less);
    --this.size;
    return z.value;
  }
  /**
   * Push then pop in one operation.
   * @param {*} value - Element to push.
   * @returns {*} The popped element.
   */
  pushPop(value) {
    if (!this.root || this.less(value, this.root.value)) return value;
    const z = this.root;
    this.root = merge(z.left, new SkewHeapNode(value), this.less);
    this.root = merge(this.root, z.right, this.less);
    return z.value;
  }
  /**
   * Pop then push in one operation.
   * @param {*} value - Element to push.
   * @returns {*} The previously minimum element, or `undefined` if was empty.
   */
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
  /**
   * Remove all elements.
   * @returns {SkewHeap} `this` for chaining.
   */
  clear() {
    this.root = null;
    this.size = 0;
    return this;
  }
  /**
   * Merge one or more heaps into this heap, consuming them.
   * @param {...SkewHeap} args - Heaps to merge.
   * @returns {SkewHeap} `this` for chaining.
   */
  merge(...args) {
    for (const other of args) {
      this.root = merge(this.root, other.root, this.less);
      this.size += other.size;
      other.root = null;
      other.size = 0;
    }
    return this;
  }
  /**
   * Create a deep copy of this heap.
   * @returns {SkewHeap} A new SkewHeap with cloned nodes.
   */
  clone() {
    const heap = new SkewHeap(this);
    heap.root = this.root && this.root.clone();
    heap.size = this.size;
    return heap;
  }

  /**
   * Build a SkewHeap from an iterable.
   * @param {Iterable} array - Elements to insert.
   * @param {object} [options] - Ordering options.
   * @returns {SkewHeap} A new SkewHeap.
   */
  static from(array, options = HeapBase.defaults) {
    const heap = new SkewHeap(options);
    for (const value of array) heap.push(value);
    return heap;
  }
}

export default SkewHeap;
