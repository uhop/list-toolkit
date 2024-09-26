export const capitalize = name => (name ? name[0].toUpperCase() + name.substring(1).toLowerCase() : name);

export const toCamelCase = names => names.map((name, index) => (index ? capitalize(name) : name.toLowerCase())).join('');
export const fromCamelCase = name => name.split(/(?=[A-Z])/g);

export const toPascalCase = names => names.map(name => capitalize(name)).join('');
export const fromPascalCase = name => name.split(/(?=[A-Z])/g);

export const toAllCapsSnakeCase = names => names.map(name => name.toUpperCase()).join('_');
export const toSnakeCase = names => names.map(name => name.toLowerCase()).join('_');
export const fromSnakeCase = name => name.split('_');

export const toKebabCase = names => names.map(name => name.toLowerCase()).join('-');
export const fromKebabCase = name => name.split('-');

export const defaultDescriptor = {configurable: true, enumerable: true};

export const fromGetter = (getter, defaultDescriptor = defaultDescriptor) => {
  const descriptor = {...defaultDescriptor};
  if (typeof getter == 'function') descriptor.get = getter;
  return descriptor;
};

export const fromSetter = (setter, defaultDescriptor = defaultDescriptor) => {
  const descriptor = {...defaultDescriptor};
  if (typeof setter == 'function') descriptor.set = setter;
  return descriptor;
};

export const fromAccessors = (getter, setter, defaultDescriptor = defaultDescriptor) => {
  const descriptor = {...defaultDescriptor};
  if (typeof getter == 'function') descriptor.get = getter;
  if (typeof setter == 'function') descriptor.set = setter;
  return descriptor;
};

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

export const addAccessor = (target, names, getter, setter, force) => addDescriptor(target, names, fromAccessors(getter, setter), force);

export const addGetters = (target, dict, force) => {
  for (const [names, getter] of Object.entries(dict)) {
    addDescriptor(target, names, fromGetter(getter), force);
  }
  for (const symbol of Object.getOwnPropertySymbols(dict)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, symbol);
    if (!descriptor || !descriptor.enumerable) continue;
    addDescriptor(target, [symbol], fromGetter(dict[symbol]), force);
  }
};

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

export const addAlias = (object, name, aliases, force) => addDescriptor(object, aliases, Object.getOwnPropertyDescriptor(object, name), force);

export const addAliases = (object, dict, force) => copyDescriptors(object, object, dict, force);

export const augmentIterator = iterator => {
  if (!iterator.hasOwnProperty(Symbol.iterator)) {
    iterator[Symbol.iterator] = function () {
      return this;
    };
  }
  return iterator;
};

let normalizeIterator = augmentIterator;
if (typeof globalThis.Iterator?.from == 'function') {
  normalizeIterator = iterator => Iterator.from(iterator);
}
export {normalizeIterator};

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

export const canHaveProps = {object: 1, function: 1};

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
