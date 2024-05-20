'use strict';

import {CIRCULAR_LIST_MARKER, HeadNode} from './nodes.js';
import {pop, extract, splice} from './basics.js';
import {addAliases, copyDescriptors} from '../meta-utils.js';

export class Ptr {
  constructor(list, node) {
    if (list instanceof Ptr) {
      this.list = list.list;
      this.node = list.node;
      return;
    }
    if (!(list instanceof CircularList)) throw new Error('List must be a CircularList');
    if (node instanceof Ptr) {
      if (list !== node.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.node = node.node;
    } else {
      this.list = list;
      this.node = node;
    }
  }
  next() {
    this.node = this.node[this.list.nextName];
    return this;
  }
  prev() {
    this.node = this.node[this.list.prevName];
    return this;
  }
  clone() {
    return new Ptr(this);
  }
}

export class CircularList {
  constructor(head = null, {nextName = 'next', prevName = 'prev'} = {}) {
    this[CIRCULAR_LIST_MARKER] = CIRCULAR_LIST_MARKER;
    if (head instanceof CircularList) {
      this.nextName = head.nextName;
      this.prevName = head.prevName;
      this.adoptHead(head.head);
      return;
    }
    this.nextName = nextName;
    this.prevName = prevName;
    this.adoptHead(head);
  }

  get isEmpty() {
    return !this.head;
  }

  get isOne() {
    return this.head && this.head[this.nextName] === this.head;
  }

  get isOneOrEmpty() {
    return !this.head || this.head[this.nextName] === this.head;
  }

  get front() {
    return this.head;
  }

  get back() {
    return this.head?.[this.prevName];
  }

  get range() {
    return this.head ? {from: this.head, to: this.head[this.prevName]} : null;
  }

  makePtr(node) {
    node ||= this.head;
    return node ? new Ptr(this, node) : null;
  }

  getLength() {
    if (!this.head) return 0;

    let n = 0,
      current = this.head;
    do {
      current = current[this.nextName];
      ++n;
    } while (current !== this.head);

    return n;
  }

  adoptHead(head) {
    if (head && !this.isNodeLike(head)) throw new Error('"head" is not a compatible node');
    this.head = head;
  }

  // Ptr API

  next() {
    if (this.head) this.head = this.head[this.nextName];
    return this;
  }

  prev() {
    if (this.head) this.head = this.head[this.prevName];
    return this;
  }

  remove() {
    if (!this.head) return null;
    if (this.head[this.nextName] === this.head) {
      const node = this.head;
      this.head = null;
      return node;
    }
    const result = pop(this, this.head);
    this.head = result.rest;
    return result.extracted;
  }

  removeNodeBefore() {
    return this.head ? this.removeNode(this.head[this.prevName]) : null;
  }

  removeNodeAfter() {
    return this.head ? this.removeNode(this.head[this.nextName]) : null;
  }

  addNodeBefore(node) {
    node = this.adoptNode(node);
    if (this.head) {
      splice(this, this.head, node);
    } else {
      this.head = node;
    }
    return this;
  }

  addNodeAfter(node) {
    node = this.adoptNode(node);
    if (this.head) {
      splice(this, this.head[this.nextName], node);
    } else {
      this.head = node;
    }
    return this;
  }

  insertBefore(circularList) {
    if (!(circularList instanceof CircularList) || !this.isCompatibleNames(circularList)) throw new Error('Incompatible lists');

    const head = circularList.head;
    if (head) {
      splice(this, this.head, head);
      circularList.head = null;
    }

    return this;
  }

  insertAfter(circularList) {
    if (!(circularList instanceof CircularList) || !this.isCompatibleNames(circularList)) throw new Error('Incompatible lists');

    const head = circularList.head;
    if (head) {
      splice(this, this.head[this.nextName], head);
      circularList.head = null;
    }

    return this;
  }

  moveBefore(node) {
    if (!this.isNodeLike(node)) throw new Error('"node" is not a compatible node');

    if (this.head === node) {
      this.head = this.head[this.nextName];
      return this;
    }

    pop(this, node);
    if (this.head) {
      splice(this, this.head, node);
    } else {
      this.head = node;
    }

    return this;
  }

  moveAfter(node) {
    if (!this.isNodeLike(node)) throw new Error('"node" is not a compatible node');

    if (this.head === node) {
      this.head = this.head[this.prevName];
      return this;
    }

    pop(this, node);
    if (this.head) {
      splice(this, this.head[this.nextName], node);
    } else {
      this.head = node;
    }

    return this;
  }

  // List API

  clear(drop) {
    if (drop) {
      for (const current of this.getNodeIterator()) {
        current[this.nextName] = current[this.prevName] = current; // make stand-alone
      }
    }
    this.head = null;
    return this;
  }

  removeNode(node) {
    if (!this.head) return null;
    if (!this.isNodeLike(node)) throw new Error('"node" is not a compatible node');

    if (this.head === node) {
      if (this.head[this.nextName] === this.head) {
        this.head = null;
        return node;
      }
      this.head = this.head[this.nextName];
    }

    return pop(this, node).extracted;
  }

  removeRange(range, drop) {
    this.extractRange(range).clear(drop);
    return this;
  }

  extractRange(range = {}) {
    const {from = this.head, to = from} = range;
    if (from && !this.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

    const extracted = this.make();
    if (!this.head) return extracted;
    if (this.head === from || this.head === to) this.head = to[this.nextName];
    if (this.head === from) this.head = null;
    extracted.head = extract(this, {from, to}).extracted;
    return extracted;
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    const rest = this.make();
    for (const current of this.getNodeIterator()) {
      current[this.nextName] = current[this.prevName] = current; // make stand-alone
      (condition(current) ? extracted : rest).addBefore(current);
    }
    this.head = rest.head;

    return extracted;
  }

  reverse() {
    if (this.isOneOrEmpty) return this;
    let current = this.head;
    do {
      const next = current[this.nextName];
      current[this.nextName] = current[this.prevName];
      current[this.prevName] = next;
      current = next;
    } while (current !== this.head);
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
      current[this.prevName] = prev;
    }

    const head = sortedNodes[0],
      tail = sortedNodes[sortedNodes.length - 1];
    tail[this.nextName] = head;
    head[this.prevName] = tail;

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

  getNodeIterator(from, to) {
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

  getPtrIterator(from, to) {
    return mapIterator(this.getNodeIterator(from, to), node => new Ptr(this, node));
  }

  getReverseNodeIterator(from, to) {
    if (from && !this.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

    return {
      [Symbol.iterator]: () => {
        let readyToStop = this.isEmpty,
          current = readyToStop ? null : to || this.head[this.prevName];
        const stop = readyToStop ? null : from ? from[this.prevName] : this.head[this.prevName];
        return {
          next: () => {
            if (readyToStop && current === stop) return {done: true};
            readyToStop = true;
            const value = current;
            current = current[this.prevName];
            return {value};
          }
        };
      }
    };
  }

  getReversePtrIterator(from, to) {
    return mapIterator(this.getReverseNodeIterator(from, to), node => new Ptr(this, node));
  }

  // meta helpers

  clone() {
    return new CircularList(this);
  }

  make(head = null) {
    return new CircularList(head, this);
  }
}

copyDescriptors(CircularList, 'adoptNode, isCompatibleNames, isNodeLike', HeadNode);

addAliases(CircularList, {
  addNodeBefore: 'addBefore',
  addNodeAfter: 'addAfter',
  removeNodeBefore: 'removeBefore',
  removeNodeAfter: 'removeAfter',
  getNodeIterator: 'getIterator',
  getReverseNodeIterator: 'getReverseIterator'
});

export default CircularList;
