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

export const appendValuesFront = (list, values) => list.appendFront(list.makeFrom(values));

export const appendValuesBack = (list, values) => list.appendBack(list.makeFrom(values));

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
