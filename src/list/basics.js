// @ts-self-types="./basics.d.ts"

export const extract = ({nextName, prevName}, {from, to = from}) => {
  const next = to[nextName],
    prev = from[prevName];

  // extract
  prev[nextName] = next;
  next[prevName] = prev;

  // clear
  from[prevName] = to;
  to[nextName] = from;

  return {extracted: from, rest: next === from ? null : next};
};

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
  const next = target[nextName],
    from = circularList,
    to = from[prevName];

  // splice
  target[nextName] = from;
  from[prevName] = target;
  to[nextName] = next;
  next[prevName] = to;

  return target;
};

export const append = ({nextName, prevName}, target, {from, to = from}) => {
  // extract
  from[prevName][nextName] = to[nextName];
  to[nextName][prevName] = from[prevName];

  // splice
  to[nextName] = target[nextName];
  to[nextName][prevName] = to;
  target[nextName] = from;
  from[prevName] = target;

  return target;
};
