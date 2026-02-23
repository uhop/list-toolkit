/**
 * Capitalize the first letter of a string.
 * @param {string} name - Input string.
 * @returns {string} The capitalized string.
 */
export const capitalize = name => (name ? name[0].toUpperCase() + name.substring(1).toLowerCase() : name);

/**
 * Convert an array of name parts to camelCase.
 * @param {string[]} names - Name parts.
 * @returns {string} The camelCase string.
 */
export const toCamelCase = names => names.map((name, index) => (index ? capitalize(name) : name.toLowerCase())).join('');

/**
 * Split a camelCase string into parts.
 * @param {string} name - camelCase string.
 * @returns {string[]} Array of name parts.
 */
export const fromCamelCase = name => name.split(/(?=[A-Z])/g);

/**
 * Convert an array of name parts to PascalCase.
 * @param {string[]} names - Name parts.
 * @returns {string} The PascalCase string.
 */
export const toPascalCase = names => names.map(name => capitalize(name)).join('');

/**
 * Split a PascalCase string into parts.
 * @param {string} name - PascalCase string.
 * @returns {string[]} Array of name parts.
 */
export const fromPascalCase = name => name.split(/(?=[A-Z])/g);

/**
 * Convert an array of name parts to ALL_CAPS_SNAKE_CASE.
 * @param {string[]} names - Name parts.
 * @returns {string} The ALL_CAPS_SNAKE_CASE string.
 */
export const toAllCapsSnakeCase = names => names.map(name => name.toUpperCase()).join('_');

/**
 * Convert an array of name parts to snake_case.
 * @param {string[]} names - Name parts.
 * @returns {string} The snake_case string.
 */
export const toSnakeCase = names => names.map(name => name.toLowerCase()).join('_');

/**
 * Split a snake_case string into parts.
 * @param {string} name - snake_case string.
 * @returns {string[]} Array of name parts.
 */
export const fromSnakeCase = name => name.split('_');

/**
 * Convert an array of name parts to kebab-case.
 * @param {string[]} names - Name parts.
 * @returns {string} The kebab-case string.
 */
export const toKebabCase = names => names.map(name => name.toLowerCase()).join('-');

/**
 * Split a kebab-case string into parts.
 * @param {string} name - kebab-case string.
 * @returns {string[]} Array of name parts.
 */
export const fromKebabCase = name => name.split('-');

/** @type {PropertyDescriptor} Default property descriptor: configurable and enumerable. */
export const defaultDescriptor = {configurable: true, enumerable: true};

/**
 * Create a property descriptor from a getter function.
 * @param {Function} [getter] - Getter function.
 * @param {PropertyDescriptor} [defaultDescriptor] - Base descriptor to extend.
 * @returns {PropertyDescriptor} A property descriptor with `get`.
 */
export const fromGetter = (getter, defaultDescriptor = defaultDescriptor) => {
  const descriptor = {...defaultDescriptor};
  if (typeof getter == 'function') descriptor.get = getter;
  return descriptor;
};

/**
 * Create a property descriptor from a setter function.
 * @param {Function} [setter] - Setter function.
 * @param {PropertyDescriptor} [defaultDescriptor] - Base descriptor to extend.
 * @returns {PropertyDescriptor} A property descriptor with `set`.
 */
export const fromSetter = (setter, defaultDescriptor = defaultDescriptor) => {
  const descriptor = {...defaultDescriptor};
  if (typeof setter == 'function') descriptor.set = setter;
  return descriptor;
};

/**
 * Create a property descriptor from getter and setter functions.
 * @param {Function} [getter] - Getter function.
 * @param {Function} [setter] - Setter function.
 * @param {PropertyDescriptor} [defaultDescriptor] - Base descriptor to extend.
 * @returns {PropertyDescriptor} A property descriptor with `get` and/or `set`.
 */
export const fromAccessors = (getter, setter, defaultDescriptor = defaultDescriptor) => {
  const descriptor = {...defaultDescriptor};
  if (typeof getter == 'function') descriptor.get = getter;
  if (typeof setter == 'function') descriptor.set = setter;
  return descriptor;
};

/**
 * Define a property descriptor on a target for one or more names.
 * @param {object} target - Object to define properties on.
 * @param {string|PropertyKey[]} names - Comma-separated string, array, or single name/symbol.
 * @param {PropertyDescriptor} [descriptor] - Property descriptor to apply.
 * @param {boolean} [force] - If `true`, overwrite existing own properties.
 * @returns {object} The target object.
 */
export const addDescriptor = (target, names, descriptor, force) => {
  if (!descriptor) return target;
  if (typeof names == 'string') names = names.trim().split(/\s*,\s*/);
  if (!Array.isArray(names)) names = [names];
  for (const name of names) {
    if (!force && target.hasOwnProperty(name)) continue;
    Object.defineProperty(target, name, descriptor);
  }
  return target;
};

/**
 * Define multiple property descriptors on a target.
 * @param {object} target - Object to define properties on.
 * @param {Object<string, PropertyDescriptor>} dict - Map of comma-separated names to descriptors.
 * @param {boolean} [force] - If `true`, overwrite existing own properties.
 */
export const addDescriptors = (target, dict, force) => {
  for (const [names, descriptor] of Object.entries(dict)) {
    addDescriptor(target, names, descriptor, force);
  }
  for (const symbol of Object.getOwnPropertySymbols(dict)) {
    const descriptor = Object.getOwnPropertyDescriptor(dict, symbol);
    if (!descriptor || !descriptor.enumerable) continue;
    addDescriptor(target, [symbol], dict[symbol], force);
  }
};

/**
 * Define an accessor (getter/setter) on a target.
 * @param {object} target - Object to define the accessor on.
 * @param {string|PropertyKey[]} names - Comma-separated string, array, or single name/symbol.
 * @param {Function} [getter] - Getter function.
 * @param {Function} [setter] - Setter function.
 * @param {boolean} [force] - If `true`, overwrite existing own properties.
 * @returns {object} The target object.
 */
export const addAccessor = (target, names, getter, setter, force) => addDescriptor(target, names, fromAccessors(getter, setter), force);

/**
 * Define multiple getter-based descriptors on a target.
 * @param {object} target - Object to define getters on.
 * @param {Object<string, Function>} dict - Map of comma-separated names to getter functions.
 * @param {boolean} [force] - If `true`, overwrite existing own properties.
 */
export const addGetters = (target, dict, force) => {
  for (const [names, getter] of Object.entries(dict)) {
    addDescriptor(target, names, fromGetter(getter), force);
  }
  for (const symbol of Object.getOwnPropertySymbols(dict)) {
    const descriptor = Object.getOwnPropertyDescriptor(dict, symbol);
    if (!descriptor || !descriptor.enumerable) continue;
    addDescriptor(target, [symbol], fromGetter(dict[symbol]), force);
  }
};

/**
 * Copy property descriptors from a source to a target.
 * @param {object} target - Destination object.
 * @param {object} source - Source object.
 * @param {string|symbol|PropertyKey[]|Object<string, string|PropertyKey[]>} names - Names to copy (string, symbol, array, or alias map).
 * @param {boolean} [force] - If `true`, overwrite existing own properties.
 * @returns {object} The target object.
 */
export const copyDescriptors = (target, source, names, force) => {
  switch (typeof names) {
    case 'string':
      names = names.trim().split(/\s*,\s*/);
      break;
    case 'symbol':
      names = [names];
      break;
  }
  if (Array.isArray(names)) {
    for (const name of names) {
      addDescriptor(target, [name], Object.getOwnPropertyDescriptor(source, name), force);
    }
  } else {
    for (const [name, aliases] of Object.entries(names)) {
      addDescriptor(target, aliases, Object.getOwnPropertyDescriptor(source, name), force);
    }
    for (const symbol of Object.getOwnPropertySymbols(names)) {
      const descriptor = Object.getOwnPropertyDescriptor(names, symbol);
      if (!descriptor || !descriptor.enumerable) continue;
      addDescriptor(target, names[symbol], Object.getOwnPropertyDescriptor(source, symbol), force);
    }
  }
  return target;
};

/**
 * Create an alias for an existing property.
 * @param {object} object - Object owning the property.
 * @param {PropertyKey} name - Original property name.
 * @param {string|PropertyKey[]} aliases - Comma-separated alias names or array.
 * @param {boolean} [force] - If `true`, overwrite existing own properties.
 * @returns {object} The object.
 */
export const addAlias = (object, name, aliases, force) => addDescriptor(object, aliases, Object.getOwnPropertyDescriptor(object, name), force);

/**
 * Create multiple aliases from a dictionary.
 * @param {object} object - Object owning the properties.
 * @param {Object<string, string>} dict - Map of original names to comma-separated alias strings.
 * @param {boolean} [force] - If `true`, overwrite existing own properties.
 * @returns {object} The object.
 */
export const addAliases = (object, dict, force) => copyDescriptors(object, object, dict, force);

/**
 * Ensure an iterator object has a `[Symbol.iterator]` method.
 * @param {Iterator} iterator - Iterator to augment.
 * @returns {IterableIterator} The augmented iterator.
 */
export const augmentIterator = iterator => {
  if (!iterator.hasOwnProperty(Symbol.iterator)) {
    iterator[Symbol.iterator] = function () {
      return this;
    };
  }
  return iterator;
};

/**
 * Normalize an iterator, using `Iterator.from` when available.
 * @param {Iterator} iterator - Iterator to normalize.
 * @returns {IterableIterator} An iterable iterator.
 */
let normalizeIterator = augmentIterator;
if (typeof globalThis.Iterator?.from == 'function') {
  normalizeIterator = iterator => Iterator.from(iterator);
}
export {normalizeIterator};

/**
 * Map over an iterator, producing a new iterable.
 * @param {Iterable} iterator - Source iterable.
 * @param {Function} callbackFn - Mapping function receiving value and index.
 * @returns {Iterable} An iterable of mapped values.
 */
export const mapIterator = (iterator, callbackFn) => {
  if (typeof iterator?.map == 'function') return iterator.map(callbackFn);
  return {
    [Symbol.iterator]: () => {
      const iterable = iterator[Symbol.iterator]();
      let index = 0;
      return normalizeIterator({
        next: () => {
          const result = iterable.next();
          if (result.done) return result;
          return {value: callbackFn(result.value, index++)};
        }
      });
    }
  };
};

/** @type {Object<string, number>} Map of `typeof` results that can have properties set on them. */
export const canHaveProps = {object: 1, function: 1};

/**
 * Copy option keys from a pattern and optional sources onto a target.
 * @param {object} target - Target object (created if falsy).
 * @param {object} pattern - Object defining which keys to copy and their defaults.
 * @param {...object} sources - Additional source objects to override values from.
 * @returns {object} The target object.
 */
export const copyOptions = (target, pattern, ...sources) => {
  target = target || {};
  const keys = Object.keys(pattern);
  for (const key of keys) {
    target[key] = pattern[key];
  }
  for (const source of sources) {
    if (!source || canHaveProps[typeof source] !== 1) continue;
    for (const key of keys) {
      if (key in source) target[key] = source[key];
    }
  }
  return target;
};
