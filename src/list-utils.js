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
  if (typeof list.appendFront == 'function') return list.appendFront(list.makeFrom(values));
  if (!Array.isArray(values)) values = Array.from(values);
  for (let i = values.length - 1; i >= 0; --i) {
    list.pushFront(values[i]);
  }
  return list;
}

export const findNodeBy = (list, condition) => {
  for (const node of list.getNodeIterable()) {
    if (condition(node)) return node;
  }
  return null;
};

export const findPtrBy = (list, condition) => {
  for (const ptr of list.getPtrIterable()) {
    if (condition(ptr.node)) return ptr;
  }
  return null;
};

export const removeNodeBy = (list, condition) => {
  for (const ptr of list.getPtrIterable()) {
    if (condition(ptr.node)) return ptr.remove();
  }
  return null;
};
