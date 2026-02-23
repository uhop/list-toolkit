'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.List = void 0;
Object.defineProperty(exports, "Ptr", {
  enumerable: true,
  get: function () {
    return _ptr.default;
  }
});
exports.default = void 0;
var _nodes = require("./nodes.js");
var _basics = require("./basics.js");
var _ptr = _interopRequireDefault(require("./ptr.js"));
var _metaUtils = require("../meta-utils.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class List extends _nodes.HeadNode {
  get frontPtr() {
    return new _ptr.default(this, this.front);
  }
  get backPtr() {
    return new _ptr.default(this, this.back);
  }
  makePtr(node) {
    if (node && !this.isNodeLike(node)) throw new Error('"node" is not a compatible node');
    return new _ptr.default(this, node || this.front);
  }
  makePtrFromPrev(prev) {
    if (prev && !this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');
    return new _ptr.default(this, prev ? prev[this.nextName] : this.front);
  }
  pushFront(value) {
    const node = this.adoptValue(value);
    (0, _basics.splice)(this, this, node);
    return this.makePtr(node);
  }
  pushBack(value) {
    const node = this.adoptValue(value);
    (0, _basics.splice)(this, this[this.prevName], node);
    return this.makePtr(node);
  }
  popFrontNode() {
    if (!this.isEmpty) return (0, _basics.pop)(this, this[this.nextName]).extracted;
  }
  popBackNode() {
    if (!this.isEmpty) return (0, _basics.pop)(this, this[this.prevName]).extracted;
  }
  pushFrontNode(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    (0, _basics.splice)(this, this, node);
    return this.makePtr(node);
  }
  pushBackNode(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    (0, _basics.splice)(this, this[this.prevName], node);
    return this.makePtr(node);
  }
  appendFront(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;
    const head = list[this.nextName];
    (0, _basics.append)(this, this, {
      from: head,
      to: list[this.prevName]
    });
    return this.makePtr();
  }
  appendBack(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;
    const head = list[this.nextName];
    (0, _basics.append)(this, this[this.prevName], {
      from: head,
      to: list[this.prevName]
    });
    return this.makePtr(head);
  }
  moveToFront(nodeOrPtr) {
    const node = this.normalizeNode(nodeOrPtr);
    if (this[this.nextName] !== node) {
      (0, _basics.splice)(this, this, (0, _basics.pop)(this, node).extracted);
    }
    return this.frontPtr;
  }
  moveToBack(nodeOrPtr) {
    const node = this.normalizeNode(nodeOrPtr);
    if (this[this.prevName] !== node) {
      (0, _basics.splice)(this, this[this.prevName], (0, _basics.pop)(this, node).extracted);
    }
    return this.backPtr;
  }
  clear(drop) {
    if (drop) {
      while (!this.isEmpty) this.popFrontNode();
    } else {
      this[this.nextName] = this[this.prevName] = this;
    }
    return this;
  }
  removeNode(nodeOrPtr) {
    return (0, _basics.pop)(this, this.normalizeNode(nodeOrPtr)).extracted;
  }
  removeRange(range, drop) {
    return this.extractRange(range).clear(drop);
  }
  extractRange(range = {}) {
    range = this.normalizeRange(range);
    range.from ||= this.front;
    range.to ||= this.back;
    return (0, _basics.append)(this, this.make(), range);
  }
  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;
    while (this.isEmpty && condition(this.front)) extracted.pushBack(this.popFront());
    if (this.isOneOrEmpty) return extracted;
    for (const ptr of this.getPtrIterator({
      from: this.front[this.nextName]
    })) {
      if (condition(ptr.node)) extracted.pushBack(ptr.removeCurrent());
    }
    return extracted;
  }
  reverse() {
    let current = this;
    do {
      const next = current[this.nextName];
      current[this.nextName] = current[this.prevName];
      current[this.prevName] = next;
      current = next;
    } while (current !== this);
    return this;
  }
  sort(lessFn) {
    if (this.isOneOrEmpty) return this;
    const left = this.make(),
      right = this.make();

    // split into two sublists
    for (let isLeft = true; !this.isEmpty; isLeft = !isLeft) {
      (isLeft ? left : right).pushBackNode(this.popFrontNode());
    }
    // the list is empty now

    // sort sublists
    left.sort(lessFn);
    right.sort(lessFn);

    // merge sublists
    while (!left.isEmpty && !right.isEmpty) {
      this.pushBackNode((lessFn(left.front, right.front) ? left : right).popFrontNode());
    }
    if (!left.isEmpty) this.appendBack(left);
    if (!right.isEmpty) this.appendBack(right);
    return this;
  }
  releaseRawList() {
    return this.isEmpty ? null : (0, _basics.pop)(this, this).rest;
  }
  releaseNTList() {
    if (this.isEmpty) return null;
    const head = this[this.nextName],
      tail = this[this.prevName];
    this.clear();
    head[this.prevName] = tail[this.nextName] = null;
    return {
      head,
      tail
    };
  }
  validateRange(range = {}) {
    range = this.normalizeRange(range);
    let current = range.from;
    do {
      if (current === this) return false;
      current = current[this.nextName];
    } while (current !== range.to);
    return true;
  }

  // iterators

  [Symbol.iterator]() {
    let current = this[this.nextName],
      readyToStop = this.isEmpty;
    return (0, _metaUtils.normalizeIterator)({
      next: () => {
        if (readyToStop && current === this) return {
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
        let current = from || this[this.nextName],
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this;
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
    return (0, _metaUtils.mapIterator)(this.getNodeIterator(range), node => new _ptr.default(this, node));
  }
  getReverseNodeIterator(range = {}) {
    range = this.normalizeRange(range);
    const {
      from,
      to
    } = range;
    return {
      [Symbol.iterator]: () => {
        let current = to || this[this.prevName],
          readyToStop = this.isEmpty;
        const stop = from ? from[this.prevName] : this;
        return (0, _metaUtils.normalizeIterator)({
          next: () => {
            if (readyToStop && current === stop) return {
              done: true
            };
            readyToStop = true;
            const value = current;
            current = current[this.prevName];
            return {
              value
            };
          }
        });
      }
    };
  }
  getReversePtrIterator(range) {
    return (0, _metaUtils.mapIterator)(this.getReverseNodeIterator(range), node => new _ptr.default(this, node));
  }

  // meta helpers

  make() {
    return new List(this);
  }
  makeFrom(values) {
    return List.from(values, this);
  }
  makeFromRange(range) {
    return List.fromRange(range, this);
  }
  static from(values, options) {
    const list = new List(options);
    for (const value of values) list.pushBack(value);
    return list;
  }
  static fromRange(range, options) {
    const list = new List(options);
    if (!range) return list;
    range = list.normalizeRange(range);
    if (!range.from || !range.to) throw new Error('"range" should be fully specified');
    return (0, _basics.append)(list, list, range);
  }
  static fromExtList(extList) {
    if (!(extList instanceof _nodes.ExtListBase)) throw new Error('Not a circular list');
    const list = new List(extList);
    if (extList.isEmpty) return list;
    (0, _basics.splice)(list, list, extList.head);
    extList.clear();
    return list;
  }
}
exports.List = List;
List.Ptr = _ptr.default;
(0, _metaUtils.addAliases)(List.prototype, {
  popFrontNode: 'popFront, pop',
  popBackNode: 'popBack',
  pushFront: 'push',
  getNodeIterator: 'getIterator',
  getReverseNodeIterator: 'getReverseIterator',
  appendBack: 'append'
});
var _default = exports.default = List;