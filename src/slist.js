'use strict';

import {addAliases} from './meta-utils.js';

export class Node {
  constructor() {
    this.next = this;
  }
}

export class ValueNode extends Node {
  constructor(value) {
    super();
    this.value = value;
  }
}

// useful low-level operations on singly linked lists

const pop = prev => {
  const node = prev.next;
  prev.next = node.next;
  node.next = node;
  return {node, list: prev};
};

// a range is represented as {prevFrom, to}

const extract = ({prevFrom, to = prevFrom.next}) => {
  const node = prevFrom.next;
  prevFrom.next = to.next; // exclude the range
  to.next = node; // circle the range making node a list head
  return {prevFrom: to, to};
};

const splice = (target, {prevFrom, to = prevFrom.next}) => {
  const tail = target.next;
  target.next = prevFrom.next;
  prevFrom.next = to.next; // exclude the range
  to.next = tail;
  return target;
};

const append = (target, {prevFrom, to = prevFrom.next}) => {
  const head = prevFrom.next,
    next = target.next;
  prevFrom.next = to.next; // exclude the range
  // include the range
  target.next = head;
  to.next = next;
  return target;
};

const isNodeLike = node => node && node.next;
const isStandAlone = node => node && node.next === node;

export class Ptr {
  constructor(list, prev) {
    if (list instanceof Ptr) {
      this.list = list.list;
      this.prev = list.prev;
    } else if (prev instanceof Ptr) {
      if (list !== prev.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.prev = prev.prev;
    } else {
      this.list = list;
      this.prev = prev || list;
    }
  }

  get node() {
    return this.prev.next;
  }
  get isHead() {
    return this.prev.next === this.list;
  }
  next() {
    this.prev = this.prev.next;
    return this;
  }
  clone() {
    return new Ptr(this);
  }
  remove() {
    const node = this.prev.next;
    if (node === this.list || node === this.prev) return null;
    this.prev.next = node.next;
    node.next = node;
    return node;
  }
  addBefore(value) {
    const node = value instanceof ValueNode ? (value.next = value) : new ValueNode(value);
    splice(this.prev, {prevFrom: node});
    return this;
  }
  addAfter(value) {
    const node = new ValueNode(value);
    splice(this.prev.next, {prevFrom: node});
    return this;
  }
  insertBefore(list) {
    splice(this.prev, {prevFrom: list, to: list});
    return this;
  }
  insertAfter(list) {
    splice(this.prev.next, {prevFrom: list, to: list});
    return this;
  }
}

export class SList extends Node {
  get isEmpty() {
    return this.next === this;
  }

  get front() {
    return this.next;
  }

  get frontPtr() {
    return new Ptr(this);
  }

  getLength() {
    let n = 0;
    for (let p = this.next; p !== this; ++n, p = p.next);
    return n;
  }

  isNodeLike(node) {
    return isNodeLike(node);
  }

  isValidValueNode(node) {
    return node instanceof ValueNode && isStandAlone(node);
  }

  makePtr(prev) {
    return new Ptr(this, prev || this);
  }

  popFront() {
    if (this.next !== this) {
      return pop(this).node.value;
    }
  }

  popFrontNode() {
    if (this.next !== this) {
      return pop(this).node;
    }
  }

  pushFront(value) {
    const node = this.isValidValueNode(value) ? (value.next = value) : new ValueNode(value);
    splice(this, {prevFrom: node});
    return this;
  }

  moveToFront(ptr) {
    if (!ptr.isHead) splice(this, {prevFrom: ptr.prev});
    return this;
  }

  clear() {
    this.next = this;
    return this;
  }

  remove(fromPtr, to = fromPtr) {
    this.extract(fromPtr, to);
    return this;
  }

  extract(fromPtr, to = fromPtr) {
    if (fromPtr instanceof Ptr) {
      if (to instanceof Ptr) {
        if (fromPtr.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
    } else {
      if (to instanceof Ptr) to = to.node;
    }
    return splice(new SList(), extract({prevFrom: fromPtr.prev, to}));
  }

  extractBy(condition) {
    const extracted = this.make();
    let tail = extracted;
    for (let prev = this, current = prev.next; current !== this; ) {
      if (condition(current)) {
        prev.next = current.next;
        tail.next = current;
        tail = current;
        current = prev.next;
      } else {
        prev = current;
        current = current.next;
      }
    }
    tail.next = extracted;
    return extracted;
  }

  reverse() {
    let prev = this,
      current = prev.next;
    while (current !== this) {
      const next = current.next;
      current.next = prev;
      prev = current;
      current = next;
    }
    this.next = prev;
    return this;
  }

  sort(compareFn) {
    let current = this.next;
    for (const value of Array.from(this).sort(compareFn)) {
      current.value = value;
      current = current.next;
    }
    return this;
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.next;
    return {
      next: () => {
        if (current === this) return {done: true};
        const value = current.value;
        current = current.next;
        return {value};
      }
    };
  }

  getIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        const nodeIterable = this.getNodeIterable(from, to)[Symbol.iterator]();
        return {
          next: () => {
            const result = nodeIterable.next();
            if (result.done) return result;
            return {value: result.value.value};
          }
        };
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
    return {
      [Symbol.iterator]: () => {
        let current = from || this.next;
        const stop = to ? to.next : this;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const value = current;
            current = current.next;
            return {value};
          }
        };
      }
    };
  }

  getPtrIterable(fromPtr, to) {
    fromPtr ??= this.frontPtr;
    if (to instanceof Ptr) {
      if (fromPtr.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
      to = to.node;
    }
    return {
      [Symbol.iterator]: () => {
        const current = fromPtr.clone(),
          stop = to ? to.next : this;
        return {
          next: () => {
            if (current.node === stop) return {done: true};
            const value = current.clone();
            current.next();
            return {value};
          }
        };
      }
    };
  }

  // helpers

  clone() {
    return SList.from(this);
  }

  make() {
    return new SList();
  }

  makeFrom(values) {
    return SList.from(values);
  }

  static from(values) {
    const list = new Builder();
    for (const value of values) list.pushBack(value);
    return list;
  }
}

export class Builder extends SList {
  constructor() {
    super();
    this.last = this;
  }

  get range() {
    return {prevFrom: this, to: last};
  }

  get rangePtr() {
    return {prevFrom: new Ptr(this), to: last};
  }

  syncLast() {
    this.last = this;
    while (this.last.next !== this) this.last = this.last.next;
    return this;
  }

  pushBack(value) {
    const node = this.isValidValueNode(value) ? (value.next = value) : new ValueNode(value);
    node.next = this.last.next;
    this.last = this.last.next = node;
    return this;
  }

  static from(list) {
    const builder = new Builder(list);
    if (list.isEmpty) return builder;

    let last = list.next;
    while (last.next !== list) last = last.next;
    splice(builder, {prevFrom: list, to: last});
    builder.last = last;

    return builder;
  }
}

Object.assign(SList, {pop, extract, splice, append, isNodeLike, isStandAlone, Node, ValueNode, Ptr, Builder});
addAliases(SList, {popFront: 'pop', pushFront: 'push, pushFrontNode'});
addAliases(Builder, {pushBack: 'pushBackNode'});

export default SList;
