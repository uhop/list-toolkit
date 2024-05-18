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

export const directlyTo = Class => ({prototype: Class});

export const addDescriptor = (Class, names, descriptor, force) => {
  const object = Class.prototype || Class;
  if (!descriptor) return object;
  if (typeof names == 'string') names = names.split(/\s*,\s*/);
  for (const name of names) {
    if (!force && object.hasOwnProperty(name)) continue;
    Object.defineProperty(object, name, descriptor);
  }
  return object;
};

export const addDescriptors = (Class, descriptors, force) => {
  for (const [names, descriptor] of Object.entries(descriptors)) {
    addDescriptor(Class, names, descriptor, force);
  }
};

export const addGetter = (Class, names, getter, force) => addDescriptor(Class, names, {configurable: true, enumerable: true, get: getter}, force);

export const addGetters = (Class, getters, force) => {
  for (const [names, value] of Object.entries(getters)) {
    addGetter(Class, names, value, force);
  }
};

export const addAlias = (Class, newNames, oldName, force) => {
  const object = Class.prototype || Class;
  return addDescriptor(Class, newNames, Object.getOwnPropertyDescriptor(object, oldName), force);
};

export const addAliases = (Class, aliases, force) => {
  for (const [oldName, newNames] of Object.entries(aliases)) {
    addAlias(Class, newNames, oldName, force);
  }
};
