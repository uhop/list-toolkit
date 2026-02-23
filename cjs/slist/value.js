'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Ptr", {
  enumerable: true,
  get: function () {
    return _core.Ptr;
  }
});
Object.defineProperty(exports, "ValueNode", {
  enumerable: true,
  get: function () {
    return _nodes.ValueNode;
  }
});
exports.default = exports.ValueSList = void 0;
var _core = _interopRequireWildcard(require("./core.js"));
var _nodes = require("./nodes.js");
var _metaUtils = require("../meta-utils.js");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
class ValueSList extends _core.default {
  popFront() {
    return this.popFrontNode()?.value;
  }
  adoptValue(value) {
    if (value instanceof _core.Ptr) {
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
    let current = this[this.nextName],
      readyToStop = this.isEmpty;
    return (0, _metaUtils.normalizeIterator)({
      next: () => {
        if (readyToStop && current === this) return {
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
    return ValueSList.from(this, this);
  }
  make() {
    return new ValueSList(this);
  }
  makeFrom(values) {
    return ValueSList.from(values, this);
  }
  static from(values, options) {
    const list = new ValueSList(options);
    for (const value of values) list.pushBack(value);
    return list;
  }
}
exports.ValueSList = ValueSList;
ValueSList.Ptr = _core.Ptr;
ValueSList.ValueNode = _nodes.ValueNode;
(0, _metaUtils.addAliases)(ValueSList.prototype, {
  popFront: 'pop',
  getValueIterator: 'getIterator'
}, true);
var _default = exports.default = ValueSList;