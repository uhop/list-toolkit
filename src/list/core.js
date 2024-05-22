'use strict';

import {CircularListBase, HeadNode} from './nodes.js';
import {pop, splice, append} from './basics.js';
import Ptr from './ptr.js';
import {addAliases, mapIterator} from '../meta-utils.js';

export class List extends HeadNode {
  get frontPtr() {
    return new Ptr(this, this.front);
  }

  get backPtr() {
    return new Ptr(this, this.back);
  }

  makePtr(node) {
    return new Ptr(this, node || this.front);
  }

  popFrontNode() {
    if (!this.isEmpty) return pop(this, this[this.nextName]).extracted;
  }

  popBackNode() {
    if (!this.isEmpty) return pop(this, this[this.prevName]).extracted;
  }

  pushFrontNode(node) {
    return this.makePtr(splice(this, this[this.nextName], this.adoptNode(node)));
  }

  pushBackNode(node) {
    return this.makePtr(splice(this, this, this.adoptNode(node)));
  }

  appendFront(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const head = list[this.nextName];
    append(this, this, {from: head, to: list[this.prevName]});

    return this.makePtr();
  }

  appendBack(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const head = list[this.nextName];
    append(this, this[this.prevName], {from: head, to: list[this.prevName]});

    return this.makePtr(head);
  }

  moveToFront(node) {
    node = this.normalizeNode(node);
    if (this[this.nextName] === node) return this;
    splice(this, this[this.nextName], pop(this, node).extracted);
    return this;
  }

  moveToBack(node) {
    node = this.normalizeNode(node);
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
    pop(this, this.normalizeNode(node));
    return this;
  }

  removeRange(range, drop) {
    return this.extractRange(range).clear(drop);
  }

  extractRange(range = {}) {
    range = this.normalizeRange(range);
    range.from ||= this.front;
    range.to ||= this.back;
    return append(this, this.make(), range);
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    while (this.isEmpty && condition(this.front)) extracted.pushBack(this.popFront());
    if (this.isOneOrEmpty) return extracted;

    for (const ptr of this.getPtrIterator({from: this.front[this.nextName]})) {
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

  releaseRawCircularList() {
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

  getPtrIterator(range) {
    return mapIterator(this.getNodeIterator(range), node => new Ptr(this, node));
  }

  getReverseNodeIterator(range = {}) {
    range = this.normalizeRange(range);
    const {from, to} = range;
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

  getReversePtrIterator(range) {
    return mapIterator(this.getReverseNodeIterator(range), node => new Ptr(this, node));
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

  makeFromRange(range) {
    return List.fromRange(range, this);
  }

  static from(values, options) {
    const list = new List(options);
    for (const value of values) list.pushBack(value);
    return list;
  }

  static fromRange(range, options) {
    const list = new List(options);
    if (!range) return list;

    range = list.normalizeRange(range);
    if (!range.from || !range.to) throw new Error('"range" should be fully specified');

    return append(list, list, range);
  }

  static fromCircularList(circularList) {
    if (!(circularList instanceof CircularListBase)) throw new Error('Not a circular list');

    const list = new List(circularList);
    if (circularList.isEmpty) return list;

    splice(circularList, list, circularList.head);
    circularList.clear();

    return list;
  }
}

List.Ptr = Ptr;

addAliases(List, {
  popFrontNode: 'popFront, pop',
  pushFrontNode: 'pushFront, push',
  popBackNode: 'popBack',
  pushBackNode: 'pushBack',
  getNodeIterator: 'getIterator',
  getReverseNodeIterator: 'getReverseIterator',
  appendBack: 'append'
});

export {Ptr}
export default List;
