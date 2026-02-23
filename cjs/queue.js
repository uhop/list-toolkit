'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Queue = void 0;
var _valueList = _interopRequireDefault(require("./value-list.js"));
var _metaUtils = require("./meta-utils.js");
var _listUtils = require("./list-utils.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Queue {
  constructor(underlyingList = new _valueList.default()) {
    this.list = underlyingList;
    this.size = this.list.getLength();
  }
  get isEmpty() {
    return this.list.isEmpty;
  }
  get top() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  peek() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  add(value) {
    this.list.pushBack(value);
    ++this.size;
    return this;
  }
  remove() {
    if (!this.list.isEmpty) {
      --this.size;
      return this.list.popFront();
    }
    // return undefined;
  }
  addValues(values) {
    (0, _listUtils.pushValuesBack)(this, values);
    return this;
  }
  clear() {
    this.list.clear();
    this.size = 0;
    return this;
  }
  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
  getReverseIterator() {
    return this.list.getReverseIterator?.();
  }
}
exports.Queue = Queue;
(0, _metaUtils.addAliases)(Queue.prototype, {
  add: 'push, pushBack, enqueue',
  remove: 'pop, popFront, dequeue'
});
var _default = exports.default = Queue;