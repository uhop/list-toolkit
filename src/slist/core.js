'use strict';

import {addAliases} from '../meta-utils.js';
import {CircularListBase, HeadNode} from './nodes.js';
import {extract, append, splice} from './basics.js';
import Ptr from './ptr.js';

export class SList extends HeadNode {
  get frontPtr() {
    return new Ptr(this, this);
  }

  get rangePtr() {
    return this.isEmpty ? null : {from: new Ptr(this), to: this.last};
  }

  makePtr(prev) {
    if (prev && !this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');
    return new Ptr(this, prev || this);
  }

  popFrontNode() {
    if (this[this.nextName] === this) return undefined;
    const node = this[this.nextName];
    this[this.nextName] = node[this.nextName];
    if (this[this.nextName] === this) this.last = this;
    return (node[this.nextName] = node);
  }

  pushFrontNode(node) {
    node = this.adoptNode(node);
    node[this.nextName] = this[this.nextName];
    this[this.nextName] = node;
    if (node[this.nextName] === this) this.last = node;
    return this.makePtr();
  }

  pushBackNode(node) {
    node = this.adoptNode(node);
    node[this.nextName] = this;
    const last = this.last;
    this.last = this.last[this.nextName] = node;
    return this.makePtr(last);
  }

  appendFront(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    list.last[this.nextName] = this[this.nextName];
    this[this.nextName] = list[this.nextName];
    if (list.last[this.nextName] === this) this.last = list.last;

    list[this.nextName] = list.last = list;
    return this.makePtr();
  }

  appendBack(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    this.last[this.nextName] = list[this.nextName];
    list.last[this.nextName] = this;

    const last = this.last;
    this.last = list.last;

    list[this.nextName] = list.last = list;
    return this.makePtr(last);
  }

  moveToFront(ptr) {
    if (!this.isCompatible(ptr.list)) throw new Error('Incompatible lists');
    if (ptr.isHead) return this;
    const node = ptr.remove();
    ptr.prev = this;
    return this.pushFrontNode(node);
  }

  moveToBack(ptr) {
    if (!this.isCompatible(ptr.list)) throw new Error('Incompatible lists');
    if (ptr.isHead) return this;
    const node = ptr.remove();
    ptr.prev = this.last;
    return this.pushBackNode(node);
  }

  clear(drop) {
    if (drop) {
      let current = this;
      do {
        const next = current[this.nextName];
        current[this.nextName] = current;
        current = next;
      } while (current !== this);
    } else {
      this[this.nextName] = this;
    }
    return this;
  }

  removeRange(range, drop) {
    this.extractRange(range).clear(drop);
    return this;
  }

  extractRange(range) {
    range = this.normalizePtrRange(range.from ? range : {...range, from: this.frontPtr});
    range.to ||= this.last;

    const extracted = this.make();
    append(this, extracted, {prevFrom: range.from.prev, to: range.to});
    extracted.last = range.to;

    return extracted;
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    for (const ptr = this.frontPtr; !ptr.isHead; ) {
      if (condition(ptr.node)) {
        extracted.pushBackNode(ptr.remove());
      } else {
        ptr.next();
      }
    }
    return extracted;
  }

  reverse() {
    if (this.isOneOrEmpty) return this;
    this.last = this[this.nextName];
    let prev = this,
      current = prev[this.nextName];
    do {
      const next = current[this.nextName];
      current[this.nextName] = prev;
      prev = current;
      current = next;
    } while (current !== this);
    this[this.nextName] = prev;
    return this;
  }

  sort(compareFn) {
    if (this.isOneOrEmpty) return this;

    const sortedNodes = Array.from(this.getNodeIterator()).sort(compareFn);

    for (let i = 1; i < sortedNodes.length; i++) {
      const prev = sortedNodes[i - 1],
        current = sortedNodes[i];
      prev[this.nextName] = current;
    }

    const head = sortedNodes[0],
      tail = sortedNodes[sortedNodes.length - 1];

    this[this.nextName] = head;
    tail[this.nextName] = this;
    this.last = tail;

    return this;
  }

  releaseAsPtrRange() {
    const range = this.rangePtr;
    if (!range) return null;
    const rawRange = extract(this, {prevFrom: range.from.prev, to: range.to}).extracted;
    return {from: new Ptr(this, rawRange.prevFrom), to: rawRange.to};
  }

  releaseRawCircularList() {
    return this.releaseAsPtrRange()?.from.node;
  }

  // iterators

  [Symbol.iterator]() {
    let current = this[this.nextName],
      readyToStop = this.isEmpty;
    return {
      next: () => {
        if (readyToStop && current === this) return {done: true};
        readyToStop = true;
        const value = current;
        current = current[this.nextName];
        return {value};
      }
    };
  }

  getNodeIterator(range = {}) {
    range = this.normalizeRange(range);
    const {from, to} = range;
    return {
      [Symbol.iterator]: () => {
        let current = from || this[this.nextName],
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this;
        return {
          next: () => {
            if (readyToStop && current === stop) return {done: true};
            readyToStop = true;
            const value = current;
            current = current[this.nextName];
            return {value};
          }
        };
      }
    };
  }

  getPtrIterator(range = {}) {
    if (!range.from) range = Object.assign({from: this.frontPtr}, range);
    range = this.normalizePtrRange(range);
    const {from: fromPtr, to} = range;
    return {
      [Symbol.iterator]: () => {
        let current = fromPtr.clone(),
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this;
        return {
          next: () => {
            if (readyToStop && current.node === stop) return {done: true};
            readyToStop = true;
            const value = current.clone();
            current = current.next();
            return {value};
          }
        };
      }
    };
  }

  // meta helpers

  clone() {
    return SList.from(this, this);
  }

  make() {
    return new SList(this);
  }

  makeFrom(values) {
    return SList.from(values, this);
  }

  makeFromRange(range) {
    return SList.fromRange(range, this);
  }

  static from(values, options) {
    const list = new SList(options);
    for (const value of values) list.pushBack(value);
    return list;
  }

  static fromRange(range, options) {
    const list = new SList(options);
    if (!list.isRangeLike(list)) throw new Error('"range" is not a compatible range');
    if (range) splice(list, list, range);
    return list;
  }

  static fromCircularList(circularList) {
    if (!(circularList instanceof CircularListBase)) throw new Error('Not a circular list');

    const list = new SList(circularList);
    if (circularList.isEmpty) return list;

    const range = circularList.range;
    if (range) {
      splice(list, list, range);
      circularList.clear();
    }

    return list;
  }
}

addAliases(SList, {
  popFrontNode: 'popFront, pop',
  pushFrontNode: 'pushFront, push',
  pushBackNode: 'pushBack',
  getNodeIterator: 'getIterator',
  pushBackNode: 'pushBack'
});

export default SList;
