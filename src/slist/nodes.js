'use strict';

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
    return (next && typeof next == 'object');
  }
  isCompatibleNames({nextName}) {
    return this.nextName === nextName;
  }
  isCompatible(list) {
    return list instanceof HeadNode && this.nextName === list.nextName;
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

export const CIRCULAR_SLIST_MARKER = Symbol('CIRCULAR_SLIST_MARKER');
export const isCircularSList = list => list?.[CIRCULAR_SLIST_MARKER] === CIRCULAR_SLIST_MARKER;

export const isNodeLike = ({nextName}, node) => node && node[nextName];
export const isStandAlone = ({nextName}, node) => node && node[nextName] === node;
export const isCompatible = (options1, options2) => options1.nextName === options2.nextName;

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

export const isRangeLike = (options, range) =>
  !range ||
  ((!range.from || (range.from instanceof PtrBase && isCompatible(options, range.from.list)) || isNodeLike(options, range.from)) &&
    (!range.to || (range.to instanceof PtrBase && isCompatible(options, range.to.list)) || isNodeLike(options, range.to)));
