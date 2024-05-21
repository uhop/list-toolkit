'use strict';

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

export const CIRCULAR_LIST_MARKER = Symbol('CIRCULAR_LIST_MARKER');
export const isCircularList = list => list?.[CIRCULAR_LIST_MARKER] === CIRCULAR_LIST_MARKER;

export const isNodeLike = ({nextName, prevName}, node) => node && node[prevName] && node[nextName];
export const isStandAlone = ({nextName, prevName}, node) => node && node[prevName] === node && node[nextName] === node;
export const isCompatible = (options1, options2) => options1.nextName === options2.nextName && options1.prevName === options2.prevName;

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

export const isRangeLike = (options, range) =>
  !range ||
  ((!range.from || (range.from instanceof PtrBase && isCompatible(options, range.from.list)) || isNodeLike(options, range.from)) &&
    (!range.to || (range.to instanceof PtrBase && isCompatible(options, range.to.list)) || isNodeLike(options, range.to)));
