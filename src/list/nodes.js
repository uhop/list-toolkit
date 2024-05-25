'use strict';

import {isRangeLike, normalizeNode, normalizeRange} from '../list-helpers.js';
import {addAlias, copyDescriptors} from '../meta-utils.js';

export const isNodeLike = ({nextName, prevName}, node) => node && node[prevName] && node[nextName];
export const isStandAlone = ({nextName, prevName}, node) => node && node[prevName] === node && node[nextName] === node;
export const isCompatible = (options1, options2) => options1.nextName === options2.nextName && options1.prevName === options2.prevName;

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
    return list === this || (list instanceof HeadNode && this.nextName === list.nextName && this.prevName === list.prevName);
  }

  isCompatiblePtr(ptr) {
    return (
      ptr instanceof PtrBase &&
      (ptr.list === this || (ptr.list instanceof HeadNode && this.nextName === ptr.list.nextName && this.prevName === ptr.list.prevName))
    );
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

  get head() {
    return this;
  }

  get front() {
    return this[this.nextName];
  }

  get back() {
    return this[this.prevName];
  }

  get range() {
    return this[this.nextName] === this ? null : {from: this[this.nextName], to: this[this.prevName], list: this};
  }

  getLength() {
    let n = 0;
    const nextName = this.nextName;
    for (let p = this[nextName]; p !== this; ++n, p = p[nextName]);
    return n;
  }

  adoptNode(node) {
    if (node instanceof PtrBase) node = node.node;
    if (node[this.nextName] || node[this.prevName]) {
      if (node[this.nextName] === node && node[this.prevName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node[this.prevName] = node;
    return node;
  }

  normalizeNode(node) {
    return normalizeNode(this, node, PtrBase);
  }

  normalizeRange(range) {
    return normalizeRange(this, range, PtrBase);
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
    if (!this.node) this.node = this.list.front;
  }

  get nextNode() {
    return this.node[this.list.nextName];
  }

  get prevNode() {
    return this.node[this.list.prevName];
  }

  isPrevNodeValid() {
    return true;
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

export class ExtListBase {
  constructor(head = null, {nextName = 'next', prevName = 'prev'} = {}) {
    if (head instanceof ExtListBase) {
      this.nextName = head.nextName;
      this.prevName = head.prevName;
      this.attach(head.head);
      return;
    }
    if (head instanceof PtrBase) {
      this.nextName = head.list.nextName;
      this.prevName = head.list.prevName;
      this.attach(head.node);
      return;
    }
    this.nextName = nextName;
    this.prevName = prevName;
    this.attach(head);
  }

  isCompatible(list) {
    return list === this || (list instanceof ExtListBase && this.nextName === list.nextName && this.prevName === list.prevName);
  }

  isCompatiblePtr(ptr) {
    return (
      ptr instanceof PtrBase &&
      (ptr.list === this || (ptr.list instanceof ExtListBase && this.nextName === ptr.list.nextName && this.prevName === ptr.list.prevName))
    );
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
    return this.head ? {from: this.head, to: this.head[this.prevName], list: this.head} : null;
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

  prev() {
    if (this.head) this.head = this.head[this.prevName];
    return this;
  }
}

copyDescriptors(ExtListBase, ['isNodeLike', 'isCompatibleNames', 'isCompatibleRange', 'normalizeNode', 'normalizeRange', 'adoptNode', 'adoptValue'], HeadNode);
