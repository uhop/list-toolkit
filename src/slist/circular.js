'use strict';

import {CircularListBase, HeadNode, PtrBase} from './nodes.js';
import {pop, extract, splice} from './basics.js';
import {addAliases, copyDescriptors, mapIterator} from '../meta-utils.js';

export class Ptr extends PtrBase {
  constructor(list, prev) {
    super(list, prev, CircularSList);
    this.prev ||= this.list.head;
  }
  clone() {
    return new Ptr(this);
  }
}

export class CircularSList extends CircularListBase {
  makePtr(prev) {
    if (prev && !this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');
    prev ||= this.head;
    return prev ? new Ptr(this, prev) : null;
  }

  // Ptr API

  removeNodeAfter() {
    return this.head ? this.removeNode(this.head) : null;
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
    if (!(circularList instanceof CircularSList) || !this.isCompatibleNames(circularList)) throw new Error('Incompatible lists');

    const head = circularList.head;
    if (head) {
      splice(this, this.head, {prevFrom: head, to: head});
      circularList.head = null;
    }

    return this.makePtr();
  }

  moveAfter(prev) {
    if (!this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');

    if (!this.head) {
      this.head = pop(this, prev).extracted.to;
      return this;
    }

    if (this.head === prev) return this;

    if (this.head === prev[this.nextName]) {
      if (this.head === this.head[this.nextName]) return this;
      this.head = this.head[this.nextName];
    }

    splice(this, this.head, {prevFrom: pop(this, prev).extracted.to});

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

  removeNode(prev) {
    if (!this.head) return null;
    if (!this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');
    if (this.head === prev[this.nextName]) {
      if (this.head === this.head[this.nextName]) {
        this.head = null;
        return prev[this.nextName];
      }
      this.head = this.head[this.nextName];
    }
    return pop(this, prev).extracted.to;
  }

  removeRange(range, drop) {
    this.extractRange(range).clear(drop);
    return this;
  }

  extractRange(range = {}) {
    const {prevFrom = this.head, to = prevFrom} = range;
    if (!this.isNodeLike(prevFrom) || !this.isNodeLike(to)) throw new Error('"range" is not a compatible node range');
    const extracted = this.make();
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

  getNodeIterator({from, to} = {}) {
    if (from && !this.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

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
    return mapIterator(this.getNodeIterator(range), node => new Ptr(this, node));
  }

  // meta helpers

  clone() {
    return new CircularSList(this);
  }

  make(head = null) {
    return new CircularSList(head, this);
  }
}

copyDescriptors(CircularSList, 'adoptNode, isCompatibleNames, isNodeLike', HeadNode);

addAliases(CircularSList, {
  addNodeAfter: 'addAfter',
  removeNodeAfter: 'removeAfter',
  getNodeIterator: 'getIterator'
});

export default CircularSList;
