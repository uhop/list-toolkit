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
}

export class ValueNode extends Node {
  constructor(value, options) {
    super(options);
    this.value = value;
  }
}
