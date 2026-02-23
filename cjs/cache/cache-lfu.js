'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CacheLFU = void 0;
var _metaUtils = require("../meta-utils.js");
var _minHeap = _interopRequireDefault(require("../heap/min-heap.js"));
var _cacheLru = _interopRequireDefault(require("./cache-lru.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Evicts the least frequently used items.

class CacheLFU extends _cacheLru.default {
  constructor(capacity = 10) {
    super(capacity);
    this.heap = new _minHeap.default({
      less: (a, b) => a.value.counter < b.value.counter
    });
  }
  use(key) {
    const node = this.dict.get(key);
    if (node) ++node.value.counter;
    return node;
  }
  update(node, value) {
    node.value.counter = 1;
    node.value.value = value;
    return this;
  }
  addNew(key, value) {
    this.list.pushFront({
      key,
      value,
      counter: 1
    });
    const node = this.list.front;
    this.dict.set(key, node);
    this.heap.push(node);
    return node;
  }
  evictAndReplace(key, value) {
    const node = this.heap.top;
    this.dict.delete(node.value.key);
    node.value = {
      key,
      value,
      counter: 1
    };
    this.dict.set(key, node);
    this.heap.updateTop();
    return node;
  }
  remove(key) {
    const node = this.dict.get(key);
    if (node) {
      this.dict.delete(key);
      this.list.removeNode(node);
      this.heap.remove(node);
    }
    return this;
  }
  clear() {
    super.clear();
    this.heap.clear();
    return this;
  }
  resetCounters(initialValue = 1) {
    for (const item of this.heap) {
      item.counter = initialValue;
    }
    return this;
  }
}
exports.CacheLFU = CacheLFU;
(0, _metaUtils.addAlias)(CacheLFU.prototype, 'remove', 'delete');
var _default = exports.default = CacheLFU;