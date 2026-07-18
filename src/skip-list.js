// @ts-self-types="./skip-list.d.ts"

import {copyOptions, lessFromCompare} from './meta-utils.js';

const defaultLess = (a, b) => a < b;

export class SkipListNode {
  constructor(value, level) {
    this.value = value;
    this.next = new Array(level).fill(null);
    this.prev = null;
  }
  get level() {
    return this.next.length;
  }
}

export class SkipList {
  constructor(options) {
    copyOptions(this, SkipList.defaults, options);
    if (typeof this.compare == 'function') this.less = lessFromCompare(this.compare);
    this.head = new SkipListNode(undefined, 1);
    this.last = null;
    this.size = 0;
  }
  get isEmpty() {
    return !this.size;
  }
  get length() {
    return this.size;
  }
  getMin() {
    return this.head.next[0];
  }
  getMax() {
    return this.last;
  }
  randomLevel() {
    let level = 1;
    while (level < this.maxLevel && this.random() < this.p) ++level;
    return level;
  }
  findPrevs(value) {
    const update = new Array(this.head.next.length);
    let node = this.head;
    for (let i = update.length - 1; i >= 0; --i) {
      while (node.next[i] && this.less(node.next[i].value, value)) node = node.next[i];
      update[i] = node;
    }
    return update;
  }
  find(value) {
    let node = this.head;
    for (let i = this.head.next.length - 1; i >= 0; --i) {
      while (node.next[i] && this.less(node.next[i].value, value)) node = node.next[i];
    }
    node = node.next[0];
    return node && !this.less(value, node.value) ? node : null;
  }
  has(value) {
    return !!this.find(value);
  }
  floor(value) {
    let node = this.head;
    for (let i = this.head.next.length - 1; i >= 0; --i) {
      while (node.next[i] && this.less(node.next[i].value, value)) node = node.next[i];
    }
    const candidate = node.next[0];
    if (candidate && !this.less(value, candidate.value)) return candidate;
    return node === this.head ? null : node;
  }
  ceil(value) {
    let node = this.head;
    for (let i = this.head.next.length - 1; i >= 0; --i) {
      while (node.next[i] && this.less(node.next[i].value, value)) node = node.next[i];
    }
    return node.next[0];
  }
  insert(value) {
    const update = this.findPrevs(value),
      candidate = update[0].next[0];
    if (candidate && !this.less(value, candidate.value)) return this;
    const level = this.randomLevel();
    while (this.head.next.length < level) {
      this.head.next.push(null);
      update.push(this.head);
    }
    const node = new SkipListNode(value, level);
    for (let i = 0; i < level; ++i) {
      node.next[i] = update[i].next[i];
      update[i].next[i] = node;
    }
    node.prev = update[0] === this.head ? null : update[0];
    if (node.next[0]) node.next[0].prev = node;
    else this.last = node;
    ++this.size;
    return this;
  }
  remove(value) {
    const update = this.findPrevs(value),
      node = update[0].next[0];
    if (!node || this.less(value, node.value)) return this;
    for (let i = 0; i < node.next.length; ++i) {
      if (update[i].next[i] === node) update[i].next[i] = node.next[i];
    }
    if (node.next[0]) node.next[0].prev = node.prev;
    else this.last = node.prev;
    this.trimHead();
    --this.size;
    return this;
  }
  popFront() {
    const node = this.head.next[0];
    if (!node) return undefined;
    for (let i = 0; i < node.next.length; ++i) {
      this.head.next[i] = node.next[i];
    }
    if (node.next[0]) node.next[0].prev = null;
    else this.last = null;
    this.trimHead();
    --this.size;
    return node.value;
  }
  trimHead() {
    let level = this.head.next.length;
    while (level > 1 && !this.head.next[level - 1]) --level;
    this.head.next.length = level;
    return this;
  }
  clear() {
    this.head = new SkipListNode(undefined, 1);
    this.last = null;
    this.size = 0;
    return this;
  }
  [Symbol.iterator]() {
    let current = this.head.next[0];
    return {
      next: () => {
        if (!current) return {done: true};
        const value = current.value;
        current = current.next[0];
        return {value};
      }
    };
  }
  getIterator(range = {}) {
    return {
      [Symbol.iterator]: () => {
        let current = 'from' in range ? this.ceil(range.from) : this.head.next[0];
        const hasTo = 'to' in range;
        return {
          next: () => {
            if (!current || (hasTo && this.less(range.to, current.value))) return {done: true};
            const value = current.value;
            current = current.next[0];
            return {value};
          }
        };
      }
    };
  }
  getNodeIterator(range = {}) {
    return {
      [Symbol.iterator]: () => {
        let current = 'from' in range ? this.ceil(range.from) : this.head.next[0];
        const hasTo = 'to' in range;
        return {
          next: () => {
            if (!current || (hasTo && this.less(range.to, current.value))) return {done: true};
            const value = current;
            current = current.next[0];
            return {value};
          }
        };
      }
    };
  }
  getReverseIterator() {
    return {
      [Symbol.iterator]: () => {
        let current = this.last;
        return {
          next: () => {
            if (!current) return {done: true};
            const value = current.value;
            current = current.prev;
            return {value};
          }
        };
      }
    };
  }
  static from(values, options) {
    const list = new SkipList(options);
    for (const value of values) {
      list.insert(value);
    }
    return list;
  }
}

SkipList.defaults = {less: defaultLess, compare: null, p: 0.5, maxLevel: 32, random: Math.random};

export default SkipList;
