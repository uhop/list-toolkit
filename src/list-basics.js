'use strict';

// useful low-level operations on doubly linked lists

export const pop = ({nextName, prevName}, head) => {
  const rest = head[nextName];
  head[prevName][nextName] = head[nextName];
  head[nextName][prevName] = head[prevName];
  head[prevName] = head[nextName] = head;
  return {node: head, list: rest};
};

export const extract = ({nextName, prevName}, {from, to = from}) => {
  const prev = from[prevName],
    next = to[nextName];
  prev[nextName] = next;
  next[prevName] = prev;
  from[prevName] = to;
  to[nextName] = from;
  return from;
};

export const splice = ({nextName, prevName}, head1, head2) => {
  const tail1 = head1[prevName],
    tail2 = head2[prevName];
  tail1[nextName] = head2;
  head2[prevName] = tail1;
  tail2[nextName] = head1;
  head1[prevName] = tail2;
  return head1;
};

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

export const isNodeLike = ({nextName, prevName}, node) => node && node[prevName] && node[nextName];
export const isStandAlone = ({nextName, prevName}, node) => node && node[prevName] === node && node[nextName] === node;
