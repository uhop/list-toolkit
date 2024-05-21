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
    return this.isEmpty ? null : {prevFrom: new Ptr(this), to: this.last};
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

  extractRange({from, to = from} = {}) {
    const fromPtr = from;
    if (!(fromPtr instanceof Ptr)) throw new Error('"from" is not a compatible pointer');
    if (!this.isCompatible(fromPtr.list)) throw new Error('Incompatible "fromPtr" list');
    if (to instanceof Ptr) {
      if (!this.isCompatible(to.list)) throw new Error('Incompatible "to" list');
      if (fromPtr.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
      to = to.node;
    } else {
      if (!this.isNodeLike(to)) throw new Error('"to" is not a compatible node');
    }

    if (this.last === to) this.last = fromPtr.prev;

    const extracted = this.make();
    append(this, extracted, {prevFrom: fromPtr.prev, to});
    extracted.last = to;

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

  releaseCircularListAsRange() {
    const range = this.range;
    return range ? extract(this, range).extracted : null;
  }

  releaseCircularList() {
    return this.releaseCircularListAsRange()?.prevFrom[this.nextName];
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

  getNodeIterator({from, to} = {}) {
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

  getPtrIterator({from, to} = {}) {
    const fromPtr = from || this.frontPtr;
    if (!(fromPtr instanceof Ptr)) throw new Error('"fromPtr" is not a compatible pointer');
    if (!this.isCompatible(fromPtr.list)) throw new Error('"fromPtr" is not compatible with this list');

    if (to instanceof Ptr) {
      if (fromPtr.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
      to = to.node;
    }
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

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
