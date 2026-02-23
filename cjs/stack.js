'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Stack = void 0;
var _valueList = _interopRequireDefault(require("./value-list.js"));
var _metaUtils = require("./meta-utils.js");
var _listUtils = require("./list-utils.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Stack {
  constructor(UnderlyingList = _valueList.default) {
    this.size = 0;
    this.list = new UnderlyingList();
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
  push(value) {
    this.list.pushFront(value);
    ++this.size;
    return this;
  }
  pop() {
    if (!this.list.isEmpty) {
      --this.size;
      return this.list.popFront().value;
    }
    // return undefined;
  }
  pushValues(values) {
    (0, _listUtils.pushValuesFront)(this, values);
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
exports.Stack = Stack;
(0, _metaUtils.addAlias)(Stack.prototype, 'push', 'pushFront');
var _default = exports.default = Stack;