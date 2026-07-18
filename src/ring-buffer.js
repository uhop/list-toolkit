// @ts-self-types="./ring-buffer.d.ts"

import {addAliases} from './meta-utils.js';

const toPow2 = n => {
  let c = 4;
  while (c < n) c <<= 1;
  return c;
};

export class RingBuffer {
  constructor(options) {
    this.capacity = options?.capacity ? Math.max(1, Math.floor(options.capacity)) : Infinity;
    this.array = new Array(toPow2(Math.min(options?.initialCapacity || 16, this.capacity))).fill(undefined);
    this.head = 0;
    this.size = 0;
  }
  get isEmpty() {
    return !this.size;
  }
  get isFull() {
    return this.size >= this.capacity;
  }
  get front() {
    return this.size ? this.array[this.head] : undefined;
  }
  get back() {
    return this.size ? this.array[(this.head + this.size - 1) & (this.array.length - 1)] : undefined;
  }
  peekFront() {
    return this.size ? this.array[this.head] : undefined;
  }
  peekBack() {
    return this.size ? this.array[(this.head + this.size - 1) & (this.array.length - 1)] : undefined;
  }
  at(index) {
    if (index < 0) index += this.size;
    if (index < 0 || index >= this.size) return undefined;
    return this.array[(this.head + index) & (this.array.length - 1)];
  }
  grow() {
    const array = new Array(this.array.length << 1).fill(undefined),
      mask = this.array.length - 1;
    for (let i = 0; i < this.size; ++i) array[i] = this.array[(this.head + i) & mask];
    this.array = array;
    this.head = 0;
    return this;
  }
  pushFront(value) {
    if (this.size >= this.capacity) this.popBack();
    else if (this.size === this.array.length) this.grow();
    this.head = (this.head - 1) & (this.array.length - 1);
    this.array[this.head] = value;
    ++this.size;
    return this;
  }
  pushBack(value) {
    if (this.size >= this.capacity) this.popFront();
    else if (this.size === this.array.length) this.grow();
    this.array[(this.head + this.size) & (this.array.length - 1)] = value;
    ++this.size;
    return this;
  }
  popFront() {
    if (!this.size) return;
    const value = this.array[this.head];
    this.array[this.head] = undefined; // release the reference
    this.head = (this.head + 1) & (this.array.length - 1);
    --this.size;
    return value;
  }
  popBack() {
    if (!this.size) return;
    const index = (this.head + this.size - 1) & (this.array.length - 1),
      value = this.array[index];
    this.array[index] = undefined;
    --this.size;
    return value;
  }
  pushValuesFront(values) {
    for (const value of values) this.pushFront(value);
    return this;
  }
  pushValuesBack(values) {
    for (const value of values) this.pushBack(value);
    return this;
  }
  rotate(n = 1) {
    const size = this.size;
    if (size < 2) return this;
    n %= size;
    if (!n) return this;
    if (n < 0) n += size;
    if (size === this.array.length) {
      // physically full ring: rotation is a head shift
      this.head = (this.head - n) & (this.array.length - 1);
      return this;
    }
    if (n <= size >> 1) {
      for (let i = 0; i < n; ++i) this.pushFront(this.popBack());
    } else {
      for (let i = size - n; i > 0; --i) this.pushBack(this.popFront());
    }
    return this;
  }
  clear() {
    this.array.fill(undefined);
    this.head = 0;
    this.size = 0;
    return this;
  }
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => (i < this.size ? {value: this.array[(this.head + i++) & (this.array.length - 1)]} : {done: true})
    };
  }
  getReverseIterator() {
    return {
      [Symbol.iterator]: () => {
        let i = this.size - 1;
        return {
          next: () => (i >= 0 ? {value: this.array[(this.head + i--) & (this.array.length - 1)]} : {done: true})
        };
      }
    };
  }
  static from(values, options) {
    const ring = new RingBuffer(options);
    for (const value of values) ring.pushBack(value);
    return ring;
  }
}

addAliases(RingBuffer.prototype, {
  pushFront: 'unshift, addFront',
  pushBack: 'push, add, addBack',
  popFront: 'shift, removeFront',
  popBack: 'pop, removeBack'
});

export default RingBuffer;
