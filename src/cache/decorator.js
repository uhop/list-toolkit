'use strict';

export const decorateFn = (fn, Cache, ...args) => {
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
  wrapped.cache = new Cache(...args);
  return wrapped;
};

export const decorate = (object, key, Cache, ...args) => {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (!descriptor) throw new Error('Missing property: ' + key);

  const newDescriptor = {...descriptor},
    wrapped = decorateFn(descriptor.get || descriptor.value, Cache, ...args);

  if (descriptor.get) newDescriptor.get = wrapped;
  else newDescriptor.value = wrapped;

  Object.defineProperty(object, key, newDescriptor);

  return wrapped;
};

export const decorateMethod = (object, key, Cache, ...args) => {
  const fn = object[key],
    wrapped = decorateFn(fn, Cache, ...args);
  object[key] = wrapped;
  return wrapped;
};

export const getCache = (object, key) => {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (!descriptor) throw new Error('Missing property: ' + key);
  return (descriptor.get || descriptor.value).cache;
};

export default decorate;
