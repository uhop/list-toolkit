'use strict';

import {HeadNode} from './nodes.js';
import {splice} from './basics.js';

export class Ptr {
  constructor(list, prev) {
    if (list instanceof Ptr) {
      this.list = list.list;
      this.prev = list.prev;
      return;
    }
    if (!(list instanceof HeadNode)) throw new Error('List must be a HeadNode');
    if (prev instanceof Ptr) {
      if (list !== prev.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.prev = prev.prev;
    } else {
      this.list = list;
      this.prev = prev || list;
    }
  }

  get node() {
    return this.prev[this.list.nextName];
  }
  get isHead() {
    return this.prev[this.list.nextName] === this.list;
  }
  next() {
    this.prev = this.prev[this.list.nextName];
    return this;
  }
  clone() {
    return new Ptr(this);
  }
  remove() {
    const node = this.prev[this.list.nextName];
    if (node === this.list || node === this.prev) return null;
    if (this.list.last === node) this.list.last = this.prev;
    this.prev[this.list.nextName] = node[this.list.nextName];
    node[this.list.nextName] = node;
    return node;
  }
  addBefore(node) {
    node = this.list.adoptNode(node);
    node[this.list.nextName] = this.prev[this.list.nextName];
    this.prev[this.list.nextName] = node;
    this.prev = node;
    if (this.list.last === this.list) this.list.last = node;
    return this;
  }
  addAfter(node) {
    node = this.list.adoptNode(node);
    const nextName = this.list.nextName;
    if (this.list.last === this.prev[nextName]) this.list.last = node;
    node[nextName] = this.prev[nextName][nextName];
    this.prev[nextName][nextName] = node;
    return this;
  }
  insertBefore(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    splice(this.list, this.prev, {prevFrom: list, to: list.last});
    if (this.list.last === this.list) this.list.last = list.last;
    this.prev = list.last;

    list.last = list;

    return this;
  }
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    splice(this.list, this.prev[this.list.nextName], {prevFrom: list, to: list.last});
    if (this.list.last === this.prev) this.list.last = list.last;

    list.last = list;

    return this;
  }
}

export default Ptr;
