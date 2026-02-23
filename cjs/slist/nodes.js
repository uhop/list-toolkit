'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isStandAlone = exports.isNodeLike = exports.isCompatible = exports.ValueNode = exports.PtrBase = exports.Node = exports.HeadNode = exports.ExtListBase = void 0;
var _listHelpers = require("../list-helpers.js");
var _metaUtils = require("../meta-utils.js");
const isNodeLike = ({
  nextName
}, node) => node && node[nextName];
exports.isNodeLike = isNodeLike;
const isStandAlone = ({
  nextName
}, node) => node && node[nextName] === node;
exports.isStandAlone = isStandAlone;
const isCompatible = (options1, options2) => options1.nextName === options2.nextName;
exports.isCompatible = isCompatible;
class Node {
  constructor({
    nextName = 'next'
  } = {}) {
    this.nextName = nextName;
    this[nextName] = this;
  }
  get isStandAlone() {
    return this[this.nextName] === this;
  }
}
exports.Node = Node;
class HeadNode extends Node {
  constructor(options) {
    super(options);
    this.last = this;
  }
  isNodeLike(node) {
    if (!node) return false;
    const next = node[this.nextName];
    return next && _metaUtils.canHaveProps[typeof next] === 1;
  }
  isCompatibleNames({
    nextName
  }) {
    return this.nextName === nextName;
  }
  isCompatible(list) {
    return list === this || list instanceof HeadNode && this.nextName === list.nextName;
  }
  isCompatiblePtr(ptr) {
    return ptr instanceof PtrBase && (ptr.list === this || ptr.list instanceof HeadNode && this.nextName === ptr.list.nextName);
  }
  isCompatibleRange(range) {
    return (0, _listHelpers.isRangeLike)(this, range);
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
  get head() {
    return this;
  }
  get front() {
    return this[this.nextName];
  }
  get back() {
    return this.last;
  }
  get range() {
    return this[this.nextName] === this ? null : {
      from: this[this.nextName],
      to: this.last,
      list: this
    };
  }
  getLength() {
    let n = 0;
    for (let p = this[this.nextName]; p !== this; ++n, p = p[this.nextName]);
    return n;
  }
  adoptNode(nodeOrPtr) {
    const isPtr = nodeOrPtr instanceof PtrBase;
    if (isPtr && !this.isCompatiblePtr(nodeOrPtr)) throw new Error('Incompatible pointer');
    const node = isPtr ? nodeOrPtr.node : nodeOrPtr;
    if (node[this.nextName]) {
      if (node[this.nextName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node;
    if (isPtr) {
      nodeOrPtr.list = this;
      nodeOrPtr.prevNode = node;
    }
    return node;
  }
  normalizeNode(nodeOrPtr) {
    const node = (0, _listHelpers.normalizeNode)(this, nodeOrPtr, PtrBase);
    if (nodeOrPtr instanceof PtrBase) nodeOrPtr.list = this;
    return node;
  }
  normalizeRange(range) {
    return (0, _listHelpers.normalizeRange)(this, range, PtrBase);
  }
  normalizePtrRange(range) {
    return (0, _listHelpers.normalizePtrRange)(this, range, PtrBase);
  }
  syncLast() {
    this.last = this;
    while (this.last[this.nextName] !== this) this.last = this.last[this.nextName];
    return this;
  }
}
exports.HeadNode = HeadNode;
(0, _metaUtils.addAlias)(HeadNode.prototype, 'adoptNode', 'adoptValue');
class ValueNode extends Node {
  constructor(value, options) {
    super(options);
    this.value = value;
  }
}
exports.ValueNode = ValueNode;
class PtrBase {
  constructor(list, node, prev, ListClass) {
    if (list instanceof PtrBase) {
      this.list = list.list;
      this.node = list.node;
      this.prevNode = list.prevNode;
      return;
    }
    if (!(list instanceof ListClass)) throw new Error('"list" is not a compatible list');
    if (node instanceof PtrBase) {
      if (list !== node.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.node = node.node;
      this.prevNode = node.prevNode;
    } else {
      this.list = list;
      this.node = node;
      this.prevNode = prev;
    }
    // check nodes
    if (this.node && !isNodeLike(this.list, this.node)) throw new Error('"node" is not a compatible node');
    if (this.prevNode && !isNodeLike(this.list, this.prevNode)) throw new Error('"prev" is not a compatible node');
    // initialize missing nodes
    if (this.node) {
      if (!this.prevNode) this.prevNode = this.node;
    } else {
      if (!this.prevNode) this.prevNode = this.list.head;
      if (this.prevNode) this.node = this.prevNode[this.list.nextName];
    }
  }
  get nextNode() {
    return this.node[this.list.nextName];
  }
  isPrevNodeValid() {
    if (!this.prevNode) this.prevNode = this.node;
    if (this.prevNode[this.list.nextName] === this.node) return true;
    this.prevNode = this.node;
    if (this.prevNode[this.list.nextName] === this.node) return true;
    this.prevNode = this.prevNode[this.list.nextName];
    if (this.prevNode[this.list.nextName] === this.node) return true;
    this.prevNode = this.list.head;
    if (this.prevNode[this.list.nextName] === this.node) return true;
    this.prevNode = this.node;
    return false;
  }
  next() {
    this.prevNode = this.node;
    this.node = this.node[this.list.nextName];
    return this;
  }
  prev() {
    if (!this.isPrevNodeValid()) throw new Error('Cannot get previous node: "prevNode" is invalid');
    this.node = this.prevNode;
    return this;
  }
  syncPrev() {
    if (this.isPrevNodeValid()) return this;
    this.prevNode = this.node;
    do {
      const next = this.prevNode[this.list.nextName];
      if (next === this.node) break;
      this.prevNode = next;
    } while (this.prevNode !== this.node);
    return this;
  }
}
exports.PtrBase = PtrBase;
class ExtListBase {
  constructor(head = null, {
    nextName = 'next'
  } = {}) {
    if (head instanceof ExtListBase) {
      this.nextName = head.nextName;
      this.attach(head.head);
      return;
    }
    if (head instanceof PtrBase) {
      this.nextName = head.list.nextName;
      this.attach(head.node);
      return;
    }
    this.nextName = nextName;
    this.attach(head);
  }
  isCompatible(list) {
    return list === this || list instanceof ExtListBase && this.nextName === list.nextName;
  }
  isCompatiblePtr(ptr) {
    return ptr instanceof PtrBase && (ptr.list === this || ptr.list instanceof ExtListBase && this.nextName === ptr.list.nextName);
  }
  get isEmpty() {
    return !this.head;
  }
  get isOne() {
    return this.head && this.head[this.nextName] === this.head;
  }
  get isOneOrEmpty() {
    return !this.head || this.head[this.nextName] === this.head;
  }
  get front() {
    return this.head;
  }
  get range() {
    return this.head ? {
      from: this.head[this.nextName],
      to: this.head,
      list: this.head
    } : null;
  }
  getLength() {
    if (!this.head) return 0;
    let n = 0,
      current = this.head;
    do {
      current = current[this.nextName];
      ++n;
    } while (current !== this.head);
    return n;
  }
  getBack() {
    if (!this.head) return null;
    for (let current = this.head;;) {
      const next = current[this.nextName];
      if (next === this.head) return current;
      current = next;
    }
    // unreachable
  }
  attach(head = null) {
    const oldHead = this.head;
    if (head instanceof PtrBase) {
      if (!this.isCompatible(head.list)) throw new Error('Incompatible lists');
      this.head = head.node;
    } else {
      if (head && !this.isNodeLike(head)) throw new Error('"head" is not a compatible node');
      this.head = head;
    }
    return oldHead;
  }
  detach() {
    const oldHead = this.head;
    this.head = null;
    return oldHead;
  }
  next() {
    if (this.head) this.head = this.head[this.nextName];
    return this;
  }
}
exports.ExtListBase = ExtListBase;
(0, _metaUtils.copyDescriptors)(ExtListBase.prototype, HeadNode.prototype, ['isNodeLike', 'isCompatibleNames', 'isCompatibleRange', 'normalizeNode', 'normalizeRange', 'normalizePtrRange', 'adoptNode', 'adoptValue']);