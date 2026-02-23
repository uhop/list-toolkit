'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeNodeBy = exports.pushValuesFront = exports.pushValuesBack = exports.isValidSList = exports.isValidList = exports.insertValuesBefore = exports.insertValuesAfter = exports.frontPusher = exports.findPtrBy = exports.findNodeBy = exports.backPusher = exports.appendValuesFront = exports.appendValuesBack = exports.addValuesBefore = exports.addValuesAfter = void 0;
const isValidList = list => {
  let current = list;
  do {
    const next = current[list.nextName];
    if (!next || next[list.prevName] !== current) return false;
    current = next;
  } while (current !== list);
  return true;
};
exports.isValidList = isValidList;
const isValidSList = list => {
  let current = list;
  do {
    const next = current[list.nextName];
    if (!next) return false;
    current = next;
  } while (current !== list);
  return true;
};
exports.isValidSList = isValidSList;
const pushValuesFront = (list, values) => {
  for (const value of values) {
    list.pushFront(value);
  }
  return list;
};
exports.pushValuesFront = pushValuesFront;
const pushValuesBack = (list, values) => {
  for (const value of values) {
    list.pushBack(value);
  }
  return list;
};
exports.pushValuesBack = pushValuesBack;
const appendValuesFront = (list, values) => {
  if (typeof list.appendFront == 'function' && list.isCompatible(values)) {
    list.appendFront(values);
    return list;
  }
  if (!Array.isArray(values)) values = Array.from(values);
  for (let i = values.length - 1; i >= 0; --i) {
    list.pushFront(values[i]);
  }
  return list;
};
exports.appendValuesFront = appendValuesFront;
const appendValuesBack = (list, values) => {
  if (typeof list.appendBack == 'function' && list.isCompatible(values)) {
    list.appendBack(values);
    return list;
  }
  return pushValuesBack(list, values);
};
exports.appendValuesBack = appendValuesBack;
const addValuesBefore = (ptr, values) => {
  for (const value of values) {
    ptr.addBefore(value);
  }
  return ptr;
};
exports.addValuesBefore = addValuesBefore;
const addValuesAfter = (ptr, values) => {
  for (const value of values) {
    ptr.addAfter(value);
  }
  return ptr;
};
exports.addValuesAfter = addValuesAfter;
const insertValuesBefore = (ptr, values) => {
  if (typeof ptr.insertBefore == 'function' && ptr.list.isCompatible(values)) {
    ptr.insertBefore(ptr.list.makeFrom(values));
    return ptr;
  }
  return addValuesBefore(ptr, values);
};
exports.insertValuesBefore = insertValuesBefore;
const insertValuesAfter = (ptr, values) => {
  if (typeof ptr.insertAfter == 'function' && ptr.list.isCompatible(values)) {
    ptr.insertAfter(ptr.list.makeFrom(values));
    return ptr;
  }
  if (!Array.isArray(values)) values = Array.from(values);
  for (let i = values.length - 1; i >= 0; --i) {
    ptr.addAfter(values[i]);
  }
  return ptr;
};
exports.insertValuesAfter = insertValuesAfter;
const findNodeBy = (list, condition) => {
  for (const node of list.getNodeIterator()) {
    if (condition(node)) return node;
  }
  return null;
};
exports.findNodeBy = findNodeBy;
const findPtrBy = (list, condition) => {
  for (const ptr of list.getPtrIterator()) {
    if (condition(ptr.node)) return ptr;
  }
  return null;
};
exports.findPtrBy = findPtrBy;
const removeNodeBy = (list, condition) => {
  for (const ptr of list.getPtrIterator()) {
    if (condition(ptr.node)) return ptr.removeCurrent();
  }
  return null;
};
exports.removeNodeBy = removeNodeBy;
const backPusher = (ExtListClass, options) => {
  const list = new ExtListClass(null, options),
    adapter = {
      nextName: list.nextName,
      prevName: list.prevName,
      pushBackNode: node => {
        const ptr = list.addNodeAfter(node);
        list.next();
        return ptr.node;
      },
      releaseList: () => list.make(list.next().detach())
    };
  return adapter;
};
exports.backPusher = backPusher;
const frontPusher = (ExtListClass, options) => {
  const list = new ExtListClass(null, options),
    adapter = {
      nextName: list.nextName,
      prevName: list.prevName,
      pushFrontNode: node => list.addNodeAfter(node).node,
      releaseList: () => (void 0).make(list.detach())
    };
  return adapter;
};
exports.frontPusher = frontPusher;