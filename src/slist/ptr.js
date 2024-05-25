'use strict';

import {HeadNode, PtrBase} from './nodes.js';
import {pop, splice} from './basics.js';

export class Ptr extends PtrBase {
  constructor(list, node, prev) {
    super(list, node, prev, HeadNode);
  }

  get isHead() {
    return this.node === this.list;
  }
  clone() {
    return new Ptr(this);
  }
  removeCurrent() {
    if (!this.isPrevNodeValid()) throw new Error('Current node cannot be removed: "prevNode" is invalid');
    if (this.node === this.list || this.node === this.prevNode) return null;
    if (this.list.last === this.node) this.list.last = this.prevNode;
    const node = pop(this.list, this.prevNode).extracted.to;
    this.node = this.prevNode[this.list.nextName];
    return node;
  }
  addBefore(value) {
    if (!this.isPrevNodeValid()) throw new Error('Cannot be added before: "prevNode" is invalid');
    const node = this.list.adoptValue(value),
      prev = splice(this.list, this.prevNode, {prevFrom: node});
    this.prevNode = node;
    if (this.list.last === this.list) this.list.last = node;
    return this.list.makePtr(prev);
  }
  addNodeBefore(node) {
    if (!this.isPrevNodeValid()) throw new Error('Cannot be added before: "prevNode" is invalid');
    node = this.list.adoptNode(node);
    const prev = splice(this.list, this.prevNode, {prevFrom: node});
    this.prevNode = node;
    if (this.list.last === this.list) this.list.last = node;
    return this.list.makePtr(prev);
  }
  addAfter(value) {
    const node = this.list.adoptValue(value),
      prev = splice(this.list, this.node, {prevFrom: node});
    return this.list.makePtr(prev);
  }
  addNodeAfter(node) {
    node = this.list.adoptNode(node);
    const prev = splice(this.list, this.node, {prevFrom: node});
    return this.list.makePtr(prev);
  }
  insertBefore(list) {
    if (!this.isPrevNodeValid()) throw new Error('Cannot be inserted before: "prevNode" is invalid');
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
