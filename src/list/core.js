'use strict';

import {HeadNode, isCircularList} from './nodes.js';
import {pop, extract, splice, append} from './basics.js';
import Ptr from './ptr.js';
import {addAliases, mapIterator} from '../meta-utils.js';

export class List extends HeadNode {
  get isEmpty() {
    return this[this.nextName] === this;
  }

  get isOne() {
    return this[this.nextName] !== this && this[this.nextName][this.nextName] === this;
  }

  get isOneOrEmpty() {
    return this[this.nextName][this.nextName] === this;
  }

  get front() {
    return this[this.nextName];
  }

  get back() {
    return this[this.prevName];
  }

  get range() {
    return this[this.nextName] === this ? null : {from: this[this.nextName], to: this[this.prevName]};
  }

  get frontPtr() {
    return new Ptr(this, this.front);
  }

  get backPtr() {
    return new Ptr(this, this.back);
  }

  popFrontNode() {
    if (!this.isEmpty) return pop(this, this[this.nextName]).extracted;
  }

  popBackNode() {
    if (!this.isEmpty) return pop(this, this[this.prevName]).extracted;
  }

  pushFrontNode(node) {
    splice(this, this[this.nextName], this.adoptNode(node));
    return this;
  }

  pushBackNode(node) {
    splice(this, this, this.adoptNode(node));
    return this;
  }

  getLength() {
    let n = 0;
    const nextName = this.nextName;
    for (let p = this[nextName]; p !== this; ++n, p = p[nextName]);
    return n;
  }

  makePtr(node) {
    if (node && !this.isNodeLike(node)) throw new Error('Not a compatible node');
    return new Ptr(this, node || this.front);
  }

  appendFront(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const head = extract(this, {from: list[this.nextName], to: list[this.prevName]}).extracted;
    splice(this, this[this.nextName], head);

    return this;
  }

  appendBack(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const head = extract(this, {from: list[this.nextName], to: list[this.prevName]}).extracted;
    splice(this, this, head);

    return this;
  }

  moveToFront(node) {
    if (node instanceof Ptr) {
      if (!this.isCompatible(node.list)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.isNodeLike(node)) throw new Error('Not a compatible node');
    }

    if (this[this.nextName] === node) return this;
    splice(this, this[this.nextName], pop(this, node).extracted);

    return this;
  }

  moveToBack(node) {
    if (node instanceof Ptr) {
      if (!this.isCompatible(node.list)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.isNodeLike(node)) throw new Error('Not a compatible node');
    }

    if (this[this.prevName] === node) return this;
    splice(this, this, pop(this, node).extracted);

    return this;
  }

  clear(drop) {
    if (drop) {
      while (!this.isEmpty) this.popFrontNode();
    } else {
      this[this.nextName] = this[this.prevName] = this;
    }
    return this;
  }

  removeNode(node) {
    if (node instanceof Ptr) {
      if (!this.isCompatible(node.list)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.isNodeLike(node)) throw new Error('Not a compatible node');
    }
    pop(this, node);
    return this;
  }

  remove(from, to = from, drop) {
    this.extract(from, to).clear(drop);
    return this;
  }

  extract(from, to = from) {
    if (from instanceof Ptr) {
      if (to instanceof Ptr) {
        if (from.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof Ptr) to = to.node;
    }
    if (!this.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (!this.isNodeLike(to)) throw new Error('"to" is not a compatible node');
    return append(this, this.make(), {from, to});
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    while (this.isEmpty && condition(this.front)) extracted.pushBack(this.popFront());
    if (this.isOneOrEmpty) return extracted;

    for (const ptr of this.getPtrIterator(this.front[this.nextName])) {
      if (condition(ptr.node)) extracted.pushBack(ptr.remove());
    }

    return extracted;
  }

  reverse() {
    let current = this;
    do {
      const next = current[this.nextName];
      current[this.nextName] = current[this.prevName];
      current[this.prevName] = next;
      current = next;
    } while (current !== this);
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

    this[this.nextName] = this[this.prevName] = this;
    splice(this, this, head);

    return this;
  }

  releaseCircularList() {
    return this.isEmpty ? null : pop(this, this).rest;
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

  getNodeIterator(from, to) {
    if (from instanceof Ptr) {
      if (to instanceof Ptr) {
        if (from.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof Ptr) to = to.node;
    }
    if (from && !this.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

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

  getPtrIterator(from, to) {
    return mapIterator(this.getNodeIterator(from, to), node => new Ptr(this, node));
  }

  getReverseNodeIterator(from, to) {
    if (from instanceof Ptr) {
      if (to instanceof Ptr) {
        if (from.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof Ptr) to = to.node;
    }
    if (from && !this.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

    return {
      [Symbol.iterator]: () => {
        let current = to || this[this.prevName],
          readyToStop = this.isEmpty;
        const stop = from ? from[this.prevName] : this;
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
    return List.from(this, this);
  }

  make() {
    return new List(this);
  }

  makeFrom(values) {
    return List.from(values, this);
  }

  static from(values, options) {
    const list = new List(options);
    for (const value of values) list.pushBack(value);
    return list;
  }

  static fromCircularList(circularList) {
    if (!isCircularList(circularList)) throw new Error('Not a circular list');

    const list = new List(circularList);
    if (circularList.isEmpty) return list;

    splice(circularList, list, circularList.head);
    circularList.clear();

    return list;
  }
}

addAliases(List, {
  popFrontNode: 'popFront, pop',
  pushFrontNode: 'pushFront, push',
  popBackNode: 'popBack',
  pushBackNode: 'pushBack',
  getNodeIterator: 'getIterator',
  getReverseNodeIterator: 'getReverseIterator',
  appendBack: 'append'
});

export default List;
