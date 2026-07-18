// @ts-self-types="./indexed-heap.d.ts"

import HeapBase from './basics.js';
import {copyOptions, lessFromCompare} from '../meta-utils.js';

// hole-style sifts: one index stamp per moved element

const up = (array, i, less, indexName) => {
  const value = array[i];
  for (let p = (i - 1) >> 1; i > 0; i = p, p = (i - 1) >> 1) {
    const pValue = array[p];
    if (!less(value, pValue)) break;
    array[i] = pValue;
    pValue[indexName] = i;
  }
  array[i] = value;
  value[indexName] = i;
  return array;
};

const down = (array, i, less, indexName, n = array.length) => {
  const value = array[i];
  for (;;) {
    const l = (i << 1) + 1;
    if (l >= n) break;
    const r = l + 1,
      c = r < n && less(array[r], array[l]) ? r : l,
      cValue = array[c];
    if (!less(cValue, value)) break;
    array[i] = cValue;
    cValue[indexName] = i;
    i = c;
  }
  array[i] = value;
  value[indexName] = i;
  return array;
};

export class IndexedHeap extends HeapBase {
  constructor(options, ...args) {
    super(options);
    copyOptions(this, IndexedHeap.defaults, options);
    if (typeof this.compare == 'function') this.less = lessFromCompare(this.compare);
    this.array = [];
    if (args.length) this.merge(...args);
  }

  get length() {
    return this.array.length;
  }

  get isEmpty() {
    return !this.array.length;
  }

  get top() {
    return this.array[0];
  }

  peek() {
    return this.array[0];
  }

  findIndex(value) {
    const i = value ? value[this.indexName] : -1;
    return typeof i == 'number' && i >= 0 && i < this.array.length && this.array[i] === value ? i : -1;
  }

  has(value) {
    return this.findIndex(value) >= 0;
  }

  push(value) {
    this.array.push(value);
    up(this.array, this.array.length - 1, this.less, this.indexName);
    return this;
  }

  pop() {
    const array = this.array;
    switch (array.length) {
      case 0:
        return;
      case 1: {
        const top = array.pop();
        top[this.indexName] = -1;
        return top;
      }
    }
    const top = array[0];
    array[0] = array.pop();
    down(array, 0, this.less, this.indexName);
    top[this.indexName] = -1;
    return top;
  }

  pushPop(value) {
    if (!this.array.length || this.less(value, this.array[0])) return value;
    return this.replaceTop(value);
  }

  replaceTop(value) {
    const top = this.array[0];
    this.array[0] = value;
    down(this.array, 0, this.less, this.indexName);
    if (top) top[this.indexName] = -1;
    return top;
  }

  siftFrom(index) {
    const array = this.array;
    if (index > 0 && this.less(array[index], array[(index - 1) >> 1])) up(array, index, this.less, this.indexName);
    else down(array, index, this.less, this.indexName);
    return this;
  }

  update(value, isDecreased) {
    const i = this.findIndex(value);
    if (i < 0) return this;
    if (isDecreased === undefined) return this.siftFrom(i);
    (isDecreased ? up : down)(this.array, i, this.less, this.indexName);
    return this;
  }

  updateTop() {
    if (this.array.length) down(this.array, 0, this.less, this.indexName);
    return this;
  }

  remove(value) {
    const i = this.findIndex(value);
    return i < 0 ? this : this.removeByIndex(i);
  }

  removeByIndex(index) {
    const array = this.array;
    if (index < 0 || index >= array.length) return this;
    const removed = array[index],
      last = array.pop();
    if (index < array.length) {
      array[index] = last;
      this.siftFrom(index);
    }
    removed[this.indexName] = -1;
    return this;
  }

  replace(value, newValue) {
    const i = this.findIndex(value);
    if (i < 0) return this;
    this.array[i] = newValue;
    value[this.indexName] = -1;
    return this.siftFrom(i);
  }

  replaceByIndex(index, newValue) {
    const array = this.array;
    if (index < 0 || index >= array.length) return this;
    array[index][this.indexName] = -1;
    array[index] = newValue;
    return this.siftFrom(index);
  }

  merge(...args) {
    if (!args.length) return this;
    for (const item of args) {
      if (item instanceof IndexedHeap) {
        this.array = this.array.concat(item.array);
        item.array = []; // move semantics: an element tracks one position per index name
      } else if (item) {
        this.array = this.array.concat(Array.isArray(item) ? item : Array.from(item));
      }
    }
    return this.build();
  }

  build() {
    const array = this.array,
      n = array.length,
      indexName = this.indexName;
    for (let i = 0; i < n; ++i) array[i][indexName] = i;
    for (let j = (n >> 1) - 1; j >= 0; --j) down(array, j, this.less, indexName, n);
    return this;
  }

  clear() {
    this.array = [];
    return this;
  }

  releaseSorted() {
    const array = this.array;
    for (let n = array.length - 1; n > 0; --n) {
      const top = array[0];
      array[0] = array[n];
      array[n] = top;
      down(array, 0, this.less, this.indexName, n);
    }
    for (const value of array) value[this.indexName] = -1;
    this.array = [];
    return array;
  }

  static from(values, options) {
    const heap = new IndexedHeap(options);
    heap.array = Array.isArray(values) ? values : Array.from(values);
    return heap.build();
  }
}

IndexedHeap.defaults = {less: (a, b) => a < b, equal: (a, b) => a === b, compare: null, indexName: 'heapIndex'};

export default IndexedHeap;
