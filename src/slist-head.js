'use strict';

import {addAliases} from './meta-utils.js';

export class Node {
  constructor({nextName = 'next'} = {}) {
    this.nextName = nextName;
    this[nextName] = this;
  }
}

export class HeadNode extends Node {
  constructor(options) {
    super(options);
    this.last = this;
  }
}

export class UnsafeHead {
  constructor(head) {
    this.head = head;
  }
}

export const unsafe = head => new UnsafeHead(head);

// useful low-level operations on singly linked lists

const pop = ({nextName}, prev) => {
  const node = prev[nextName];
  prev[nextName] = node[nextName];
  node[nextName] = node;
  return {node, list: prev};
};

const extract = ({nextName}, {prevFrom, to = prevFrom[nextName]}) => {
  const node = prevFrom[nextName];
  prevFrom[nextName] = to[nextName]; // exclude the range
  to[nextName] = node; // circle the range making node a list head
  return {prevFrom: to, to};
};

const splice = ({nextName}, target, {prevFrom, to = prevFrom[nextName]}) => {
  const tail = target[nextName];
  target[nextName] = prevFrom[nextName];
  prevFrom[nextName] = to[nextName]; // exclude the range
  to[nextName] = tail;
  return target;
};

const append = ({nextName}, target, {prevFrom, to = prevFrom[nextName]}) => {
  const head = prevFrom[nextName],
    next = target[nextName];
  prevFrom[nextName] = to[nextName]; // exclude the range
  // include the range
  target[nextName] = head;
  to[nextName] = next;
  return target;
};

const isNodeLike = ({nextName}, node) => node && node[nextName];
const isStandAlone = ({nextName}, node) => node && node[nextName] === node;

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
    return this.prev[this.list.nextName];
  }
  get isHead() {
    return this.prev[this.list.nextName] === this.list.head;
  }
  next() {
    this.prev = this.prev[this.list.nextName];
    return this;
  }
  clone() {
    return new Ptr(this);
  }
  remove() {
    const node = this.prev[this.list.nextName];
    if (node === this.list || node === this.prev) return null;
    if (!this.list.isHeadless && this.list.head.last === node) this.list.head.last = this.prev;
    this.prev[this.list.nextName] = node[this.list.nextName];
    node[this.list.nextName] = node;
    return node;
  }
  addBefore(node) {
    this.list.adopt(node);
    node[this.list.nextName] = this.prev[this.list.nextName];
    this.prev[this.list.nextName] = node;
    this.prev = node;
    if (!this.list.isHeadless && this.list.head.last === this.list.head) this.list.head.last = node;
    return this;
  }
  addAfter(node) {
    this.list.adopt(node);
    const nextName = this.list.nextName;
    if (!this.list.isHeadless && this.list.head.last === this.prev[nextName]) this.list.head.last = node;
    node[nextName] = this.prev[nextName][nextName];
    this.prev[nextName][nextName] = node;
    return this;
  }
  insertBefore(list) {
    if (list.isHeadless) throw new Error('Cannot insert before a headless list');
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    splice(this.list, this.prev, {prevFrom: list.head, to: list.head.last});
    if (!this.list.isHeadless && this.list.head.last === this.list.head) this.list.head.last = list.head.last;
    this.prev = list.head.last;

    list.head.last = list.head;

    return this;
  }
  insertAfter(list) {
    if (list.isHeadless) throw new Error('Cannot insert after a headless list');
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    splice(this.list, this.prev[this.list.nextName], {prevFrom: list.head, to: list.head.last});
    if (!this.list.isHeadless && this.list.head.last === this.prev) this.list.head.last = list.head.last;

    list.head.last = list.head;

    return this;
  }
}

export class SListHead {
  constructor(head, {nextName = 'next'} = {}) {
    if (head instanceof SListHead) {
      this.nextName = head.nextName;
      this.head = head.head;
      return;
    }
    this.nextName = nextName;
    if (head instanceof UnsafeHead) {
      this.head = head.head;
      return;
    }
    if (this.isNodeLike(head)) {
      this.head = head;
      return;
    }
    this.head = new HeadNode(this);
  }

  get isHeadless() {
    return !(this.head instanceof HeadNode);
  }

  get isEmpty() {
    return this.head instanceof HeadNode && this.head[this.nextName] === this.head;
  }

  get isOne() {
    return this.head instanceof HeadNode
      ? this.head[this.nextName] !== this.head && this.head[this.nextName][this.nextName] === this.head
      : this.head[this.nextName] === this.head;
  }

  get isOneOrEmpty() {
    return this.head instanceof HeadNode ? this.head[this.nextName][this.nextName] === this.head : this.head[this.nextName] === this.head;
  }

  get front() {
    return this.head instanceof HeadNode ? this.head[this.nextName] : this.head;
  }

  get back() {
    return this.head instanceof HeadNode ? this.head.last : null;
  }

  get frontPtr() {
    return this.head instanceof HeadNode ? new Ptr(this, this.head) : null;
  }

  get range() {
    return this.head instanceof HeadNode ? {prevFrom: this.head, to: this.head.last} : null;
  }

  get rangePtr() {
    return this.head instanceof HeadNode ? {prevFrom: new Ptr(this.head), to: this.head.last} : null;
  }

  getLength() {
    let n = 0;
    for (let p = this.head[this.nextName]; p !== this.head; ++n, p = p[this.nextName]);
    if (this.isHeadless) ++n;
    return n;
  }

  isNodeLike(node) {
    return isNodeLike(this, node);
  }

  isCompatible(list) {
    return this === list || (list instanceof SListHead && this.nextName === list.nextName);
  }

  makePtr(prev) {
    return new Ptr(this, prev || (this.isHeadless ? null : this.head));
  }

  popFrontNode() {
    if (!(this.head instanceof HeadNode)) throw new Error('Cannot pop from headless list');
    if (this.head[this.nextName] === this) return undefined;
    const node = this.head[this.nextName];
    this.head[this.nextName] = node[this.nextName];
    if (this.head[this.nextName] === this) this.head.last = this.head;
    return (node[this.nextName] = node);
  }

  pushFrontNode(node) {
    if (!(this.head instanceof HeadNode)) throw new Error('Cannot push to headless list');
    this.adopt(node);
    node[this.nextName] = this.head[this.nextName];
    this.head[this.nextName] = node;
    if (node[this.nextName] === this.head) this.head.last = node;
    return this;
  }

  pushBackNode(node) {
    if (!(this.head instanceof HeadNode)) throw new Error('Cannot push to headless list');
    this.adopt(node);
    node[this.nextName] = this.head;
    this.head.last = this.head.last[this.nextName] = node;
    return this;
  }

  appendFront(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (this.isHeadless) throw new Error('Cannot append to headless list');
    if (list.isHeadless) throw new Error('Cannot append a headless list');
    if (list.isEmpty) return this;

    list.head.last[this.nextName] = this.head[this.nextName];
    this.head[this.nextName] = list.head[this.nextName];
    if (list.head.last[this.nextName] === this.head) this.head.last = list.head.last;

    list.head[this.nextName] = list.head.last = list.head;
    return this;
  }

  appendBack(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (!(this.head instanceof HeadNode)) throw new Error('Cannot append to headless list');
    if (list.isHeadless) throw new Error('Cannot append a headless list');
    if (list.isEmpty) return this;

    this.head.last[this.nextName] = list.head[this.nextName];
    list.head.last[this.nextName] = this.head;
    this.head.last = list.head.last;

    list.head[this.nextName] = list.head.last = list.head;
    return this;
  }

  moveToFront(ptr) {
    if (!this.isCompatible(ptr.list)) throw new Error('Incompatible lists');
    if (this.isHeadless) throw new Error('Cannot move to headless list');
    if (ptr.isHead) return this;
    const node = ptr.remove();
    return this.pushFrontNode(node);
  }

  moveToBack(ptr) {
    if (!this.isCompatible(ptr.list)) throw new Error('Incompatible lists');
    if (this.isHeadless) throw new Error('Cannot move to headless list');
    if (ptr.isHead) return this;
    const node = ptr.remove();
    return this.pushBackNode(node);
  }

  clear(drop) {
    if (drop) {
      const wasHeadless = this.isHeadless;
      let current = this.head;
      do {
        const next = current[this.nextName];
        current[this.nextName] = current;
        current = next;
      } while (current !== this.head);
      if (!wasHeadless) return this;
    }
    this.head = new HeadNode(this);
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

    if (this.isHeadless) {
      if (this.head === fromPtr.node) this.head = to[this.nextName];
    } else {
      if (this.head.last === to) this.head.last = fromPtr.prev;
    }

    const extracted = this.make();
    splice(this, extracted.head, extract(this, {prevFrom: fromPtr.prev, to}));
    extracted.head.last = to;

    return extracted;
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    if (this.isHeadless) {
      let head = null,
        current = this.head;
      do {
        if (condition(current)) {
          const next = current[this.nextName];
          current[this.nextName] = current;
          extracted.pushBackNode(current);
          current = next;
        } else {
          if (!head) head = current;
          current = current[this.nextName];
        }
      } while (current !== this.head);
      this.head = head || new HeadNode(this);
    } else {
      for (const ptr = this.frontPtr; !ptr.isHead;) {
        if (condition(ptr.node)) {
          extracted.pushBackNode(ptr.remove());
        } else {
          ptr.next();
        }
      }
    }
    return extracted;
  }

  reverse() {
    if (this.isOneOrEmpty) return this;
    const wasHeadless = this.isHeadless;
    if (!wasHeadless) this.head.last = this.head[this.nextName];
    let prev = this.head,
      current = prev[this.nextName];
    do {
      const next = current[this.nextName];
      current[this.nextName] = prev;
      prev = current;
      current = next;
    } while (current !== this.head);
    this.head[this.nextName] = prev;
    if (wasHeadless) this.head = this.head[this.nextName];
    return this;
  }

  sort(compareFn) {
    if (this.isOneOrEmpty) return this;

    const sortedNodes = Array.from(this).sort(compareFn);

    for (let i = 1; i < sortedNodes.length; i++) {
      const prev = sortedNodes[i - 1],
        current = sortedNodes[i];
      prev[this.nextName] = current;
    }

    const head = sortedNodes[0],
      tail = sortedNodes[sortedNodes.length - 1];

    if (this.isHeadless) {
      this.head = tail[this.nextName] = head;
    } else {
      this.head[this.nextName] = head;
      tail[this.nextName] = this.head;
      this.head.last = tail;
    }

    return this;
  }

  adopt(node) {
    if (node[this.nextName]) {
      if (node[this.nextName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node;
    return node;
  }

  syncLast() {
    if (this.isHeadless) return this;
    this.head.last = this.head;
    while (this.head.last[this.nextName] !== this.head) this.head.last = this.last[this.nextName];
    return this;
  }

  convertToHeadlessList() {
    if (this.isHeadless || this.isEmpty) return false;
    const front = this.head[this.nextName];
    this.head.last[this.nextName] = front;
    this.head = front;
    return true;
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.isHeadless ? this.head : this.head[this.nextName],
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
        let current = from || (this.isHeadless ? this.head : this.head[this.nextName]),
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this.head;
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
    if (!fromPtr && this.isHeadless) throw new Error('"fromPtr" is required for headless lists');
    fromPtr ??= this.frontPtr;
    if (!this.isCompatible(fromPtr.list)) throw new Error('"fromPtr" is not compatible with this list');

    if (to instanceof Ptr) {
      if (fromPtr.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
      to = to.node;
    }
    from = from.node;
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

    return {
      [Symbol.iterator]: () => {
        let current = fromPtr.clone(),
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this.head;
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
    return SListHead.from(this, this);
  }

  make(newHead = null) {
    return new SListHead(newHead, this);
  }

  makeFrom(values) {
    return SListHead.from(values, this);
  }

  static from(values, options) {
    const list = new SListHead(null, options);
    for (const value of values) list.pushBack(value);
    return list;
  }
}

Object.assign(SListHead, {pop, extract, splice, append, isNodeLike, isStandAlone, UnsafeHead, unsafe, Node, HeadNode, Ptr});
addAliases(SListHead, {popFrontNode: 'popFront, pop', pushFrontNode: 'pushFront, push', getNodeIterable: 'getIterable', pushBackNode: 'pushBack'});

export default SListHead;
