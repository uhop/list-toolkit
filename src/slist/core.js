'use strict';

import {addAliases} from '../meta-utils.js';
import {HeadNode} from './nodes.js';
import {extract, splice} from './basics.js';
import Ptr from './ptr.js';

export class SList extends HeadNode {
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
    return this.last;
  }

  get frontPtr() {
    return new Ptr(this, this);
  }

  get range() {
    return {prevFrom: this, to: this.last};
  }

  get rangePtr() {
    return {prevFrom: new Ptr(this), to: this.last};
  }

  getLength() {
    let n = 0;
    for (let p = this[this.nextName]; p !== this; ++n, p = p[this.nextName]);
    return n;
  }

  makePtr(prev) {
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
    node = this.adopt(node);
    node[this.nextName] = this[this.nextName];
    this[this.nextName] = node;
    if (node[this.nextName] === this) this.last = node;
    return this;
  }

  pushBackNode(node) {
    node = this.adopt(node);
    node[this.nextName] = this;
    this.last = this.last[this.nextName] = node;
    return this;
  }

  appendFront(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    list.last[this.nextName] = this[this.nextName];
    this[this.nextName] = list[this.nextName];
    if (list.last[this.nextName] === this) this.last = list.last;

    list[this.nextName] = list.last = list;
    return this;
  }

  appendBack(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    this.last[this.nextName] = list[this.nextName];
    list.last[this.nextName] = this;
    this.last = list.last;

    list[this.nextName] = list.last = list;
    return this;
  }

  moveToFront(ptr) {
    if (!this.isCompatible(ptr.list)) throw new Error('Incompatible lists');
    if (ptr.isHead) return this;
    const node = ptr.remove();
    return this.pushFrontNode(node);
  }

  moveToBack(ptr) {
    if (!this.isCompatible(ptr.list)) throw new Error('Incompatible lists');
    if (ptr.isHead) return this;
    const node = ptr.remove();
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

  remove(fromPtr, to = fromPtr, drop) {
    this.extract(fromPtr, to).clear(drop);
    return this;
  }

  extract(fromPtr, to = fromPtr) {
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
    splice(this, extracted, extract(this, {prevFrom: fromPtr.prev, to}));
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

    const sortedNodes = Array.from(this.getNodeIterable()).sort(compareFn);

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

  getNodeIterable(from, to) {
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

  getPtrIterable(fromPtr, to) {
    fromPtr ??= this.frontPtr;
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

  static from(values, options) {
    const list = new SList(options);
    for (const value of values) list.pushBack(value);
    return list;
  }
}

addAliases(SList, {
  popFrontNode: 'popFront, pop',
  pushFrontNode: 'pushFront, push',
  pushBackNode: 'pushBack',
  getNodeIterable: 'getIterable',
  pushBackNode: 'pushBack'
});

export default SList;
