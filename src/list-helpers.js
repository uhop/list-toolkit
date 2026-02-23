/**
 * Normalize a node or pointer to a plain node, validating compatibility.
 * @param {object} list - Owning list for validation.
 * @param {object|null} node - Node or pointer to normalize.
 * @param {Function} PtrBase - Pointer base class for `instanceof` checks.
 * @returns {object|null} The underlying node, or `null`.
 */
export const normalizeNode = (list, node, PtrBase) => {
  if (!node) return null;
  if (node instanceof PtrBase) {
    if (!list.isCompatible(node.list)) throw new Error('Incompatible lists');
    node = node.node;
  } else {
    if (!list.isNodeLike(node)) throw new Error('Not a compatible node');
  }
  return node;
};

/**
 * Check whether a range is compatible with a list host.
 * @param {object} listHost - List to validate against.
 * @param {object} [range] - Range to check.
 * @param {Function} PtrBase - Pointer base class for `instanceof` checks.
 * @returns {boolean} `true` if the range is compatible.
 */
export const isRangeLike = (listHost, range, PtrBase) => {
  if (!range) return true;

  if (range.list && !listHost.isCompatible(range.list)) return false;

  let list = range.list;

  if (range.from instanceof PtrBase) {
    if (range.list) {
      if (range.from.list !== range.list) return false;
    } else {
      if (!listHost.isCompatible(range.from.list)) return false;
      list ||= range.from.list;
    }
  } else {
    if (range.from && !listHost.isNodeLike(range.from)) return false;
  }

  if (range.to instanceof PtrBase) {
    if (list) {
      if (range.to.list !== list) return false;
    } else {
      if (!listHost.isCompatible(range.to.list)) return false;
    }
  } else {
    if (range.to && !listHost.isNodeLike(range.to)) return false;
  }

  return true;
};

/**
 * Normalize a range, resolving any pointers to plain nodes.
 * @param {object} listHost - List to validate against.
 * @param {object} [range] - Range to normalize.
 * @param {Function} PtrBase - Pointer base class for `instanceof` checks.
 * @returns {object|null} The normalized range with `from`/`to` as plain nodes, or `null`.
 */
export const normalizeRange = (listHost, range, PtrBase) => {
  if (!range) return null;
  if (!isRangeLike(listHost, range, PtrBase)) throw new Error('Not a compatible range');
  let {from, to} = range;
  if (from instanceof PtrBase) from = from.node;
  if (to instanceof PtrBase) to = to.node;
  return {...range, from, to};
};

/**
 * Check whether a pointer-based range is compatible with a list host.
 * @param {object} listHost - List to validate against.
 * @param {object} [range] - Pointer range to check (must have `from` as a PtrBase).
 * @param {Function} PtrBase - Pointer base class for `instanceof` checks.
 * @returns {boolean} `true` if the pointer range is compatible.
 */
export const isPtrRangeLike = (listHost, range, PtrBase) => {
  if (!range) return true;
  if (!(range.from instanceof PtrBase)) return false;

  if (range.list) {
    if (!listHost.isCompatible(range.list)) return false;
    if (range.from.list !== range.list) return false;
  } else {
    if (!listHost.isCompatible(range.from.list)) return false;
  }

  if (range.to instanceof PtrBase) {
    if (range.to.list !== (range.list || range.from.list)) return false;
  } else {
    if (range.to && !listHost.isNodeLike(range.to)) return false;
  }

  return true;
};

/**
 * Normalize a pointer-based range, resolving `to` to a plain node.
 * @param {object} listHost - List to validate against.
 * @param {object} [range] - Pointer range to normalize.
 * @param {Function} PtrBase - Pointer base class for `instanceof` checks.
 * @returns {object|null} The normalized pointer range, or `null`.
 */
export const normalizePtrRange = (listHost, range, PtrBase) => {
  if (!range) return null;
  if (!isPtrRangeLike(listHost, range, PtrBase)) throw new Error('Not a compatible ptr range');
  let {from, to} = range;
  if (to instanceof PtrBase) to = to.node;
  return {...range, from, to};
};
