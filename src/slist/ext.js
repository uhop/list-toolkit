'use strict';

import {ExtListBase, HeadNode, PtrBase} from './nodes.js';
import {pop, extract, splice} from './basics.js';
import {addAliases, copyDescriptors, mapIterator} from '../meta-utils.js';

export class Ptr extends PtrBase {
  constructor(list, prev) {
    super(list, prev, ExtSList);
    this.previousNode ||= this.list.head;
  }
  clone() {
    return new Ptr(this);
  }
}

export class ExtSList extends ExtListBase {
  get rangePtr() {
    return this.head ? {from: this.makePtr(), to: this.head, list: this.head} : null;
  }

  makePtr(prev) {
    if (prev && !this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');
    prev ||= this.head;
    return prev ? new Ptr(this, prev) : null;
  }

  // Ptr API

  removeNodeAfter() {
    return this.head ? this.removeNode(this.makePtr()) : null;
  }

  addNodeAfter(node) {
    node = this.adoptNode(node);
    if (this.head) {
      splice(this, this.head, {prevFrom: node});
    } else {
      this.head = node;
    }
    return this.makePtr();
  }

  insertAfter(extList) {
    if (!this.isCompatible(extList)) throw new Error('Incompatible lists');

    const head = extList.head;
    if (head) {
      splice(this, this.head, {prevFrom: head, to: head});
      extList.head = null;
    }

    return this.makePtr();
  }

  moveAfter(ptr) {
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');

    if (!this.head) {
      this.head = pop(this, ptr.previousNode).extracted.to;
      return this;
    }

    if (this.head === ptr.previousNode) return this;

    if (this.head === ptr.previousNode[this.nextName]) {
      if (this.head === this.head[this.nextName]) return this;
      this.head = this.head[this.nextName];
    }

    ptr.previousNode = splice(this, this.head, {prevFrom: pop(this, ptr.previousNode).extracted.to});

    return this;
  }

  // List API

  clear(drop) {
    if (drop) {
      for (const current of this.getNodeIterator()) {
        current[this.nextName] = current; // make stand-alone
      }
    }
    this.head = null;
    return this;
  }

  removeNode(ptr) {
    if (!this.head) return null;
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    if (this.head === ptr.previousNode[this.nextName]) {
      if (this.head === this.head[this.nextName]) {
        this.head = null;
        return ptr.previousNode[this.nextName];
      }
      this.head = this.head[this.nextName];
    }
    return pop(this, ptr.previousNode).extracted.to;
  }

  removeRange(ptrRange, drop) {
    return this.extractRange(ptrRange).clear(drop);
  }

  extractRange(ptrRange = {}) {
    ptrRange = this.normalizePtrRange(ptrRange.from ? ptrRange : {...ptrRange, from: this.makePtr()});
    ptrRange.to ||= this.head;

    const prevFrom = ptrRange.from.previousNode,
      to = ptrRange.to,
      extracted = this.make();
    if (!this.head) return extracted;
    if (this.head === prevFrom[this.nextName] || this.head === to) this.head = to[this.nextName];
    if (this.head === prevFrom[this.nextName]) this.head = null;
    extracted.head = extract(this, {prevFrom, to}).extracted.prevFrom[this.nextName];

    return extracted;
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    const rest = this.make();
    for (const current of this.getNodeIterator()) {
      current[this.nextName] = current; // make stand-alone
      if (condition(current)) {
        extracted.addAfter(current);
        extracted.next();
      } else {
        rest.addAfter(current);
        rest.next();
      }
    }
    extracted.next();
    rest.next();

    this.head = rest.head;

    return extracted;
  }

  reverse() {
    if (this.isOneOrEmpty) return this;

    let prev = this.head,
      current = prev[this.nextName];
    do {
      const next = current[this.nextName];
      current[this.nextName] = prev;
      prev = current;
      current = next;
    } while (current !== this.head);
    this.head[this.nextName] = prev;

    this.head = this.head[this.nextName];

    return this;
  }

  sort(lessFn) {
    if (this.isOneOrEmpty) return this;

    const leftHead = {},
      rightHead = {};
    leftHead[this.nextName] = leftHead;
    rightHead[this.nextName] = rightHead;

    const left = this.make(leftHead),
      right = this.make(rightHead);

    // split into two sublists
    let isLeft = true;
    for (const current of this.getNodeIterator()) {
      current[this.nextName] = current; // make stand-alone
      if (isLeft) {
        left.addNodeAfter(current);
        left.next();
      } else {
        right.addNodeAfter(current);
        right.next();
      }
      isLeft = !isLeft;
    }
    left.removeNodeAfter(); // remove the head node
    right.removeNodeAfter(); // remove the head node
    this.clear();
    // the list is empty now

    // sort sublists
    left.next().sort(lessFn);
    right.next().sort(lessFn);

    // merge sublists
    const leftIterator = left.getNodeIterator()[Symbol.iterator](),
      rightIterator = right.getNodeIterator()[Symbol.iterator]();
    let leftItem = leftIterator.next(),
      rightItem = rightIterator.next();
    while (!leftItem.done && !rightItem.done) {
      let node;
      if (lessFn(leftItem.value, rightItem.value)) {
        node = leftItem.value;
        leftItem = leftIterator.next();
      } else {
        node = rightItem.value;
        rightItem = rightIterator.next();
      }
      node[this.nextName] = node; // make stand-alone
      this.addNodeAfter(node);
      this.next();
    }
    for (; !leftItem.done; this.next(), leftItem = leftIterator.next()) {
      const node = leftItem.value;
      node[this.nextName] = node; // make stand-alone
      this.addNodeAfter(node);
    }
    for (; !rightItem.done; this.next(), rightItem = rightIterator.next()) {
      const node = rightItem.value;
      node[this.nextName] = node; // make stand-alone
      this.addNodeAfter(node);
    }

    return this.next();
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.head,
      readyToStop = this.isEmpty;
    return {
      next: () => {
        if (readyToStop && current === this.head) return {done: true};
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
        let readyToStop = this.isEmpty,
          current = readyToStop ? null : from || this.head;
        const stop = readyToStop ? null : to ? to[this.nextName] : this.head;
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

  getPtrIterator(range) {
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
    return new ExtSList(this);
  }

  make(head = null) {
    return new ExtSList(head, this);
  }

  makeFrom(values) {
    return ExtSList.from(values, this);
  }

  static from(values, options) {
    const list = new ExtSList(null, options);
    for (const value of values) {
      list.addNodeAfter(value);
      list.next();
    }
    return list.next();
  }
}

ExtSList.Ptr = Ptr;

copyDescriptors(ExtSList, 'adoptNode, isCompatibleNames, isNodeLike', HeadNode);

addAliases(ExtSList, {
  addNodeAfter: 'addAfter',
  removeNodeAfter: 'removeAfter',
  getNodeIterator: 'getIterator'
});

export default ExtSList;
