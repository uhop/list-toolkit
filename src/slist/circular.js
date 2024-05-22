'use strict';

import {CircularListBase, HeadNode, PtrBase} from './nodes.js';
import {pop, extract, splice} from './basics.js';
import {addAliases, copyDescriptors, mapIterator} from '../meta-utils.js';

export class Ptr extends PtrBase {
  constructor(list, prev) {
    super(list, prev, CircularSList);
    this.previousNode ||= this.list.head;
  }
  clone() {
    return new Ptr(this);
  }
}

export class CircularSList extends CircularListBase {
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

  insertAfter(circularList) {
    if (!this.isCompatible(circularList)) throw new Error('Incompatible lists');

    const head = circularList.head;
    if (head) {
      splice(this, this.head, {prevFrom: head, to: head});
      circularList.head = null;
    }

    return this.makePtr();
  }

  moveAfter(ptr) {
    if (!this.isCompatible(ptr.list)) throw new Error('Incompatible lists');

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
    if (!this.isCompatible(ptr.list)) throw new Error('Incompatible lists');
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
    tail[this.nextName] = head;

    this.head = head;

    return this;
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
    return new CircularSList(this);
  }

  make(head = null) {
    return new CircularSList(head, this);
  }
}

CircularSList.Ptr = Ptr;

copyDescriptors(CircularSList, 'adoptNode, isCompatibleNames, isNodeLike', HeadNode);

addAliases(CircularSList, {
  addNodeAfter: 'addAfter',
  removeNodeAfter: 'removeAfter',
  getNodeIterator: 'getIterator'
});

export default CircularSList;
