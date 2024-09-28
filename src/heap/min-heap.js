'use strict';

import HeapBase from './basics.js';

// the following functions are inlined:

// const left = i => (i << 1) + 1;
// const right = i => (i + 1) << 1;
// const parent = i => (i - 1) >> 1;

const up = (array, i, less = defaultLess) => {
  for (let p = (i - 1) >> 1; i > 0; i = p, p = (i - 1) >> 1) {
    const iValue = array[i],
      pValue = array[p];
    if (!less(iValue, pValue)) break;
    array[i] = pValue;
    array[p] = iValue;
  }
  return array;
};

const down = (array, i, less = defaultLess, n = array.length) => {
  for (;;) {
    const l = (i << 1) + 1;
    if (l >= n) break;
    const r = l + 1,
      c = r < n && less(array[r], array[l]) ? r : l,
      iValue = array[i],
      cValue = array[c];
    if (!less(cValue, iValue)) break;
    array[i] = cValue;
    array[c] = iValue;
    i = c;
  }
  return array;
};

export class MinHeap extends HeapBase {
  constructor(options, ...args) {
    super(options);
    if (typeof this.compare == 'function') {
      this.less = (a, b) => this.compare(a, b) < 0;
      this.equal = (a, b) => !this.compare(a, b);
    }
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

  pop() {
    // return MinHeap.pop(this.array, this.less); // inlined
    switch (this.array.length) {
      case 0:
        return;
      case 1:
        return this.array.pop();
    }
    const top = this.array[0];
    this.array[0] = this.array.pop();
    // down(this.array, 0, this.less); // inlined
    const n = this.array.length;
    for (let i = 0; ; ) {
      const l = (i << 1) + 1;
      if (l >= n) break;
      const r = l + 1,
        c = r < n && this.less(this.array[r], this.array[l]) ? r : l,
        iValue = this.array[i],
        cValue = this.array[c];
      if (!this.less(cValue, iValue)) break;
      this.array[i] = cValue;
      this.array[c] = iValue;
      i = c;
    }
    return top;
  }

  push(value) {
    // MinHeap.push(this.array, value, this.less); // inlined
    let i = this.array.length;
    this.array.push(value);
    // up(this.array, i, this.less); // inlined
    for (let p = (i - 1) >> 1; i > 0; i = p, p = (i - 1) >> 1) {
      const iValue = this.array[i],
        pValue = this.array[p];
      if (!this.less(iValue, pValue)) break;
      this.array[i] = pValue;
      this.array[p] = iValue;
    }
    return this;
  }

  pushPop(value) {
    // return MinHeap.pushPop(this.array, value, this.less); // inlined
    if (!this.array.length || this.less(value, this.array[0])) return value;
    const top = this.array[0];
    this.array[0] = value;
    // down(this.array, 0, this.less); // inlined
    const n = this.array.length;
    for (let i = 0; ; ) {
      const l = (i << 1) + 1;
      if (l >= n) break;
      const r = l + 1,
        c = r < n && this.less(this.array[r], this.array[l]) ? r : l,
        iValue = this.array[i],
        cValue = this.array[c];
      if (!this.less(cValue, iValue)) break;
      this.array[i] = cValue;
      this.array[c] = iValue;
      i = c;
    }
    return top;
  }

  replaceTop(value) {
    // return MinHeap.replaceTop(this.array, value, this.less); // inlined
    const top = this.array[0];
    this.array[0] = value;
    // down(this.array, 0, this.less); // inlined
    const n = this.array.length;
    for (let i = 0; ; ) {
      const l = (i << 1) + 1;
      if (l >= n) break;
      const r = l + 1,
        c = r < n && this.less(this.array[r], this.array[l]) ? r : l,
        iValue = this.array[i],
        cValue = this.array[c];
      if (!this.less(cValue, iValue)) break;
      this.array[i] = cValue;
      this.array[c] = iValue;
      i = c;
    }
    return top;
  }

  has(value) {
    // return MinHeap.has(this.array, value, this.equal); // inlined
    return this.array.findIndex(element => this.equal(element, value)) >= 0;
  }

  findIndex(value) {
    return this.array.findIndex(element => this.equal(element, value));
  }

  remove(value) {
    MinHeap.remove(this.array, value, this.less, this.equal);
    return this;
  }

  removeByIndex(index) {
    MinHeap.removeByIndex(this.array, index, this.less);
    return this;
  }

  replace(value, newValue) {
    MinHeap.replace(this.array, value, newValue, this.less, this.equal);
    return this;
  }

  replaceByIndex(index, newValue) {
    MinHeap.replaceByIndex(this.array, index, newValue, this.less);
    return this;
  }

  updateTop() {
    down(this.array, 0, this.less);
    return this;
  }

  updateByIndex(index, isDecreased) {
    MinHeap.updateByIndex(this.array, index, isDecreased, this.less);
    return this;
  }

  clear() {
    this.array = [];
    return this;
  }

  releaseSorted() {
    MinHeap.sort(this.array, this.less);
    const array = this.array;
    this.array = [];
    return array;
  }

  merge(...args) {
    if (!args.length) return this;
    this.array = MinHeap.build(
      this.array.concat(
        ...args.map(item => {
          if (item instanceof MinHeap) return item.array;
          if (!item) return [];
          return item;
        })
      ),
      this.less
    );
    return this;
  }

  clone() {
    const heap = new MinHeap(this);
    heap.array = this.array.slice(0);
    return heap;
  }

  static build(array, less = MinHeap.defaults.less) {
    if (array.length <= 1) return array;
    for (let n = array.length, j = (n >> 1) - 1; j >= 0; --j) {
      // down(array, j, less, n); // inlined
      for (let i = j; ; ) {
        const l = (i << 1) + 1;
        if (l >= n) break;
        const r = l + 1,
          c = r < n && less(array[r], array[l]) ? r : l,
          iValue = array[i],
          cValue = array[c];
        if (!less(cValue, iValue)) break;
        array[i] = cValue;
        array[c] = iValue;
        i = c;
      }
    }
    return array;
  }

  static pop(heapArray, less = MinHeap.defaults.less) {
    switch (heapArray.length) {
      case 0:
        return;
      case 1:
        return heapArray.pop();
    }
    const top = heapArray[0];
    heapArray[0] = heapArray.pop();
    down(heapArray, 0, less);
    return top;
  }

  static push(heapArray, item, less = MinHeap.defaults.less) {
    const i = heapArray.length;
    heapArray.push(item);
    return up(heapArray, i, less);
  }

  static pushPop(heapArray, item, less = MinHeap.defaults.less) {
    if (!heapArray.length || less(item, heapArray[0])) return item;
    return MinHeap.replaceTop(heapArray, item, less);
  }

  static replaceTop(heapArray, item, less = MinHeap.defaults.less) {
    const top = heapArray[0];
    heapArray[0] = item;
    down(heapArray, 0, less);
    return top;
  }

  static has(heapArray, item, equal = MinHeap.defaults.equal) {
    return heapArray.findIndex(element => equal(element, item)) >= 0;
  }

  static findIndex(heapArray, item, equal = MinHeap.defaults.equal) {
    return heapArray.findIndex(element => equal(element, item));
  }

  static removeByIndex(heapArray, index, less = MinHeap.defaults.less) {
    if (index < 0 || index >= heapArray.length) return this;
    const last = heapArray.length - 1;
    if (index !== last) {
      const item = heapArray[index],
        newItem = (heapArray[index] = heapArray.pop());
      return MinHeap.updateByIndex(heapArray, index, less(newItem, item), less);
    }
    heapArray.pop();
    return heapArray;
  }

  static remove(heapArray, item, less = MinHeap.defaults.less, equal = MinHeap.defaults.equal) {
    const index = heapArray.findIndex(element => equal(element, item));
    return MinHeap.removeByIndex(heapArray, index, less);
  }

  static replaceByIndex(heapArray, index, newItem, less = MinHeap.defaults.less) {
    if (index < 0 || index >= heapArray.length) return this;
    const item = heapArray[index];
    heapArray[index] = newItem;
    return MinHeap.updateByIndex(heapArray, index, less(newItem, item), less);
  }

  static replace(heapArray, item, newItem, less = MinHeap.defaults.less, equal = MinHeap.defaults.equal) {
    const index = heapArray.findIndex(element => equal(element, item));
    return MinHeap.replaceByIndex(heapArray, index, newItem, less);
  }

  static updateByIndex(heapArray, index, isDecreased, less = MinHeap.defaults.less) {
    if (index < 0 || index >= heapArray.length) return this;
    return (isDecreased ? up : down)(heapArray, index, less);
  }

  static sort(heapArray, less = MinHeap.defaults.less) {
    if (heapArray.length <= 1) return heapArray;
    for (let n = heapArray.length - 1; n; --n) {
      [heapArray[0], heapArray[n]] = [heapArray[n], heapArray[0]];
      down(heapArray, 0, less, n);
    }
    return heapArray;
  }

  static from(array, options = MinHeap.defaults) {
    const heap = new MinHeap(options);
    heap.array = MinHeap.build(array, heap.less);
    return heap;
  }
}

export default MinHeap;
