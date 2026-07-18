import MinHeap from '../src/heap/min-heap.js';

// experimental 4-ary heap vs the binary MinHeap: shallower sift-downs, better locality —
// children of i are 4i+1..4i+4, parent is (i-1)>>2; sift-down comparisons unrolled like MinHeap's

const defaultLess = (a, b) => a < b;

const down4 = (array, i, less = defaultLess, n = array.length) => {
  for (;;) {
    const first = (i << 2) + 1;
    if (first >= n) break;
    let c = first,
      cValue = array[c];
    const s2 = first + 1,
      s3 = first + 2,
      s4 = first + 3;
    if (s2 < n) {
      const v = array[s2];
      if (less(v, cValue)) {
        c = s2;
        cValue = v;
      }
    }
    if (s3 < n) {
      const v = array[s3];
      if (less(v, cValue)) {
        c = s3;
        cValue = v;
      }
    }
    if (s4 < n) {
      const v = array[s4];
      if (less(v, cValue)) {
        c = s4;
        cValue = v;
      }
    }
    const iValue = array[i];
    if (!less(cValue, iValue)) break;
    array[i] = cValue;
    array[c] = iValue;
    i = c;
  }
  return array;
};

const up4 = (array, i, less = defaultLess) => {
  for (let p = (i - 1) >> 2; i > 0; i = p, p = (i - 1) >> 2) {
    const iValue = array[i],
      pValue = array[p];
    if (!less(iValue, pValue)) break;
    array[i] = pValue;
    array[p] = iValue;
  }
  return array;
};

class Heap4 {
  constructor(less = defaultLess) {
    this.less = less;
    this.array = [];
  }
  get isEmpty() {
    return !this.array.length;
  }
  push(value) {
    up4(this.array, this.array.push(value) - 1, this.less);
    return this;
  }
  pop() {
    switch (this.array.length) {
      case 0:
        return;
      case 1:
        return this.array.pop();
    }
    const top = this.array[0];
    this.array[0] = this.array.pop();
    down4(this.array, 0, this.less);
    return top;
  }
  pushPop(value) {
    if (!this.array.length || this.less(value, this.array[0])) return value;
    const top = this.array[0];
    this.array[0] = value;
    down4(this.array, 0, this.less);
    return top;
  }
  static build(array, less = defaultLess) {
    for (let n = array.length, j = (n - 2) >> 2; j >= 0; --j) down4(array, j, less, n);
    return array;
  }
}

export {Heap4};

const data = Array.from({length: 10_000}, () => Math.random());
const bigData = Array.from({length: 100_000}, () => Math.random());
const streamSeed = data.slice(0, 1_000);
const objData = Array.from({length: 10_000}, () => ({p: Math.random()}));
const objLess = (a, b) => a.p < b.p;

export default {
  'binary push+pop 10k': n => {
    const heap = new MinHeap();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  '4-ary push+pop 10k': n => {
    const heap = new Heap4();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  'binary build+drain 100k': n => {
    let out;
    for (let i = 0; i < n; ++i) {
      const heap = MinHeap.from(bigData.slice(0));
      while (!heap.isEmpty) out = heap.pop();
    }
    return out;
  },

  '4-ary build+drain 100k': n => {
    let out;
    for (let i = 0; i < n; ++i) {
      const heap = new Heap4();
      heap.array = Heap4.build(bigData.slice(0));
      while (!heap.isEmpty) out = heap.pop();
    }
    return out;
  },

  'binary obj push+pop 10k': n => {
    const heap = new MinHeap({less: objLess});
    for (let i = 0; i < n; ++i) {
      for (const value of objData) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  '4-ary obj push+pop 10k': n => {
    const heap = new Heap4(objLess);
    for (let i = 0; i < n; ++i) {
      for (const value of objData) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  'binary top-1k stream': n => {
    const heap = new MinHeap();
    for (const value of streamSeed) heap.push(value);
    let out;
    for (let i = 0; i < n; ++i) {
      for (const value of bigData) out = heap.pushPop(value);
    }
    return out;
  },

  '4-ary top-1k stream': n => {
    const heap = new Heap4();
    for (const value of streamSeed) heap.push(value);
    let out;
    for (let i = 0; i < n; ++i) {
      for (const value of bigData) out = heap.pushPop(value);
    }
    return out;
  }
};
