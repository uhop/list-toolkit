'use strict';

// useful low-level operations on singly linked lists

export const extract = ({nextName}, {prevFrom, to = prevFrom[nextName]}) => {
  const node = prevFrom[nextName],
    next = to[nextName];

  // exclude the range
  prevFrom[nextName] = to[nextName];

  // circle the range
  to[nextName] = node;

  return {extracted: {prevFrom: to, to}, rest: next === node ? null : next};
};

// pop(options, prev).node === extract(options, {prevFrom: prev}).prevFrom[options.nextName]

export const pop = ({nextName}, prev) => {
  const node = prev[nextName],
    next = node[nextName];

  // exclude the node
  prev[nextName] = next;

  // circle the node
  node[nextName] = node;

  return {extracted: {prevFrom: node, to: node}, rest: next === node ? null : next};
};

export const splice = ({nextName}, target, {prevFrom, to = prevFrom[nextName]}) => {
  // form the combined head
  const next = target[nextName];
  target[nextName] = prevFrom[nextName];

  // finish the combined  tail
  prevFrom[nextName] = to[nextName];
  to[nextName] = next;

  return target;
};

// append(options, target, range) === splice(options, target, extract(options, range))

export const append = splice;
