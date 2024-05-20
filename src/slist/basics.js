'use strict';

// useful low-level operations on singly linked lists

export const extract = ({nextName}, {prevFrom, to = prevFrom[nextName]}) => {
  const node = prevFrom[nextName];
  prevFrom[nextName] = to[nextName]; // exclude the range
  to[nextName] = node; // circle the range making node a list head
  return {prevFrom: to, to};
};

// pop(options, prev).node === extract(options, {prevFrom: prev}).prevFrom[options.nextName]

export const pop = ({nextName}, prev) => {
  const node = prev[nextName];
  prev[nextName] = node[nextName];
  node[nextName] = node;
  return {node, list: prev};
};

export const splice = ({nextName}, target, {prevFrom, to = prevFrom[nextName]}) => {
  const tail = target[nextName];
  target[nextName] = prevFrom[nextName];
  prevFrom[nextName] = to[nextName]; // exclude the range
  to[nextName] = tail;
  return target;
};

// append(options, target, range) === splice(options, target, extract(options, range))

export const append = ({nextName}, target, {prevFrom, to = prevFrom[nextName]}) => {
  const head = prevFrom[nextName],
    next = target[nextName];
  prevFrom[nextName] = to[nextName]; // exclude the range
  // include the range
  target[nextName] = head;
  to[nextName] = next;
  return target;
};

export const isNodeLike = ({nextName}, node) => node && node[nextName];
export const isStandAlone = ({nextName}, node) => node && node[nextName] === node;
