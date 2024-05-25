'use strict';

import {HeadNode, PtrBase} from './nodes.js';
import {pop, splice} from './basics.js';

export class Ptr extends PtrBase {
  constructor(list, prev) {
    super(list, prev, HeadNode);
    this.prevNode ||= this.list;
  }

  get isHead() {
    return this.prevNode[this.list.nextName] === this.list;
  }
  clone() {
    return new Ptr(this);
  }
  removeCurrent() {
    const node = this.prevNode[this.list.nextName];
    if (node === this.list || node === this.prevNode) return null;
    if (this.list.last === node) this.list.last = this.prevNode;
    return pop(this.list, this.prevNode).extracted.to;
  }
  addBefore(value) {
    const node = this.list.adoptValue(value),
      prev = splice(this.list, this.prevNode, {prevFrom: node});
    this.prevNode = node;
    if (this.list.last === this.list) this.list.last = node;
    return this.list.makePtr(prev);
  }
  addNodeBefore(node) {
    node = this.list.adoptNode(node);
    const prev = splice(this.list, this.prevNode, {prevFrom: node});
    this.prevNode = node;
    if (this.list.last === this.list) this.list.last = node;
    return this.list.makePtr(prev);
  }
  addAfter(value) {
    const node = this.list.adoptValue(value),
      prev = splice(this.list, this.prevNode[this.list.nextName], {prevFrom: node});
    return this.list.makePtr(prev);
  }
  addNodeAfter(node) {
    node = this.list.adoptNode(node);
    const prev = splice(this.list, this.prevNode[this.list.nextName], {prevFrom: node});
    return this.list.makePtr(prev);
  }
  insertBefore(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const prev = splice(this.list, this.prevNode, {prevFrom: list, to: list.last});
    if (this.list.last === this.list) this.list.last = list.last;
    this.prevNode = list.last;

    list.last = list;

    return this.list.makePtr(prev);
  }
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const prev = splice(this.list, this.prevNode[this.list.nextName], {prevFrom: list, to: list.last});
    if (this.list.last === this.prevNode) this.list.last = list.last;

    list.last = list;

    return this.list.makePtr(prev);
  }
}

export default Ptr;
