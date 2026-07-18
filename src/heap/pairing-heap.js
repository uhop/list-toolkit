// @ts-self-types="./pairing-heap.d.ts"

import HeapBase from './basics.js';

// left-child right-sibling; prev = previous sibling, or the parent for a leftmost child

const meld = (a, b, less) => {
  if (less(b.value, a.value)) {
    const t = a;
    a = b;
    b = t;
  }
  b.prev = a;
  b.sibling = a.child;
  if (a.child) a.child.prev = b;
  a.child = b;
  return a;
};

const cut = node => {
  const prev = node.prev;
  if (prev.child === node) prev.child = node.sibling;
  else prev.sibling = node.sibling;
  if (node.sibling) node.sibling.prev = prev;
  node.prev = node.sibling = null;
  return node;
};

// two-pass pairing: pair adjacent siblings left to right, then meld right to left;
// pass 1 chains pair winners in reverse through their free sibling pointers — O(1) auxiliary space
const mergePairs = (node, less) => {
  if (!node) return null;
  let chain = null;
  while (node) {
    const a = node,
      b = a.sibling;
    if (!b) {
      a.prev = null;
      a.sibling = chain;
      chain = a;
      break;
    }
    node = b.sibling;
    a.prev = a.sibling = b.prev = b.sibling = null;
    const winner = meld(a, b, less);
    winner.sibling = chain;
    chain = winner;
  }
  let result = chain;
  chain = chain.sibling;
  result.sibling = null;
  while (chain) {
    const next = chain.sibling;
    chain.sibling = null;
    result = meld(chain, result, less);
    chain = next;
  }
  return result;
};

export class PairingHeapNode {
  constructor(value) {
    this.value = value;
    this.child = this.sibling = this.prev = null;
  }
}

export class PairingHeap extends HeapBase {
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
    const node = new PairingHeapNode(value);
    this.root = this.root ? meld(node, this.root, this.less) : node;
    ++this.size;
    return node;
  }
  pop() {
    const root = this.root;
    if (!root) return;
    this.root = mergePairs(root.child, this.less);
    root.child = null;
    --this.size;
    return root.value;
  }
  pushPop(value) {
    if (!this.root || this.less(value, this.root.value)) return value;
    const top = this.pop();
    this.push(value);
    return top;
  }
  update(node, isDecreased) {
    if (node === this.root) {
      if (isDecreased) return this;
      const rest = mergePairs(node.child, this.less);
      node.child = null;
      this.root = rest ? meld(node, rest, this.less) : node;
      return this;
    }
    cut(node);
    if (!isDecreased) {
      const children = mergePairs(node.child, this.less);
      node.child = null;
      if (children) this.root = meld(children, this.root, this.less);
    }
    this.root = meld(node, this.root, this.less);
    return this;
  }
  remove(node) {
    if (node === this.root) {
      this.pop();
      return this;
    }
    cut(node);
    const children = mergePairs(node.child, this.less);
    node.child = null;
    if (children) this.root = meld(children, this.root, this.less);
    --this.size;
    return this;
  }
  clear() {
    this.root = null;
    this.size = 0;
    return this;
  }
  merge(...args) {
    for (const item of args) {
      if (item instanceof PairingHeap) {
        if (item.root) {
          this.root = this.root ? meld(item.root, this.root, this.less) : item.root;
          this.size += item.size;
          item.root = null;
          item.size = 0;
        }
      } else if (item) {
        for (const value of item) this.push(value);
      }
    }
    return this;
  }
  clone() {
    const heap = new PairingHeap(this);
    heap.size = this.size;
    if (!this.root) return heap;
    const rootCopy = new PairingHeapNode(this.root.value),
      stack = [[this.root, rootCopy]];
    while (stack.length) {
      const [source, copy] = stack.pop();
      let prevCopy = null;
      for (let child = source.child; child; child = child.sibling) {
        const childCopy = new PairingHeapNode(child.value);
        if (prevCopy) {
          prevCopy.sibling = childCopy;
          childCopy.prev = prevCopy;
        } else {
          copy.child = childCopy;
          childCopy.prev = copy;
        }
        if (child.child) stack.push([child, childCopy]);
        prevCopy = childCopy;
      }
    }
    heap.root = rootCopy;
    return heap;
  }
  static from(values, options) {
    const heap = new PairingHeap(options);
    for (const value of values) heap.push(value);
    return heap;
  }
}

export default PairingHeap;
