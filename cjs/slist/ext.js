'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Ptr = exports.ExtSList = void 0;
var _nodes = require("./nodes.js");
var _basics = require("./basics.js");
var _metaUtils = require("../meta-utils.js");
class Ptr extends _nodes.PtrBase {
  constructor(list, node, prev) {
    super(list, node, prev, ExtSList);
  }
  clone() {
    return new Ptr(this);
  }
}
exports.Ptr = Ptr;
class ExtSList extends _nodes.ExtListBase {
  get ptrRange() {
    return this.head ? {
      from: this.makePtr(),
      to: this.head,
      list: this.head
    } : null;
  }
  makePtr(node) {
    if (node && !this.isNodeLike(node)) throw new Error('"node" is not a compatible node');
    return new Ptr(this, node);
  }
  makePtrFromPrev(prev) {
    if (prev && !this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');
    return new Ptr(this, null, prev || this.head);
  }

  // Ptr API

  removeNodeAfter() {
    return this.head ? this.removeNode(this.makePtr()) : null;
  }
  addAfter(value) {
    const node = this.adoptValue(value);
    if (this.head) {
      (0, _basics.splice)(this, this.head, {
        prevFrom: node
      });
    } else {
      this.head = node;
    }
    return this.makePtr();
  }
  addNodeAfter(node) {
    node = this.adoptNode(node);
    if (this.head) {
      (0, _basics.splice)(this, this.head, {
        prevFrom: node
      });
    } else {
      this.head = node;
    }
    return this.makePtr();
  }
  insertAfter(extList) {
    if (!this.isCompatible(extList)) throw new Error('Incompatible lists');
    const head = extList.head;
    if (head) {
      (0, _basics.splice)(this, this.head, {
        prevFrom: head,
        to: head
      });
      extList.head = null;
    }
    return this.makePtr();
  }
  moveAfter(ptr) {
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    ptr.list = this;
    if (!this.head) {
      this.head = (0, _basics.pop)(this, ptr.prevNode).extracted.to;
      return this;
    }
    if (this.head === ptr.prevNode) return this;
    if (this.head === ptr.prevNode[this.nextName]) {
      if (this.head === this.head[this.nextName]) return this;
      this.head = this.head[this.nextName];
    }
    ptr.prevNode = (0, _basics.splice)(this, this.head, {
      prevFrom: (0, _basics.pop)(this, ptr.prevNode).extracted.to
    });
    return ptr.clone();
  }

  // List API

  clear(drop) {
    if (drop) {
      for (const current of this.getNodeIterator()) {
        current[this.nextName] = current; // make stand-alone
      }
    }
    this.head = null;
    return this;
  }
  removeNode(ptr) {
    if (!this.head) return null;
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    if (this.head === ptr.prevNode[this.nextName]) {
      if (this.head === this.head[this.nextName]) {
        this.head = null;
        return ptr.prevNode[this.nextName];
      }
      this.head = this.head[this.nextName];
    }
    return (0, _basics.pop)(this, ptr.prevNode).extracted.to;
  }
  removeRange(ptrRange, drop) {
    return this.extractRange(ptrRange).clear(drop);
  }
  extractRange(ptrRange = {}) {
    ptrRange = this.normalizePtrRange(ptrRange.from ? ptrRange : {
      ...ptrRange,
      from: this.makePtr()
    });
    ptrRange.to ||= this.head;
    const prevFrom = ptrRange.from.prevNode,
      to = ptrRange.to,
      extracted = this.make();
    if (!this.head) return extracted;
    if (this.head === prevFrom[this.nextName] || this.head === to) this.head = to[this.nextName];
    if (this.head === prevFrom[this.nextName]) this.head = null;
    extracted.head = (0, _basics.extract)(this, {
      prevFrom,
      to
    }).extracted.prevFrom[this.nextName];
    return extracted;
  }
  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;
    const rest = this.make();
    for (const current of this.getNodeIterator()) {
      current[this.nextName] = current; // make stand-alone
      if (condition(current)) {
        extracted.addAfter(current);
        extracted.next();
      } else {
        rest.addAfter(current);
        rest.next();
      }
    }
    extracted.next();
    rest.next();
    this.head = rest.head;
    return extracted;
  }
  reverse() {
    if (this.isOneOrEmpty) return this;
    let prev = this.head,
      current = prev[this.nextName];
    do {
      const next = current[this.nextName];
      current[this.nextName] = prev;
      prev = current;
      current = next;
    } while (current !== this.head);
    this.head[this.nextName] = prev;
    this.head = this.head[this.nextName];
    return this;
  }
  sort(lessFn) {
    if (this.isOneOrEmpty) return this;
    const leftHead = {},
      rightHead = {};
    leftHead[this.nextName] = leftHead;
    rightHead[this.nextName] = rightHead;
    const left = this.make(leftHead),
      right = this.make(rightHead);

    // split into two sublists
    let isLeft = true;
    for (const current of this.getNodeIterator()) {
      current[this.nextName] = current; // make stand-alone
      if (isLeft) {
        left.addNodeAfter(current);
        left.next();
      } else {
        right.addNodeAfter(current);
        right.next();
      }
      isLeft = !isLeft;
    }
    left.removeNodeAfter(); // remove the head node
    right.removeNodeAfter(); // remove the head node
    this.clear();
    // the list is empty now

    // sort sublists
    left.next().sort(lessFn);
    right.next().sort(lessFn);

    // merge sublists
    const leftIterator = left.getNodeIterator()[Symbol.iterator](),
      rightIterator = right.getNodeIterator()[Symbol.iterator]();
    let leftItem = leftIterator.next(),
      rightItem = rightIterator.next();
    while (!leftItem.done && !rightItem.done) {
      let node;
      if (lessFn(leftItem.value, rightItem.value)) {
        node = leftItem.value;
        leftItem = leftIterator.next();
      } else {
        node = rightItem.value;
        rightItem = rightIterator.next();
      }
      node[this.nextName] = node; // make stand-alone
      this.addNodeAfter(node);
      this.next();
    }
    for (; !leftItem.done; this.next(), leftItem = leftIterator.next()) {
      const node = leftItem.value;
      node[this.nextName] = node; // make stand-alone
      this.addNodeAfter(node);
    }
    for (; !rightItem.done; this.next(), rightItem = rightIterator.next()) {
      const node = rightItem.value;
      node[this.nextName] = node; // make stand-alone
      this.addNodeAfter(node);
    }
    return this.next();
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.head,
      readyToStop = this.isEmpty;
    return (0, _metaUtils.normalizeIterator)({
      next: () => {
        if (readyToStop && current === this.head) return {
          done: true
        };
        readyToStop = true;
        const value = current;
        current = current[this.nextName];
        return {
          value
        };
      }
    });
  }
  getNodeIterator(range = {}) {
    range = this.normalizeRange(range);
    const {
      from,
      to
    } = range;
    return {
      [Symbol.iterator]: () => {
        let readyToStop = this.isEmpty,
          current = readyToStop ? null : from || this.head;
        const stop = readyToStop ? null : to ? to[this.nextName] : this.head;
        return (0, _metaUtils.normalizeIterator)({
          next: () => {
            if (readyToStop && current === stop) return {
              done: true
            };
            readyToStop = true;
            const value = current;
            current = current[this.nextName];
            return {
              value
            };
          }
        });
      }
    };
  }
  getPtrIterator(range) {
    if (!ptrRange.from) ptrRange = Object.assign({
      from: this.frontPtr
    }, ptrRange);
    ptrRange = this.normalizePtrRange(ptrRange);
    const {
      from: fromPtr,
      to
    } = ptrRange;
    return {
      [Symbol.iterator]: () => {
        let current = fromPtr.clone(),
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this;
        return (0, _metaUtils.normalizeIterator)({
          next: () => {
            if (readyToStop && current.node === stop) return {
              done: true
            };
            readyToStop = true;
            const value = current.clone();
            current = current.next();
            return {
              value
            };
          }
        });
      }
    };
  }

  // meta helpers

  clone() {
    return new ExtSList(this);
  }
  make(head = null) {
    return new ExtSList(head, this);
  }
  makeFrom(values) {
    return ExtSList.from(values, this);
  }
  static from(values, options) {
    const list = new ExtSList(null, options);
    for (const value of values) {
      list.addNodeAfter(value);
      list.next();
    }
    return list.next();
  }
}
exports.ExtSList = ExtSList;
ExtSList.Ptr = Ptr;
(0, _metaUtils.addAliases)(ExtSList.prototype, {
  addAfter: 'add',
  removeNodeAfter: 'removeAfter',
  getNodeIterator: 'getIterator'
});
var _default = exports.default = ExtSList;