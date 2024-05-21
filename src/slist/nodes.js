'use strict';

import {copyDescriptors} from '../meta-utils.js';

export const isNodeLike = ({nextName}, node) => node && node[nextName];
export const isStandAlone = ({nextName}, node) => node && node[nextName] === node;
export const isCompatible = (options1, options2) => options1.nextName === options2.nextName;

export const isRangeLike = (options, range) => {
  if (!range) return true;
  if (range.list) {
    if (!isCompatible(options, range.list)) return false;
    if (range.from) {
      if (range.from instanceof PtrBase) {
        if (range.from.list !== range.list) return false;
      } else {
        if (!isNodeLike(options, range.from)) return false;
      }
    }
    if (range.to) {
      if (range.to instanceof PtrBase) {
        if (range.to.list !== range.list) return false;
      } else {
        if (!isNodeLike(options, range.to)) return false;
      }
    }
    return true;
  }
  if (range.from) {
    if (range.from instanceof PtrBase) {
      if (!isCompatible(options, range.from.list)) return false;
    } else {
      if (!isNodeLike(options, range.from)) return false;
    }
  }
  if (range.to) {
    if (range.to instanceof PtrBase) {
      if (!isCompatible(options, range.to.list)) return false;
    } else {
      if (!isNodeLike(options, range.to)) return false;
    }
  }
  return true;
};

export class Node {
  constructor({nextName = 'next'} = {}) {
    this.nextName = nextName;
    this[nextName] = this;
  }
  get isStandAlone() {
    return this[this.nextName] === this;
  }
}

export class HeadNode extends Node {
  constructor(options) {
    super(options);
    this.last = this;
  }
  isNodeLike(node) {
    if (!node) return false;
    const next = node[this.nextName];
    return next && typeof next == 'object';
  }
  isCompatibleNames({nextName}) {
    return this.nextName === nextName;
  }
  isCompatible(list) {
    return list instanceof HeadNode && this.nextName === list.nextName;
  }
  isRangeLike(range) {
    return isRangeLike(this, range);
  }

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

  get range() {
    return this[this.nextName] === this ? null : {prevFrom: this, to: this.last, list: this};
  }

  getLength() {
    let n = 0;
    for (let p = this[this.nextName]; p !== this; ++n, p = p[this.nextName]);
    return n;
  }

  adoptNode(node) {
    if (node[this.nextName]) {
      if (node[this.nextName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node;
    return node;
  }
  syncLast() {
    this.last = this;
    while (this.last[this.nextName] !== this) this.last = this.last[this.nextName];
    return this;
  }
}

export class ValueNode extends Node {
  constructor(value, options) {
    super(options);
    this.value = value;
  }
}

export class PtrBase {
  constructor(list, prev, ListClass) {
    if (list instanceof PtrBase) {
      this.list = list.list;
      this.prev = list.prev;
      return;
    }
    if (!(list instanceof ListClass)) throw new Error('"list" is not a compatible list');
    if (prev instanceof PtrBase) {
      if (list !== prev.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.prev = prev.prev;
    } else {
      this.list = list;
      this.prev = prev;
    }
    if (this.prev && !isNodeLike(this.list, this.prev)) throw new Error('"prev" is not a compatible node');
  }
  get node() {
    return this.prev[this.list.nextName];
  }
  next() {
    this.prev = this.prev[this.list.nextName];
    return this;
  }
}

export class CircularListBase {
  constructor(head = null, {nextName = 'next'} = {}) {
    if (head instanceof CircularListBase) {
      this.nextName = head.nextName;
      this.adoptHead(head.head);
      return;
    }
    this.nextName = nextName;
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

  get range() {
    return this.head ? {prevFrom: this.head, to: this.head, list: this.head} : null;
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

  getBack() {
    if (!this.head) return null;
    let current = this.head;
    do {
      current = current[this.nextName];
    } while (current !== this.head);
    return current;
  }

  adoptHead(head) {
    if (head && !this.isNodeLike(head)) throw new Error('"head" is not a compatible node');
    this.head = head;
  }

  next() {
    if (this.head) this.head = this.head[this.nextName];
    return this;
  }
}

copyDescriptors(CircularListBase, 'isNodeLike, isCompatible, isCompatibleNames, isRangeLike', HeadNode);
