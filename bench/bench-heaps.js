import MinHeap from '../src/heap/min-heap.js';
import LeftistHeap from '../src/heap/leftist-heap.js';
import SkewHeap, {SkewHeapNode} from '../src/heap/skew-heap.js';
import PairingHeap, {PairingHeapNode} from '../src/heap/pairing-heap.js';

const data = Array.from({length: 10_000}, () => Math.random());

// the pre-2026-07-18 recursive skew merge and array-based two-pass pairing, for comparison

const less = (a, b) => a < b;

const mergeRec = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  if (less(b.value, a.value)) [a, b] = [b, a];
  const temp = a.right;
  a.right = a.left;
  a.left = mergeRec(b, temp);
  return a;
};

class SkewHeapRec {
  constructor() {
    this.root = null;
  }
  get isEmpty() {
    return !this.root;
  }
  push(value) {
    this.root = mergeRec(this.root, new SkewHeapNode(value));
    return this;
  }
  pop() {
    const z = this.root;
    this.root = mergeRec(z.left, z.right);
    return z.value;
  }
}

const meld = (a, b) => {
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

const mergePairsArr = node => {
  if (!node) return null;
  const pairs = [];
  while (node) {
    const a = node,
      b = a.sibling;
    if (!b) {
      a.prev = a.sibling = null;
      pairs.push(a);
      break;
    }
    node = b.sibling;
    a.prev = a.sibling = b.prev = b.sibling = null;
    pairs.push(meld(a, b));
  }
  let result = pairs[pairs.length - 1];
  for (let i = pairs.length - 2; i >= 0; --i) result = meld(pairs[i], result);
  return result;
};

class PairingHeapArr {
  constructor() {
    this.root = null;
  }
  get isEmpty() {
    return !this.root;
  }
  push(value) {
    const node = new PairingHeapNode(value);
    this.root = this.root ? meld(node, this.root) : node;
    return node;
  }
  pop() {
    const root = this.root;
    this.root = mergePairsArr(root.child);
    root.child = null;
    return root.value;
  }
}

export default {
  MinHeap: n => {
    const heap = new MinHeap();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  LeftistHeap: n => {
    const heap = new LeftistHeap();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  SkewHeap: n => {
    const heap = new SkewHeap();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  PairingHeap: n => {
    const heap = new PairingHeap();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  'SkewHeap (old recursive)': n => {
    const heap = new SkewHeapRec();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  'PairingHeap (old array pairing)': n => {
    const heap = new PairingHeapArr();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  }
};
