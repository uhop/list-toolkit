'use strict';

import {isRangeLike, normalizeNode, normalizeRange, normalizePtrRange} from '../list-helpers.js';
import {addAlias, copyDescriptors} from '../meta-utils.js';

export const isNodeLike = ({nextName}, node) => node && node[nextName];
export const isStandAlone = ({nextName}, node) => node && node[nextName] === node;
export const isCompatible = (options1, options2) => options1.nextName === options2.nextName;

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
    return list === this || (list instanceof HeadNode && this.nextName === list.nextName);
  }
  isCompatiblePtr(ptr) {
    return ptr instanceof PtrBase && (ptr.list === this || (ptr.list instanceof HeadNode && this.nextName === ptr.list.nextName));
  }
  isCompatibleRange(range) {
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
    return this[this.nextName] === this ? null : {from: this[this.nextName], to: this.last, list: this};
  }

  getLength() {
    let n = 0;
    for (let p = this[this.nextName]; p !== this; ++n, p = p[this.nextName]);
    return n;
  }

  adoptNode(node) {
    if (node instanceof PtrBase) node = node.node;
    if (node[this.nextName]) {
      if (node[this.nextName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node;
    return node;
  }

  normalizeNode(node) {
    return normalizeNode(this, node, PtrBase);
  }

  normalizeRange(range) {
    return normalizeRange(this, range, PtrBase);
  }

  normalizePtrRange(range) {
    return normalizePtrRange(this, range, PtrBase);
  }

  syncLast() {
    this.last = this;
    while (this.last[this.nextName] !== this) this.last = this.last[this.nextName];
    return this;
  }
}

addAlias(HeadNode, 'adoptValue', 'adoptNode');

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
      this.prevNode = list.prevNode;
      return;
    }
    if (!(list instanceof ListClass)) throw new Error('"list" is not a compatible list');
    if (prev instanceof PtrBase) {
      if (list !== prev.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.prevNode = prev.prevNode;
    } else {
      this.list = list;
      this.prevNode = prev;
    }
    if (this.prevNode && !isNodeLike(this.list, this.prevNode)) throw new Error('"prev" is not a compatible node');
  }
  get node() {
    return this.prevNode[this.list.nextName];
  }
  get nextNode() {
    return this.node[this.list.nextName];
  }
  get isPrevNodeValid() {
    return this.prevNode && this.prevNode[this.list.nextName] === this.node;
  }
  next() {
    this.prevNode = this.prevNode[this.list.nextName];
    return this;
  }
}

export class ExtListBase {
  constructor(head = null, {nextName = 'next'} = {}) {
    if (head instanceof ExtListBase) {
      this.nextName = head.nextName;
      this.attach(head.head);
      return;
    }
    if (head instanceof PtrBase) {
      this.nextName = head.list.nextName;
      this.attach(head.node);
      return;
    }
    this.nextName = nextName;
    this.attach(head);
  }

  isCompatible(list) {
    return list === this || (list instanceof ExtListBase && this.nextName === list.nextName);
  }

  isCompatiblePtr(ptr) {
    return ptr instanceof PtrBase && (ptr.list === this || (ptr.list instanceof ExtListBase && this.nextName === ptr.list.nextName));
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
    return this.head ? {from: this.head[this.nextName], to: this.head, list: this.head} : null;
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
    for (let current = this.head; ; ) {
      const next = current[this.nextName];
      if (next === this.head) return current;
      current = next;
    }
    // unreachable
  }

  attach(head = null) {
    const oldHead = this.head;
    if (head instanceof PtrBase) {
      if (!this.isCompatible(head.list)) throw new Error('Incompatible lists');
      this.head = head.node;
    } else {
      if (head && !this.isNodeLike(head)) throw new Error('"head" is not a compatible node');
      this.head = head;
    }
    return oldHead;
  }

  detach() {
    const oldHead = this.head;
    this.head = null;
    return oldHead;
  }

  next() {
    if (this.head) this.head = this.head[this.nextName];
    return this;
  }
}

copyDescriptors(
  ExtListBase,
  [
    'isNodeLike',
    'isCompatibleNames',
    'isCompatibleRange',
    'normalizeNode',
    'normalizeRange',
    'normalizePtrRange',
    'adoptNode',
    'adoptValue'
  ],
  HeadNode
);
