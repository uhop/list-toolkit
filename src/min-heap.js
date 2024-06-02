'use strict';

import {copyOptions} from './meta-utils.js';

// the following functions are inlined:

// const left = i => (i << 1) + 1;
// const right = i => (i + 1) << 1;
// const parent = i => (i - 1) >> 1;

const defaultLess = (a, b) => a < b;
const defaultEqual = (a, b) => a === b;

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
    let c = l,
      cValue = array[c];
    const r = c + 1;
    if (r < n) {
      const rValue = array[r];
      if (less(rValue, cValue)) {
        c = r;
        cValue = rValue;
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

export class MinHeap {
  constructor(options, ...args) {
    copyOptions(this, MinHeap.defaults, options);
    this.array = [];
    this.merge(...args);
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
      let c = l,
        cValue = this.array[c];
      const r = c + 1;
      if (r < n) {
        const rValue = this.array[r];
        if (this.less(rValue, cValue)) {
          c = r;
          cValue = rValue;
        }
      }
      const iValue = this.array[i];
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
      let c = l,
        cValue = this.array[c];
      const r = c + 1;
      if (r < n) {
        const rValue = this.array[r];
        if (this.less(rValue, cValue)) {
          c = r;
          cValue = rValue;
        }
      }
      const iValue = this.array[i];
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
      let c = l,
        cValue = this.array[c];
      const r = c + 1;
      if (r < n) {
        const rValue = this.array[r];
        if (this.less(rValue, cValue)) {
          c = r;
          cValue = rValue;
        }
      }
      const iValue = this.array[i];
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

  remove(value) {
    return MinHeap.remove(this.array, value, this.less, this.equal);
  }

  replace(value, newValue) {
    return MinHeap.replace(this.array, value, newValue, this.less, this.equal);
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

  make(...args) {
    return new MinHeap(this, ...args);
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
        let c = l,
          cValue = array[c];
        const r = c + 1;
        if (r < n) {
          const rValue = array[r];
          if (less(rValue, cValue)) {
            c = r;
            cValue = rValue;
          }
        }
        const iValue = array[i];
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
    const top = heapArray[0];
    heapArray[0] = item;
    down(heapArray, 0, less);
    return top;
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

  static removeByIndex(heapArray, index, less = MinHeap.defaults.less, equal = MinHeap.defaults.equal) {
    if (index < 0 || index >= heapArray.length) return this;
    const last = heapArray.length - 1;
    if (index !== last) {
      const item = heapArray[index];
      heapArray[index] = heapArray.pop();
      if (less(heapArray[index], item)) up(heapArray, index, less);
      else down(heapArray, index, less);
    } else heapArray.pop();
    return this;
  }

  static remove(heapArray, item, less = MinHeap.defaults.less, equal = MinHeap.defaults.equal) {
    const index = heapArray.findIndex(element => equal(element, item));
    if (index < 0) return this;
    const last = heapArray.length - 1;
    if (index !== last) {
      heapArray[index] = heapArray.pop();
      if (less(heapArray[index], item)) up(heapArray, index, less);
      else down(heapArray, index, less);
    } else heapArray.pop();
    return this;
  }

  static replaceByIndex(heapArray, index, newItem, less = MinHeap.defaults.less, equal = MinHeap.defaults.equal) {
    if (index < 0 || index >= heapArray.length) return this;
    const item = heapArray[index];
    heapArray[index] = newItem;
    if (less(newItem, item)) up(heapArray, index, less);
    else down(heapArray, index, less);
    return this;
  }

  static replace(heapArray, item, newItem, less = MinHeap.defaults.less, equal = MinHeap.defaults.equal) {
    const index = heapArray.findIndex(element => equal(element, item));
    if (index < 0) return this;
    heapArray[index] = newItem;
    if (less(newItem, item)) up(heapArray, index, less);
    else down(heapArray, index, less);
    return this;
  }

  static sort(heapArray, less = MinHeap.defaults.less) {
    if (heapArray.length <= 1) return heapArray;
    for (let n = heapArray.length - 1; n; --n) {
      [heapArray[0], heapArray[n]] = [heapArray[n], heapArray[0]];
      down(heapArray, 0, less, n);
    }
    return heapArray;
  }
}

MinHeap.defaults = {less: defaultLess, equal: defaultEqual};

export default MinHeap;
