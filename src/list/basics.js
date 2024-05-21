'use strict';

// useful low-level operations on doubly linked lists

export const extract = ({nextName, prevName}, {from, to = from}) => {
  const prev = from[prevName],
    next = to[nextName];
  // extract
  prev[nextName] = next;
  next[prevName] = prev;
  // clear
  from[prevName] = to;
  to[nextName] = from;
  return {extracted: from, rest: next === from ? null : next};
};

// pop(options, head).node === extract(options, {from: head})

export const pop = ({nextName, prevName}, node) => {
  const next = node[nextName],
    prev = node[prevName];
  // extract
  prev[nextName] = next;
  next[prevName] = prev;
  // clear
  node[prevName] = node[nextName] = node;
  return {extracted: node, rest: next === node ? null : next};
};

export const splice = ({nextName, prevName}, target, circularList) => {
  const targetTail = target[prevName],
    listTail = circularList[prevName];
  targetTail[nextName] = circularList;
  circularList[prevName] = targetTail;
  listTail[nextName] = target;
  target[prevName] = listTail;
  return target;
};

// append(options, target, range) === splice(options, target, extract(options, range))

export const append = ({nextName, prevName}, target, {from, to = from}) => {
  // extract
  from[prevName][nextName] = to[nextName];
  to[nextName][prevName] = from[prevName];

  // splice
  const next = target[nextName];
  target[nextName] = from;
  from[prevName] = target;
  to[nextName] = next;
  next[prevName] = to;

  return target;
};
