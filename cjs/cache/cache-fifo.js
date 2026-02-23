'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CacheFIFO = void 0;
var _cacheLru = _interopRequireDefault(require("./cache-lru.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Evicts on the first-in-first-out basis.

class CacheFIFO extends _cacheLru.default {
  use(key) {
    return this.dict.get(key);
  }
  addNew(key, value) {
    this.list.pushBack({
      key,
      value
    });
    const node = this.list.back;
    this.dict.set(key, node);
    return node;
  }
  evictAndReplace(key, value) {
    const node = this.list.front;
    this.list.moveToBack(node);
    this.dict.delete(node.value.key);
    this.dict.set(key, node);
    node.value = {
      key,
      value
    };
    return node;
  }
}
exports.CacheFIFO = CacheFIFO;
var _default = exports.default = CacheFIFO;