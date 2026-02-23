/**
 * Extract a range of nodes from a circular DLL.
 * @param {object} options - Link property names.
 * @param {object} range - Range descriptor with `from` and optional `to`.
 * @returns {{extracted: object, rest: object|null}} The extracted sub-list and the remaining list.
 */
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

/**
 * Pop a single node out of its circular DLL.
 * @param {object} options - Link property names.
 * @param {object} node - The node to pop.
 * @returns {{extracted: object, rest: object|null}} The popped node (now stand-alone) and the remaining list.
 */
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

/**
 * Splice a circular DLL into another list after a target node.
 * @param {object} options - Link property names.
 * @param {object} target - Node after which to insert.
 * @param {object} circularList - Head of the circular list to splice in.
 * @returns {object} The target node.
 */
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

/**
 * Extract a range and splice it after a target node in one operation.
 * @param {object} options - Link property names.
 * @param {object} target - Node after which to insert.
 * @param {object} range - Range descriptor with `from` and optional `to`.
 * @returns {object} The target node.
 */
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
