'use strict';

import {addAliases, normalizeIterator} from '../meta-utils.js';
import {ExtListBase, HeadNode} from './nodes.js';
import {extract, append} from './basics.js';
import Ptr from './ptr.js';

export class SList extends HeadNode {
  get frontPtr() {
    return new Ptr(this);
  }

  get ptrRange() {
    return this.isEmpty ? null : {from: new Ptr(this), to: this.last};
  }

  makePtr(node) {
    if (node && !this.isNodeLike(node)) throw new Error('"node" is not a compatible node');
    return new Ptr(this, node);
  }

  makePtrFromPrev(prev) {
    if (prev && !this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');
    return new Ptr(this, null, prev || this);
  }

  popFrontNode() {
    if (this[this.nextName] === this) return undefined;
    const node = this[this.nextName];
    this[this.nextName] = node[this.nextName];
    if (this[this.nextName] === this) this.last = this;
    return (node[this.nextName] = node);
  }

  pushFront(value) {
    const node = this.adoptValue(value);
    node[this.nextName] = this[this.nextName];
    this[this.nextName] = node;
    if (node[this.nextName] === this) this.last = node;
    return this.makePtr();
  }

  pushBack(value) {
    const node = this.adoptValue(value);
    node[this.nextName] = this;
    const last = this.last;
    this.last = this.last[this.nextName] = node;
    return this.makePtrFromPrev(last);
  }

  pushFrontNode(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    node[this.nextName] = this[this.nextName];
    this[this.nextName] = node;
    if (node[this.nextName] === this) this.last = node;
    return this.makePtr();
  }

  pushBackNode(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    node[this.nextName] = this;
    const last = this.last;
    this.last = this.last[this.nextName] = node;
    return this.makePtrFromPrev(last);
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
    return this.makePtrFromPrev(last);
  }

  moveToFront(ptr) {
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    ptr.list = this;
    if (ptr.isHead) return this;
    const node = ptr.removeCurrent();
    ptr.prevNode = this;
    return this.pushFrontNode(node);
  }

  moveToBack(ptr) {
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    ptr.list = this;
    if (ptr.isHead) return this;
    const node = ptr.removeCurrent();
    ptr.prevNode = this.last;
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
    this.last = this;
    return this;
  }

  removeNode(ptr) {
    if (!ptr.isPrevNodeValid()) throw new Error('Cannot remove node: "prevNode" is invalid');
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    const node = ptr.prevNode[this.nextName];
    if (node === this || node === ptr.prevNode) return null;
    if (this.last === node) this.last = ptr.prevNode;
    ptr.prevNode[this.nextName] = node[this.nextName];
    ptr.list = this;
    node[this.nextName] = node;
    return node;
  }

  removeRange(ptrRange, drop) {
    return this.extractRange(ptrRange).clear(drop);
  }

  extractRange(ptrRange = {}) {
    const originalTo = ptrRange.to;
    ptrRange = this.normalizePtrRange(ptrRange.from ? ptrRange : {...ptrRange, from: this.frontPtr});
    if (!ptrRange.from.isPrevNodeValid()) throw new Error('Cannot extract range: "prevNode" is invalid');
    ptrRange.to ||= this.last;

    const extracted = this.make();
    append(this, extracted, {prevFrom: ptrRange.from.prevNode, to: ptrRange.to});
    extracted.last = ptrRange.to;
    ptrRange.from.list = extracted;
    if (originalTo instanceof Ptr) originalTo.list = extracted;

    // TODO: calculate new last node

    return extracted;
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    for (const ptr = this.frontPtr; !ptr.isHead; ) {
      if (condition(ptr.node)) {
        extracted.pushBackNode(ptr.removeCurrent());
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
    const range = this.ptrRange;
    if (!range) return null;
    const rawRange = extract(this, {prevFrom: range.from.prevNode, to: range.to}).extracted;
    return {from: new Ptr(this, null, rawRange.prevFrom), to: rawRange.to};
  }

  releaseRawList() {
    if (this.isEmpty) return null;
    const head = this[this.nextName],
      tail = this.last;
    this.clear();
    tail[this.nextName] = head;
    return head;
  }

  releaseNTList() {
    if (this.isEmpty) return null;
    const head = this[this.nextName],
      tail = this.last;
    this.clear();
    tail[this.nextName] = null;
    return {head, tail};
  }

  // iterators

  [Symbol.iterator]() {
    let current = this[this.nextName],
      readyToStop = this.isEmpty;
    return normalizeIterator({
      next: () => {
        if (readyToStop && current === this) return {done: true};
        readyToStop = true;
        const value = current;
        current = current[this.nextName];
        return {value};
      }
    });
  }

  getNodeIterator(range = {}) {
    range = this.normalizeRange(range);
    const {from, to} = range;
    return {
      [Symbol.iterator]: () => {
        let current = from || this[this.nextName],
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this;
        return normalizeIterator({
          next: () => {
            if (readyToStop && current === stop) return {done: true};
            readyToStop = true;
            const value = current;
            current = current[this.nextName];
            return {value};
          }
        });
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
        return normalizeIterator({
          next: () => {
            if (readyToStop && current.node === stop) return {done: true};
            readyToStop = true;
            const value = current.clone();
            current = current.next();
            return {value};
          }
        });
      }
    };
  }

  // meta helpers

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

  static fromPtrRange(ptrRange, options) {
    const list = new SList(options);
    if (!list.isCompatiblePtrRange(ptrRange)) throw new Error('"range" is not a compatible range');
    if (ptrRange) append(list, list, ptrRange);
    return list;
  }

  static fromExtList(extList) {
    if (!(extList instanceof ExtListBase)) throw new Error('Not a circular list');

    const list = new SList(extList);
    if (extList.isEmpty) return list;

    const range = extList.range;
    if (range) {
      append(list, list, range);
      extList.clear();
    }

    return list;
  }
}

SList.Ptr = Ptr;

addAliases(SList.prototype, {
  popFrontNode: 'popFront, pop',
  popBackNode: 'popBack',
  pushFront: 'push',
  appendBack: 'append',
  getNodeIterator: 'getIterator'
});

export {Ptr};
export default SList;
