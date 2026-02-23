'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  cacheDecorator: true
};
exports.default = exports.cacheDecorator = void 0;
var _cacheLru = _interopRequireWildcard(require("./cache/cache-lru.js"));
Object.keys(_cacheLru).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _cacheLru[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _cacheLru[key];
    }
  });
});
var _decorator = _interopRequireDefault(require("./cache/decorator.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const cacheDecorator = (object, key, cache = new _cacheLru.default()) => (0, _decorator.default)(object, key, cache);
exports.cacheDecorator = cacheDecorator;
var _default = exports.default = _cacheLru.default;