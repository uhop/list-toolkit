'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExtValueSList = void 0;
Object.defineProperty(exports, "ValueNode", {
  enumerable: true,
  get: function () {
    return _nodes.ValueNode;
  }
});
exports.default = void 0;
var _ext = _interopRequireWildcard(require("./ext.js"));
var _nodes = require("./nodes.js");
var _metaUtils = require("../meta-utils.js");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
class ExtValueSList extends _ext.default {
  adoptValue(value) {
    if (value instanceof _ext.Ptr) {
      if (!this.isCompatiblePtr(value)) throw new Error('Incompatible pointer');
      if (value.node instanceof _nodes.ValueNode) {
        value.list = this;
        return super.adoptNode(value);
      }
      return new _nodes.ValueNode(value.node, this);
    }
    if (value instanceof _nodes.ValueNode) {
      if (!this.isNodeLike(value)) throw new Error('Incompatible node');
      return super.adoptNode(value);
    }
    return new _nodes.ValueNode(value, this);
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
        const value = current.value;
        current = current[this.nextName];
        return {
          value
        };
      }
    });
  }
  getValueIterator(range) {
    return (0, _metaUtils.mapIterator)(this.getNodeIterator(range), node => node.value);
  }

  // meta helpers

  clone() {
    return new ExtValueSList(this);
  }
  make(head = null) {
    return new ExtValueSList(head, this);
  }
  makeFrom(values) {
    return ExtValueSList.from(values, this);
  }
  static from(values, options) {
    const list = new ExtValueSList(null, options);
    for (const value of values) {
      list.addAfter(value);
      list.next();
    }
    return list.next();
  }
}
exports.ExtValueSList = ExtValueSList;
ExtValueSList.Ptr = _ext.Ptr;
ExtValueSList.ValueNode = _nodes.ValueNode;
(0, _metaUtils.addAlias)(ExtValueSList.prototype, 'getIterator', 'getValueIterator');
var _default = exports.default = ExtValueSList;