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
}

export const decorator = (object, key, Cache, ...args) => {
  const descriptor = Object.getOwnPropertyDescriptor(object, key),
    wrapped = decorateFn(descriptor.get ||descriptor.value, Cache, ...args),
    newDescriptor = {...descriptor};

  if (descriptor.get) newDescriptor.get = wrapped;
  else newDescriptor.value = wrapped;

  Object.defineProperty(object, key, newDescriptor);

  return wrapped;
};

export default decorator;
