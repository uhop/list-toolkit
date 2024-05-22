'use strict';

import {HeadNode, PtrBase} from './nodes.js';
import {pop, splice} from './basics.js';

export class Ptr extends PtrBase {
  constructor(list, node) {
    super(list, node, HeadNode);
    this.node ||= this.list.front;
  }
  get isHead() {
    return this.node === this.list;
  }
  clone() {
    return new Ptr(this);
  }
  remove() {
    if (this.node === this.list) return null;
    const node = this.node;
    this.node = node[this.list.nextName];
    return pop(this.list, node).extracted;
  }
  addBefore(value) {
    const node = this.list.adoptNode(value);
    splice(this.list, this.node, node);
    return this.list.makePtr(node);
  }
  addAfter(value) {
    const node = this.list.adoptNode(value);
    splice(this.list, this.node[this.list.nextName], node);
    return this.list.makePtr(node);
  }
  insertBefore(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return null;
    const head = pop(list, list).rest;
    splice(this.list, this.node, head);
    return this.list.makePtr(head);
  }
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return null;
    const head = pop(list, list).rest;
    splice(this.list, this.node[this.list.nextName], head);
    return this.list.makePtr(head);
  }
}

export default Ptr;
