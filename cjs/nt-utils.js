'use strict';

// utilities for working with null-terminated lists
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeSListFromNTList = exports.makeNTListFromSListFast = exports.makeNTListFromSList = exports.makeNTListFromList = exports.makeListFromNTList = exports.isNTList = exports.getNTListTail = exports.getNTListLength = exports.getNTListHead = void 0;
const isNTList = (head, {
  nextName = 'next'
} = {}) => {
  if (head === null) return true;
  let current = head;
  do {
    const next = current[nextName];
    if (next === null) return true;
    if (!next) break;
    current = next;
  } while (current !== head);
  return false;
};
exports.isNTList = isNTList;
const getNTListTail = (head, {
  nextName = 'next'
} = {}) => {
  if (head === null) return null;
  let current = head;
  do {
    const next = current[nextName];
    if (!next) return current;
    current = next;
  } while (current !== head);
  return null;
};
exports.getNTListTail = getNTListTail;
const getNTListHead = (node, {
  prevName = 'prev'
} = {}) => getNTListTail(node, {
  nextName: prevName
});
exports.getNTListHead = getNTListHead;
const getNTListLength = (head, {
  nextName = 'next'
} = {}) => {
  if (head === null) return 0;
  let current = head;
  let length = 1;
  do {
    const next = current[nextName];
    if (!next) return length;
    current = next;
    ++length;
  } while (current !== head);
  return length;
};
exports.getNTListLength = getNTListLength;
const makeListFromNTList = (node, {
  nextName = 'next',
  prevName = 'prev'
} = {}) => {
  if (node === null) return null;
  const head = getNTListHead(node, {
      prevName
    }),
    tail = getNTListTail(node, {
      nextName
    });
  head[prevName] = tail;
  tail[nextName] = head;
  return {
    head,
    tail
  };
};
exports.makeListFromNTList = makeListFromNTList;
const makeSListFromNTList = (head, {
  nextName = 'next'
} = {}) => {
  if (head === null) return null;
  const tail = getNTListTail(head, {
    nextName
  });
  tail[nextName] = head;
  return {
    head,
    tail
  };
};
exports.makeSListFromNTList = makeSListFromNTList;
const makeNTListFromList = (head, {
  nextName = 'next',
  prevName = 'prev'
} = {}) => {
  if (head === null) return null;
  const tail = head[prevName];
  tail[nextName] = null;
  head[prevName] = null;
  return {
    head,
    tail
  };
};
exports.makeNTListFromList = makeNTListFromList;
const makeNTListFromSListFast = (head, {
  nextName = 'next'
} = {}) => {
  if (head === null) return null;
  const tail = head;
  head = head[nextName];
  tail[nextName] = null;
  return {
    head,
    tail
  };
};
exports.makeNTListFromSListFast = makeNTListFromSListFast;
const makeNTListFromSList = (head, {
  nextName = 'next'
} = {}) => {
  if (head === null) return null;
  let tail = head;
  for (;;) {
    const next = tail[nextName];
    if (next === head) break;
    tail = next;
  }
  tail[nextName] = null;
  return {
    head,
    tail
  };
};
exports.makeNTListFromSList = makeNTListFromSList;