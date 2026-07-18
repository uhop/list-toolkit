// @ts-self-types="./unrolled-list.d.ts"

import {addAliases} from './meta-utils.js';

// chunks are mini two-ended arrays on a null-terminated doubly linked chain;
// values never move once placed — no shifting, no growth copies
export class UnrolledList {
  constructor(options) {
    this.chunkSize = Math.max(1, Math.floor(options?.chunkSize || 64));
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
  get isEmpty() {
    return !this.size;
  }
  get front() {
    return this.head ? this.head.values[this.head.start] : undefined;
  }
  get back() {
    return this.tail ? this.tail.values[this.tail.start + this.tail.count - 1] : undefined;
  }
  peekFront() {
    return this.head ? this.head.values[this.head.start] : undefined;
  }
  peekBack() {
    return this.tail ? this.tail.values[this.tail.start + this.tail.count - 1] : undefined;
  }
  makeChunk(start) {
    return {values: new Array(this.chunkSize), start, count: 0, next: null, prev: null};
  }
  pushFront(value) {
    let chunk = this.head;
    if (!chunk || !chunk.start) {
      chunk = this.makeChunk(this.chunkSize);
      if (this.head) {
        chunk.next = this.head;
        this.head.prev = chunk;
        this.head = chunk;
      } else {
        this.head = this.tail = chunk;
      }
    }
    chunk.values[--chunk.start] = value;
    ++chunk.count;
    ++this.size;
    return this;
  }
  pushBack(value) {
    let chunk = this.tail;
    if (!chunk || chunk.start + chunk.count >= this.chunkSize) {
      chunk = this.makeChunk(0);
      if (this.tail) {
        chunk.prev = this.tail;
        this.tail.next = chunk;
        this.tail = chunk;
      } else {
        this.head = this.tail = chunk;
      }
    }
    chunk.values[chunk.start + chunk.count] = value;
    ++chunk.count;
    ++this.size;
    return this;
  }
  popFront() {
    const chunk = this.head;
    if (!chunk) return;
    const value = chunk.values[chunk.start];
    chunk.values[chunk.start] = undefined; // release the reference
    ++chunk.start;
    --chunk.count;
    --this.size;
    if (!chunk.count) {
      this.head = chunk.next;
      if (this.head) this.head.prev = null;
      else this.tail = null;
    }
    return value;
  }
  popBack() {
    const chunk = this.tail;
    if (!chunk) return;
    const index = chunk.start + chunk.count - 1,
      value = chunk.values[index];
    chunk.values[index] = undefined;
    --chunk.count;
    --this.size;
    if (!chunk.count) {
      this.tail = chunk.prev;
      if (this.tail) this.tail.next = null;
      else this.head = null;
    }
    return value;
  }
  at(index) {
    if (index < 0) index += this.size;
    if (index < 0 || index >= this.size) return undefined;
    if (index <= this.size >> 1) {
      let chunk = this.head;
      while (index >= chunk.count) {
        index -= chunk.count;
        chunk = chunk.next;
      }
      return chunk.values[chunk.start + index];
    }
    let fromBack = this.size - 1 - index,
      chunk = this.tail;
    while (fromBack >= chunk.count) {
      fromBack -= chunk.count;
      chunk = chunk.prev;
    }
    return chunk.values[chunk.start + chunk.count - 1 - fromBack];
  }
  pushValuesFront(values) {
    for (const value of values) this.pushFront(value);
    return this;
  }
  pushValuesBack(values) {
    for (const value of values) this.pushBack(value);
    return this;
  }
  clear() {
    this.head = this.tail = null;
    this.size = 0;
    return this;
  }
  [Symbol.iterator]() {
    let chunk = this.head,
      i = chunk ? chunk.start : 0;
    return {
      next: () => {
        while (chunk && i >= chunk.start + chunk.count) {
          chunk = chunk.next;
          i = chunk ? chunk.start : 0;
        }
        if (!chunk) return {done: true};
        return {value: chunk.values[i++]};
      }
    };
  }
  getReverseIterator() {
    return {
      [Symbol.iterator]: () => {
        let chunk = this.tail,
          i = chunk ? chunk.start + chunk.count - 1 : -1;
        return {
          next: () => {
            while (chunk && i < chunk.start) {
              chunk = chunk.prev;
              i = chunk ? chunk.start + chunk.count - 1 : -1;
            }
            if (!chunk) return {done: true};
            return {value: chunk.values[i--]};
          }
        };
      }
    };
  }
  static from(values, options) {
    const list = new UnrolledList(options);
    for (const value of values) list.pushBack(value);
    return list;
  }
}

addAliases(UnrolledList.prototype, {
  pushFront: 'unshift, addFront',
  pushBack: 'push, add, addBack',
  popFront: 'shift, removeFront',
  popBack: 'pop, removeBack'
});

export default UnrolledList;
