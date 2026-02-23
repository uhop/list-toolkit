/**
 * Check whether a linked structure is a valid null-terminated list.
 * @param {object|null} head - First node, or `null` for an empty list.
 * @param {object} [options] - Link property names.
 * @param {string} [options.nextName='next'] - Property name for the next link.
 * @returns {boolean} `true` if the list is null-terminated (not circular).
 */
export const isNTList = (head, {nextName = 'next'} = {}) => {
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

/**
 * Find the tail of a null-terminated list by following next links.
 * @param {object|null} head - First node, or `null`.
 * @param {object} [options] - Link property names.
 * @param {string} [options.nextName='next'] - Property name for the next link.
 * @returns {object|null} The tail node, or `null` if empty or circular.
 */
export const getNTListTail = (head, {nextName = 'next'} = {}) => {
  if (head === null) return null;
  let current = head;
  do {
    const next = current[nextName];
    if (!next) return current;
    current = next;
  } while (current !== head);
  return null;
};

/**
 * Find the head of a null-terminated list by following prev links.
 * @param {object|null} node - Any node in the list, or `null`.
 * @param {object} [options] - Link property names.
 * @param {string} [options.prevName='prev'] - Property name for the previous link.
 * @returns {object|null} The head node, or `null` if empty or circular.
 */
export const getNTListHead = (node, {prevName = 'prev'} = {}) => getNTListTail(node, {nextName: prevName});

/**
 * Count the number of nodes in a null-terminated list.
 * @param {object|null} head - First node, or `null`.
 * @param {object} [options] - Link property names.
 * @param {string} [options.nextName='next'] - Property name for the next link.
 * @returns {number} The node count.
 */
export const getNTListLength = (head, {nextName = 'next'} = {}) => {
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

/**
 * Convert a null-terminated DLL into a circular DLL.
 * @param {object|null} node - Any node in the null-terminated list, or `null`.
 * @param {object} [options] - Link property names.
 * @param {string} [options.nextName='next'] - Property name for the next link.
 * @param {string} [options.prevName='prev'] - Property name for the previous link.
 * @returns {{head: object, tail: object}|null} Head/tail pair, or `null` if empty.
 */
export const makeListFromNTList = (node, {nextName = 'next', prevName = 'prev'} = {}) => {
  if (node === null) return null;
  const head = getNTListHead(node, {prevName}),
    tail = getNTListTail(node, {nextName});
  head[prevName] = tail;
  tail[nextName] = head;
  return {head, tail};
};

/**
 * Convert a null-terminated SLL into a circular SLL.
 * @param {object|null} head - First node, or `null`.
 * @param {object} [options] - Link property names.
 * @param {string} [options.nextName='next'] - Property name for the next link.
 * @returns {{head: object, tail: object}|null} Head/tail pair, or `null` if empty.
 */
export const makeSListFromNTList = (head, {nextName = 'next'} = {}) => {
  if (head === null) return null;
  const tail = getNTListTail(head, {nextName});
  tail[nextName] = head;
  return {head, tail};
};

/**
 * Convert a circular DLL into a null-terminated DLL.
 * @param {object|null} head - Head of the circular list, or `null`.
 * @param {object} [options] - Link property names.
 * @param {string} [options.nextName='next'] - Property name for the next link.
 * @param {string} [options.prevName='prev'] - Property name for the previous link.
 * @returns {{head: object, tail: object}|null} Head/tail pair, or `null` if empty.
 */
export const makeNTListFromList = (head, {nextName = 'next', prevName = 'prev'} = {}) => {
  if (head === null) return null;
  const tail = head[prevName];
  tail[nextName] = null;
  head[prevName] = null;
  return {head, tail};
};

/**
 * Convert a circular SLL into a null-terminated SLL (fast: head becomes second node).
 * @param {object|null} head - Head of the circular list, or `null`.
 * @param {object} [options] - Link property names.
 * @param {string} [options.nextName='next'] - Property name for the next link.
 * @returns {{head: object, tail: object}|null} Head/tail pair, or `null` if empty.
 */
export const makeNTListFromSListFast = (head, {nextName = 'next'} = {}) => {
  if (head === null) return null;
  const tail = head;
  head = head[nextName];
  tail[nextName] = null;
  return {head, tail};
};

/**
 * Convert a circular SLL into a null-terminated SLL (traverses to find the tail).
 * @param {object|null} head - Head of the circular list, or `null`.
 * @param {object} [options] - Link property names.
 * @param {string} [options.nextName='next'] - Property name for the next link.
 * @returns {{head: object, tail: object}|null} Head/tail pair, or `null` if empty.
 */
export const makeNTListFromSList = (head, {nextName = 'next'} = {}) => {
  if (head === null) return null;
  let tail = head;
  for (;;) {
    const next = tail[nextName];
    if (next === head) break;
    tail = next;
  }
  tail[nextName] = null;
  return {head, tail};
};
