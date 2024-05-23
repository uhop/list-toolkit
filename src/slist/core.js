'use strict';

import {addAliases} from '../meta-utils.js';
import {CircularListBase, HeadNode} from './nodes.js';
import {extract, append} from './basics.js';
import Ptr from './ptr.js';

export class SList extends HeadNode {
  get frontPtr() {
    return new Ptr(this);
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
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    if (ptr.isHead) return this;
    const node = ptr.remove();
    ptr.previousNode = this;
    return this.pushFrontNode(node);
  }

  moveToBack(ptr) {
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    if (ptr.isHead) return this;
    const node = ptr.remove();
    ptr.previousNode = this.last;
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

  removeNode(ptr) {
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    const node = ptr.previousNode[this.nextName];
    if (node === this || node === ptr.previousNode) return null;
    if (this.last === node) this.last = ptr.previousNode;
    ptr.previousNode[this.nextName] = node[this.nextName];
    node[this.nextName] = node;
    return node;
  }

  removeRange(ptrRange, drop) {
    return this.extractRange(ptrRange).clear(drop);
  }

  extractRange(ptrRange = {}) {
    ptrRange = this.normalizePtrRange(ptrRange.from ? ptrRange : {...ptrRange, from: this.frontPtr});
    ptrRange.to ||= this.last;

    const extracted = this.make();
    append(this, extracted, {prevFrom: ptrRange.from.previousNode, to: ptrRange.to});
    extracted.last = ptrRange.to;

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

  sort(lessFn) {
    if (this.isOneOrEmpty) return this;

    const left = this.make(),
      right = this.make();

    // split into two sublists
    for (let isLeft = true; !this.isEmpty; isLeft = !isLeft) {
      (isLeft ? left : right).pushBackNode(this.popFrontNode());
    }
    // the list is empty now

    // sort sublists
    left.sort(lessFn);
    right.sort(lessFn);

    // merge sublists
    while (!left.isEmpty && !right.isEmpty) {
      this.pushBackNode((lessFn(left.front, right.front) ? left : right).popFrontNode());
    }
    if (!left.isEmpty) this.appendBack(left);
    if (!right.isEmpty) this.appendBack(right);

    return this;
  }

  releaseAsPtrRange() {
    const range = this.rangePtr;
    if (!range) return null;
    const rawRange = extract(this, {prevFrom: range.from.previousNode, to: range.to}).extracted;
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

  getPtrIterator(ptrRange = {}) {
    if (!ptrRange.from) ptrRange = Object.assign({from: this.frontPtr}, ptrRange);
    ptrRange = this.normalizePtrRange(ptrRange);
    const {from: fromPtr, to} = ptrRange;
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
    if (range) append(list, list, range);
    return list;
  }

  static fromCircularList(circularList) {
    if (!(circularList instanceof CircularListBase)) throw new Error('Not a circular list');

    const list = new SList(circularList);
    if (circularList.isEmpty) return list;

    const range = circularList.range;
    if (range) {
      append(list, list, range);
      circularList.clear();
    }

    return list;
  }
}

SList.Ptr = Ptr;

addAliases(SList, {
  popFrontNode: 'popFront, pop',
  pushFrontNode: 'pushFront, push',
  pushBackNode: 'pushBack',
  getNodeIterator: 'getIterator',
  pushBackNode: 'pushBack'
});

export {Ptr};
export default SList;
