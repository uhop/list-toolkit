'use strict';

import {HeadNode, PtrBase} from './nodes.js';
import {splice} from './basics.js';

export class Ptr extends PtrBase {
  constructor(list, prev) {
    super(list, prev, HeadNode);
    this.previousNode ||= this.list;
  }

  get isHead() {
    return this.previousNode[this.list.nextName] === this.list;
  }
  clone() {
    return new Ptr(this);
  }
  remove() {
    const node = this.previousNode[this.list.nextName];
    if (node === this.list || node === this.previousNode) return null;
    if (this.list.last === node) this.list.last = this.previousNode;
    this.previousNode[this.list.nextName] = node[this.list.nextName];
    node[this.list.nextName] = node;
    return node;
  }
  addBefore(node) {
    node = this.list.adoptNode(node);
    node[this.list.nextName] = this.previousNode[this.list.nextName];
    this.previousNode[this.list.nextName] = node;
    this.previousNode = node;
    if (this.list.last === this.list) this.list.last = node;
    return this;
  }
  addAfter(node) {
    node = this.list.adoptNode(node);
    const nextName = this.list.nextName;
    if (this.list.last === this.previousNode[nextName]) this.list.last = node;
    node[nextName] = this.previousNode[nextName][nextName];
    this.previousNode[nextName][nextName] = node;
    return this;
  }
  insertBefore(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    splice(this.list, this.previousNode, {prevFrom: list, to: list.last});
    if (this.list.last === this.list) this.list.last = list.last;
    this.previousNode = list.last;

    list.last = list;

    return this;
  }
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    splice(this.list, this.previousNode[this.list.nextName], {prevFrom: list, to: list.last});
    if (this.list.last === this.previousNode) this.list.last = list.last;

    list.last = list;

    return this;
  }
}

export default Ptr;
