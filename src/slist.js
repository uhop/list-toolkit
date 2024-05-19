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
    if (this.list.last === node) this.list.last = this.prev;
    this.prev.next = node.next;
    node.next = node;
    return node;
  }
  addBefore(value) {
    const node = value instanceof ValueNode ? (value.next = value) : new ValueNode(value);
    node.next = this.prev.next;
    this.prev.next = node;
    if (this.list.last === this.list) this.list.last = node;
    return this;
  }
  addAfter(value) {
    const node = new ValueNode(value);
    if (this.list.last === this.prev.next) this.list.last = node;
    node.next = this.prev.next;
    this.prev.next = node;
    if (this.list.last === this.list) this.list.last = node;
    return this;
  }
  insertBefore(list) {
    if (this.list.last === this.list) this.list.last = list.last;
    splice(this.prev, {prevFrom: list, to: list.last});
    list.last = list;
    return this;
  }
  insertAfter(list) {
    if (this.list.last === this.prev.next) this.list.last = list.last;
    splice(this.prev.next, {prevFrom: list, to: list.last});
    list.last = list;
    return this;
  }
}

export class SList extends Node {
  constructor() {
    super();
    this.last = this;
  }

  get isEmpty() {
    return this.next === this;
  }

  get isOne() {
    return this.next !== this && this.next.next === this;
  }

  get isOneOrEmpty() {
    return this.next.next === this;
  }

  get isLastValid() {
    return this.last.next === this;
  }

  get front() {
    return this.next;
  }

  get back() {
    return this.last;
  }

  get frontPtr() {
    return new Ptr(this);
  }

  get range() {
    return {prevFrom: this, to: last};
  }

  get rangePtr() {
    return {prevFrom: new Ptr(this), to: last};
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
    if (this.next === this) return undefined;
    const node = this.next;
    this.next = node.next;
    if (this.next === this) this.last = this;
    return node.value;
  }

  popFrontNode() {
    if (this.next === this) return undefined;
    const node = this.next;
    this.next = node.next;
    if (this.next === this) this.last = this;
    return (node.next = node);
  }

  pushFront(value) {
    const node = this.isValidValueNode(value) ? (value.next = value) : new ValueNode(value);
    node.next = this.next;
    this.next = node;
    if (node.next === this) this.last = node;
    return this;
  }

  pushBack(value) {
    const node = this.isValidValueNode(value) ? (value.next = value) : new ValueNode(value);
    node.next = this;
    this.last = this.last.next = node;
    return this;
  }

  appendFront(list) {
    if (list.next !== list) {
      if (this.last === this) this.last = list.last;
      list.next = list.last = list;
    }
    return this;
  }

  appendBack(list) {
    if (list.next !== list) {
      this.last.next = list.next;
      list.last.next = this;
      this.last = list.last;
      list.next = list.last = list;
    }
    return this;
  }

  moveToFront(ptr) {
    if (ptr.isHead) return this;
    const node = ptr.remove();
    return this.pushFrontNode(node);
  }

  moveToBack(ptr) {
    if (ptr.isHead) return this;
    const node = ptr.remove();
    return this.pushBackNode(node);
  }

  clear() {
    this.next = this.last = this;
    return this;
  }

  remove(fromPtr, to = fromPtr) {
    this.extract(fromPtr, to);
    return this;
  }

  extract(fromPtr, to = fromPtr) {
    if (fromPtr instanceof Ptr) {
      if (fromPtr.list !== this) throw new Error('Node specified by a pointer must belong to the same list');
      if (to instanceof Ptr) {
        if (fromPtr.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
    } else {
      if (to instanceof Ptr) {
        if (to.list !== this) throw new Error('Node specified by a pointer must belong to the same list');
        to = to.node;
      }
    }
    if (this.last === to) this.last = fromPtr.prev;
    const extracted = splice(this.make(), extract({prevFrom: fromPtr.prev, to}));
    extracted.last = to;
    return extracted;
  }

  extractBy(condition) {
    const extracted = this.make();
    let tail = extracted;
    for (let prev = (this.last = this), current = prev.next; current !== this; ) {
      if (condition(current)) {
        prev.next = current.next;
        tail = tail.next = current;
        current = prev.next;
      } else {
        prev = this.last = current;
        current = current.next;
      }
    }
    tail.next = extracted;
    extracted.last = tail;
    return extracted;
  }

  reverse() {
    if (this.next.next === this) return this; // 0 or 1 elements
    let prev = this,
      current = prev.next;
    this.last = this.next;
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
    if (this.next.next === this) return this; // 0 or 1 elements
    let current = this.next;
    for (const value of Array.from(this).sort(compareFn)) {
      current.value = value;
      current = current.next;
    }
    return this;
  }

  syncLast() {
    this.last = this;
    while (this.last.next !== this) this.last = this.last.next;
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
    const list = new SList();
    for (const value of values) list.pushBack(value);
    return list;
  }
}

Object.assign(SList, {pop, extract, splice, append, isNodeLike, isStandAlone, Node, ValueNode, Ptr});
addAliases(SList, {popFront: 'pop', pushFront: 'push, pushFrontNode', pushBack: 'pushBackNode'});

export default SList;
