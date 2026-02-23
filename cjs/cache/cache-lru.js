'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CacheLRU = void 0;
var _valueList = _interopRequireDefault(require("../value-list.js"));
var _metaUtils = require("../meta-utils.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// The base cache class. Evicts the least recently used items.
// Based on doubly linked value lists.

class CacheLRU {
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.list = new _valueList.default();
    this.dict = new Map();
  }
  get isEmpty() {
    return !this.dict.size;
  }
  get size() {
    return this.dict.size;
  }
  has(key) {
    return this.dict.has(key);
  }
  find(key) {
    const node = this.use(key);
    return node ? node.value.value : undefined;
  }
  remove(key) {
    const node = this.dict.get(key);
    if (node) {
      this.dict.delete(key);
      this.list.removeNode(node);
    }
    return this;
  }
  register(key, value) {
    const node = this.use(key);
    if (node) {
      this.update(node, value);
      return this;
    }
    if (this.dict.size >= this.capacity) {
      this.evictAndReplace(key, value);
      return this;
    }
    this.addNew(key, value);
    return this;
  }
  use(key) {
    const node = this.dict.get(key);
    if (node) this.list.moveToFront(node);
    return node;
  }
  update(node, value) {
    node.value.value = value;
    return this;
  }
  addNew(key, value) {
    this.list.pushFront({
      key,
      value
    });
    const node = this.list.front;
    this.dict.set(key, node);
    return node;
  }
  evictAndReplace(key, value) {
    const node = this.list.back;
    this.list.moveToFront(node);
    this.dict.delete(node.value.key);
    this.dict.set(key, node);
    node.value = {
      key,
      value
    };
    return node;
  }
  clear() {
    this.dict.clear();
    this.list.clear();
    return this;
  }
  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
  getReverseIterator() {
    return this.list.getReverseIterator();
  }
}
exports.CacheLRU = CacheLRU;
(0, _metaUtils.addAliases)(CacheLRU.prototype, {
  register: 'add, set',
  remove: 'delete',
  find: 'get'
});
var _default = exports.default = CacheLRU;