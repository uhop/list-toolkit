/**
 * Extract a range of nodes from a circular SLL.
 * @param {object} options - Link property names.
 * @param {object} range - Range descriptor with `prevFrom` and optional `to`.
 * @returns {{extracted: {prevFrom: object, to: object}, rest: object|null}} The extracted sub-list and the remaining list.
 */
export const extract = ({nextName}, {prevFrom, to = prevFrom[nextName]}) => {
  const node = prevFrom[nextName],
    next = to[nextName];

  // exclude the range
  prevFrom[nextName] = to[nextName];

  // circle the range
  to[nextName] = node;

  return {extracted: {prevFrom: to, to}, rest: next === node ? null : next};
};

/**
 * Pop a single node out of its circular SLL.
 * @param {object} options - Link property names.
 * @param {object} prev - The node preceding the one to pop.
 * @returns {{extracted: {prevFrom: object, to: object}, rest: object|null}} The popped node descriptor and the remaining list.
 */
export const pop = ({nextName}, prev) => {
  const node = prev[nextName],
    next = node[nextName];

  // exclude the node
  prev[nextName] = next;

  // circle the node
  node[nextName] = node;

  return {extracted: {prevFrom: node, to: node}, rest: next === node ? null : next};
};

/**
 * Splice a range of nodes into a circular SLL after a target node.
 * @param {object} options - Link property names.
 * @param {object} target - Node after which to insert.
 * @param {object} range - Range descriptor with `prevFrom` and optional `to`.
 * @returns {object} The target node.
 */
export const splice = ({nextName}, target, {prevFrom, to = prevFrom[nextName]}) => {
  // form the combined head
  const next = target[nextName];
  target[nextName] = prevFrom[nextName];

  // finish the combined  tail
  prevFrom[nextName] = to[nextName];
  to[nextName] = next;

  return target;
};

/**
 * Alias for {@link splice}. Extract a range and splice it after a target node.
 * @type {typeof splice}
 */
export const append = splice;
