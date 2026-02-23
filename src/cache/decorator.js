/**
 * Wrap a function with caching. The first argument is used as the cache key.
 * @param {Function} fn - Function to wrap.
 * @param {object} cache - Cache instance with `has`, `get`, and `set` methods.
 * @returns {Function} The wrapped function with `.fn` and `.cache` properties.
 */
export const decorateFn = (fn, cache) => {
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

/**
 * Replace a property descriptor's value with a cached version.
 * @param {object} object - Object owning the property.
 * @param {string} key - Property name.
 * @param {object} cache - Cache instance.
 * @returns {Function} The wrapped function.
 */
export const decorate = (object, key, cache) => {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (!descriptor) throw new Error('Missing property: ' + key);

  const newDescriptor = {...descriptor},
    wrapped = decorateFn(descriptor.value, cache);

  newDescriptor.value = wrapped;

  Object.defineProperty(object, key, newDescriptor);

  return wrapped;
};

/**
 * Replace a method on an object with a cached version.
 * @param {object} object - Object owning the method.
 * @param {string} key - Method name.
 * @param {object} cache - Cache instance.
 * @returns {Function} The wrapped function.
 */
export const decorateMethod = (object, key, cache) => {
  const fn = object[key],
    wrapped = decorateFn(fn, cache);
  object[key] = wrapped;
  return wrapped;
};

/**
 * Retrieve the cache instance from a decorated property.
 * @param {object} object - Object owning the property.
 * @param {string} key - Property name.
 * @returns {object} The cache instance.
 */
export const getCache = (object, key) => {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (!descriptor) throw new Error('Missing property: ' + key);
  return descriptor.value.cache;
};

export default decorate;
