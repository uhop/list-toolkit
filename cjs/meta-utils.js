"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toSnakeCase = exports.toPascalCase = exports.toKebabCase = exports.toCamelCase = exports.toAllCapsSnakeCase = exports.normalizeIterator = exports.mapIterator = exports.fromSnakeCase = exports.fromSetter = exports.fromPascalCase = exports.fromKebabCase = exports.fromGetter = exports.fromCamelCase = exports.fromAccessors = exports.defaultDescriptor = exports.copyOptions = exports.copyDescriptors = exports.capitalize = exports.canHaveProps = exports.augmentIterator = exports.addGetters = exports.addDescriptors = exports.addDescriptor = exports.addAliases = exports.addAlias = exports.addAccessor = void 0;
const capitalize = name => name ? name[0].toUpperCase() + name.substring(1).toLowerCase() : name;
exports.capitalize = capitalize;
const toCamelCase = names => names.map((name, index) => index ? capitalize(name) : name.toLowerCase()).join('');
exports.toCamelCase = toCamelCase;
const fromCamelCase = name => name.split(/(?=[A-Z])/g);
exports.fromCamelCase = fromCamelCase;
const toPascalCase = names => names.map(name => capitalize(name)).join('');
exports.toPascalCase = toPascalCase;
const fromPascalCase = name => name.split(/(?=[A-Z])/g);
exports.fromPascalCase = fromPascalCase;
const toAllCapsSnakeCase = names => names.map(name => name.toUpperCase()).join('_');
exports.toAllCapsSnakeCase = toAllCapsSnakeCase;
const toSnakeCase = names => names.map(name => name.toLowerCase()).join('_');
exports.toSnakeCase = toSnakeCase;
const fromSnakeCase = name => name.split('_');
exports.fromSnakeCase = fromSnakeCase;
const toKebabCase = names => names.map(name => name.toLowerCase()).join('-');
exports.toKebabCase = toKebabCase;
const fromKebabCase = name => name.split('-');
exports.fromKebabCase = fromKebabCase;
const defaultDescriptor = exports.defaultDescriptor = {
  configurable: true,
  enumerable: true
};
const fromGetter = (getter, defaultDescriptor = defaultDescriptor) => {
  const descriptor = {
    ...defaultDescriptor
  };
  if (typeof getter == 'function') descriptor.get = getter;
  return descriptor;
};
exports.fromGetter = fromGetter;
const fromSetter = (setter, defaultDescriptor = defaultDescriptor) => {
  const descriptor = {
    ...defaultDescriptor
  };
  if (typeof setter == 'function') descriptor.set = setter;
  return descriptor;
};
exports.fromSetter = fromSetter;
const fromAccessors = (getter, setter, defaultDescriptor = defaultDescriptor) => {
  const descriptor = {
    ...defaultDescriptor
  };
  if (typeof getter == 'function') descriptor.get = getter;
  if (typeof setter == 'function') descriptor.set = setter;
  return descriptor;
};
exports.fromAccessors = fromAccessors;
const addDescriptor = (target, names, descriptor, force) => {
  if (!descriptor) return target;
  if (typeof names == 'string') names = names.trim().split(/\s*,\s*/);
  if (!Array.isArray(names)) names = [names];
  for (const name of names) {
    if (!force && target.hasOwnProperty(name)) continue;
    Object.defineProperty(target, name, descriptor);
  }
  return target;
};
exports.addDescriptor = addDescriptor;
const addDescriptors = (target, dict, force) => {
  for (const [names, descriptor] of Object.entries(dict)) {
    addDescriptor(target, names, descriptor, force);
  }
  for (const symbol of Object.getOwnPropertySymbols(dict)) {
    const descriptor = Object.getOwnPropertyDescriptor(dict, symbol);
    if (!descriptor || !descriptor.enumerable) continue;
    addDescriptor(target, [symbol], dict[symbol], force);
  }
};
exports.addDescriptors = addDescriptors;
const addAccessor = (target, names, getter, setter, force) => addDescriptor(target, names, fromAccessors(getter, setter), force);
exports.addAccessor = addAccessor;
const addGetters = (target, dict, force) => {
  for (const [names, getter] of Object.entries(dict)) {
    addDescriptor(target, names, fromGetter(getter), force);
  }
  for (const symbol of Object.getOwnPropertySymbols(dict)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, symbol);
    if (!descriptor || !descriptor.enumerable) continue;
    addDescriptor(target, [symbol], fromGetter(dict[symbol]), force);
  }
};
exports.addGetters = addGetters;
const copyDescriptors = (target, source, names, force) => {
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
exports.copyDescriptors = copyDescriptors;
const addAlias = (object, name, aliases, force) => addDescriptor(object, aliases, Object.getOwnPropertyDescriptor(object, name), force);
exports.addAlias = addAlias;
const addAliases = (object, dict, force) => copyDescriptors(object, object, dict, force);
exports.addAliases = addAliases;
const augmentIterator = iterator => {
  if (!iterator.hasOwnProperty(Symbol.iterator)) {
    iterator[Symbol.iterator] = function () {
      return this;
    };
  }
  return iterator;
};
exports.augmentIterator = augmentIterator;
let normalizeIterator = exports.normalizeIterator = augmentIterator;
if (typeof globalThis.Iterator?.from == 'function') {
  exports.normalizeIterator = normalizeIterator = iterator => Iterator.from(iterator);
}
const mapIterator = (iterator, callbackFn) => {
  if (typeof iterator?.map == 'function') return iterator.map(callbackFn);
  return {
    [Symbol.iterator]: () => {
      const iterable = iterator[Symbol.iterator]();
      let index = 0;
      return normalizeIterator({
        next: () => {
          const result = iterable.next();
          if (result.done) return result;
          return {
            value: callbackFn(result.value, index++)
          };
        }
      });
    }
  };
};
exports.mapIterator = mapIterator;
const canHaveProps = exports.canHaveProps = {
  object: 1,
  function: 1
};
const copyOptions = (target, pattern, ...sources) => {
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
exports.copyOptions = copyOptions;