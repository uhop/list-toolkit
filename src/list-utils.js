'use strict';

export const pushValuesFront = (list, values) => {
  for (const value of values) {
    list.pushFront(value);
  }
  return list;
};

export const pushValuesBack = (list, values) => {
  for (const value of values) {
    list.pushBack(value);
  }
  return list;
};

export const appendValuesFront = (list, values) => {
  // TODO: if values is a compatible list, don't copy, append it directly.
  // the same goes to other methods
  if (typeof list.appendFront == 'function') {
    list.appendFront(list.makeFrom(values));
    return list;
  }
  if (!Array.isArray(values)) values = Array.from(values);
  for (let i = values.length - 1; i >= 0; --i) {
    list.pushFront(values[i]);
  }
  return list;
};

export const appendValuesBack = (list, values) => {
  if (typeof list.appendBack == 'function') {
    list.appendBack(list.makeFrom(values));
    return list;
  }
  return pushValuesBack(list, values);
};

export const addValuesBefore = (ptr, values) => {
  for (const value of values) {
    ptr.addBefore(value);
  }
  return ptr;
};

export const addValuesAfter = (ptr, values) => {
  for (const value of values) {
    ptr.addAfter(value);
  }
  return ptr;
};

export const insertValuesBefore = (ptr, values) => {
  if (typeof ptr.insertBefore == 'function') return ptr.insertBefore(ptr.list.makeFrom(values));
  return addValuesBefore(ptr, values);
};

export const insertValuesAfter = (ptr, values) => {
  if (typeof ptr.insertAfter == 'function') return ptr.insertAfter(ptr.list.makeFrom(values));
  if (!Array.isArray(values)) values = Array.from(values);
  for (let i = values.length - 1; i >= 0; --i) {
    ptr.addAfter(values[i]);
  }
  return ptr;
};

export const findNodeBy = (list, condition) => {
  for (const node of list.getNodeIterator()) {
    if (condition(node)) return node;
  }
  return null;
};

export const findPtrBy = (list, condition) => {
  for (const ptr of list.getPtrIterator()) {
    if (condition(ptr.node)) return ptr;
  }
  return null;
};

export const removeNodeBy = (list, condition) => {
  for (const ptr of list.getPtrIterator()) {
    if (condition(ptr.node)) return ptr.remove();
  }
  return null;
};
