'use strict';

import {copyDescriptors} from '../meta-utils.js';

export const isNodeLike = ({nextName, prevName}, node) => node && node[prevName] && node[nextName];
export const isStandAlone = ({nextName, prevName}, node) => node && node[prevName] === node && node[nextName] === node;
export const isCompatible = (options1, options2) => options1.nextName === options2.nextName && options1.prevName === options2.prevName;

export const isRangeLike = (options, range) =>
  !range ||
  ((!range.from || (range.from instanceof PtrBase && isCompatible(options, range.from.list)) || isNodeLike(options, range.from)) &&
    (!range.to || (range.to instanceof PtrBase && isCompatible(options, range.to.list)) || isNodeLike(options, range.to)));

export class Node {
  constructor({nextName = 'next', prevName = 'prev'} = {}) {
    this.nextName = nextName;
    this.prevName = prevName;
    this[nextName] = this[prevName] = this;
  }
  get isStandAlone() {
    return this[this.nextName] === this;
  }
}

export class HeadNode extends Node {
  isNodeLike(node) {
    if (!node) return false;
    const next = node[this.nextName];
    if (!next || typeof next != 'object') return false;
    const prev = node[this.prevName];
    return prev && typeof prev == 'object';
  }

  isCompatibleNames({nextName, prevName}) {
    return this.nextName === nextName && this.prevName === prevName;
  }

  isCompatible(list) {
    return list instanceof HeadNode && this.nextName === list.nextName && this.prevName === list.prevName;
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
    return this[this.prevName];
  }

  get range() {
    return this[this.nextName] === this ? null : {from: this[this.nextName], to: this[this.prevName]};
  }

  getLength() {
    let n = 0;
    const nextName = this.nextName;
    for (let p = this[nextName]; p !== this; ++n, p = p[nextName]);
    return n;
  }

  adoptNode(node) {
    if (node[this.nextName] || node[this.prevName]) {
      if (node[this.nextName] === node && node[this.prevName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node[this.prevName] = node;
    return node;
  }
}

export class ValueNode extends Node {
  constructor(value, options) {
    super(options);
    this.value = value;
  }
}

export class PtrBase {
  constructor(list, node, ListClass) {
    if (list instanceof PtrBase) {
      this.list = list.list;
      this.node = list.node;
      return;
    }
    if (!(list instanceof ListClass)) throw new Error('"list" is not a compatible list');
    if (node instanceof PtrBase) {
      if (list !== node.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.node = node.node;
    } else {
      this.list = list;
      this.node = node;
    }
    if (this.node && !isNodeLike(this.list, this.node)) throw new Error('"node" is not a compatible node');
  }

  next() {
    this.node = this.node[this.list.nextName];
    return this;
  }

  prev() {
    this.node = this.node[this.list.prevName];
    return this;
  }
}

export class CircularListBase {
  constructor(head = null, {nextName = 'next', prevName = 'prev'} = {}) {
    if (head instanceof CircularListBase) {
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

  next() {
    if (this.head) this.head = this.head[this.nextName];
    return this;
  }

  prev() {
    if (this.head) this.head = this.head[this.prevName];
    return this;
  }
}

copyDescriptors(CircularListBase, 'isNodeLike, isCompatible, isCompatibleNames, isRangeLike', HeadNode);
