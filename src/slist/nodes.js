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
