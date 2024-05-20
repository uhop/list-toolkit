'use strict';

import {pop, splice} from './list-basics.js';

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

  isCompatible(list) {
    return list instanceof HeadNode && this.nextName === list.nextName && this.prevName === list.prevName;
  }

  adopt(node) {
    if (node[this.nextName] || node[this.prevName]) {
      if (node[this.nextName] === node && node[this.prevName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node[this.prevName] = node;
    return node;
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

  popFrontNode() {
    if (!this.isEmpty) return pop(this, this[this.nextName]).node;
  }

  popBackNode() {
    if (!this.isEmpty) return pop(this, this[this.prevName]).node;
  }

  pushFrontNode(node) {
    splice(this, this[this.nextName], this.adopt(node));
    return this;
  }

  pushBackNode(node) {
    splice(this, this, this.adopt(node));
    return this;
  }

  clear() {
    this[this.nextName] = this[this.prevName] = this;
    return this;
  }
}

export class ValueNode extends Node {
  constructor(value, names) {
    super(names);
    this.value = value;
  }
}

export class ValueHeadNode extends HeadNode {
  adopt(node) {
    return node instanceof ValueNode ? super.adopt(node) : new ValueNode(node, this);
  }
}
