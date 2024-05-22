'use strict';

import {HeadNode, PtrBase} from './nodes.js';
import {pop, splice} from './basics.js';

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
    return pop(this.list, this.previousNode).extracted.to;
  }
  addBefore(node) {
    node = this.list.adoptNode(node);
    const prev = splice(this.list, this.previousNode, {prevFrom: node});
    this.previousNode = node;
    if (this.list.last === this.list) this.list.last = node;
    return this.list.makePtr(prev);
  }
  addAfter(node) {
    node = this.list.adoptNode(node);
    const prev = splice(this.list, this.previousNode[this.list.nextName], {prevFrom: node});
    return this.list.makePtr(prev);
  }
  insertBefore(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const prev = splice(this.list, this.previousNode, {prevFrom: list, to: list.last});
    if (this.list.last === this.list) this.list.last = list.last;
    this.previousNode = list.last;

    list.last = list;

    return this.list.makePtr(prev);
  }
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const prev = splice(this.list, this.previousNode[this.list.nextName], {prevFrom: list, to: list.last});
    if (this.list.last === this.previousNode) this.list.last = list.last;

    list.last = list;

    return this.list.makePtr(prev);
  }
}

export default Ptr;
