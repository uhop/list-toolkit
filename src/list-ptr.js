'use strict';

import {HeadNode} from './list-nodes.js';
import {pop, splice} from './list-basics.js';

export class Ptr {
  constructor(list, node) {
    if (list instanceof Ptr) {
      this.list = list.list;
      this.node = list.node;
      return;
    }
    if (!(list instanceof HeadNode)) throw new Error('List must be a HeadNode');
    if (node instanceof Ptr) {
      if (list !== node.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.node = node.node;
    } else {
      this.list = list;
      this.node = node || list.front;
    }
  }
  get isHead() {
    return this.node === this.list;
  }
  next() {
    this.node = this.node[this.list.nextName];
    return this;
  }
  prev() {
    this.node = this.node[this.list.prevName];
    return this;
  }
  clone() {
    return new Ptr(this);
  }
  remove() {
    if (this.node === this.list) return null;
    const node = this.node;
    this.node = node[this.list.nextName];
    return pop(this.list, node).node;
  }
  addBefore(value) {
    splice(this.list, this.node, this.list.adopt(value));
    return this;
  }
  addAfter(value) {
    splice(this.list, this.node[this.list.nextName], this.list.adopt(value));
    return this;
  }
  insertBefore(list) {
    const listHead = list.head || list;
    if (!this.list.isCompatible(listHead)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;
    const head = pop(listHead, listHead).list;
    splice(this.list, this.node, head);
    return this;
  }
  insertAfter(list) {
    const listHead = list.head || list;
    if (!this.list.isCompatible(listHead)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;
    const head = pop(listHead, listHead).list;
    splice(this.list, this.node[this.list.nextName], head);
    return this;
  }
}

export default Ptr;
