'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCache = exports.default = exports.decorateMethod = exports.decorateFn = exports.decorate = void 0;
const decorateFn = (fn, cache) => {
  if (typeof fn !== 'function') throw new TypeError('Not a function');
  const wrapped = function (...args) {
    const key = args[0],
      cache = wrapped.cache;
    if (cache.has(key)) return cache.get(key);
    const result = wrapped.fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
  wrapped.fn = fn;
  wrapped.cache = cache;
  return wrapped;
};
exports.decorateFn = decorateFn;
const decorate = (object, key, cache) => {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (!descriptor) throw new Error('Missing property: ' + key);
  const newDescriptor = {
      ...descriptor
    },
    wrapped = decorateFn(descriptor.value, cache);
  newDescriptor.value = wrapped;
  Object.defineProperty(object, key, newDescriptor);
  return wrapped;
};
exports.decorate = decorate;
const decorateMethod = (object, key, cache) => {
  const fn = object[key],
    wrapped = decorateFn(fn, cache);
  object[key] = wrapped;
  return wrapped;
};
exports.decorateMethod = decorateMethod;
const getCache = (object, key) => {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (!descriptor) throw new Error('Missing property: ' + key);
  return descriptor.value.cache;
};
exports.getCache = getCache;
var _default = exports.default = decorate;