/**
 * Validate that a circular DLL is well-formed (every next/prev pair is consistent).
 * @param {object} list - Head node of the circular list (must have `nextName` and `prevName`).
 * @returns {boolean} `true` if the list is valid.
 */
export const isValidList = list => {
  let current = list;
  do {
    const next = current[list.nextName];
    if (!next || next[list.prevName] !== current) return false;
    current = next;
  } while (current !== list);
  return true;
};

/**
 * Validate that a circular SLL is well-formed (every next link is truthy and loops back).
 * @param {object} list - Head node of the circular list (must have `nextName`).
 * @returns {boolean} `true` if the list is valid.
 */
export const isValidSList = list => {
  let current = list;
  do {
    const next = current[list.nextName];
    if (!next) return false;
    current = next;
  } while (current !== list);
  return true;
};

/**
 * Push values to the front of a list one by one.
 * @param {object} list - List with a `pushFront` method.
 * @param {Iterable} values - Iterable of values to push.
 * @returns {object} The list.
 */
export const pushValuesFront = (list, values) => {
  for (const value of values) {
    list.pushFront(value);
  }
  return list;
};

/**
 * Push values to the back of a list one by one.
 * @param {object} list - List with a `pushBack` method.
 * @param {Iterable} values - Iterable of values to push.
 * @returns {object} The list.
 */
export const pushValuesBack = (list, values) => {
  for (const value of values) {
    list.pushBack(value);
  }
  return list;
};

/**
 * Append values to the front of a list, using `appendFront` if compatible, otherwise `pushFront`.
 * @param {object} list - List with `pushFront` and optionally `appendFront`.
 * @param {Iterable} values - Iterable or compatible list of values.
 * @returns {object} The list.
 */
export const appendValuesFront = (list, values) => {
  if (typeof list.appendFront == 'function' && list.isCompatible(values)) {
    list.appendFront(values);
    return list;
  }
  if (!Array.isArray(values)) values = Array.from(values);
  for (let i = values.length - 1; i >= 0; --i) {
    list.pushFront(values[i]);
  }
  return list;
};

/**
 * Append values to the back of a list, using `appendBack` if compatible, otherwise `pushBack`.
 * @param {object} list - List with `pushBack` and optionally `appendBack`.
 * @param {Iterable} values - Iterable or compatible list of values.
 * @returns {object} The list.
 */
export const appendValuesBack = (list, values) => {
  if (typeof list.appendBack == 'function' && list.isCompatible(values)) {
    list.appendBack(values);
    return list;
  }
  return pushValuesBack(list, values);
};

/**
 * Add values before a pointer position one by one.
 * @param {object} ptr - Pointer with an `addBefore` method.
 * @param {Iterable} values - Iterable of values to add.
 * @returns {object} The pointer.
 */
export const addValuesBefore = (ptr, values) => {
  for (const value of values) {
    ptr.addBefore(value);
  }
  return ptr;
};

/**
 * Add values after a pointer position one by one.
 * @param {object} ptr - Pointer with an `addAfter` method.
 * @param {Iterable} values - Iterable of values to add.
 * @returns {object} The pointer.
 */
export const addValuesAfter = (ptr, values) => {
  for (const value of values) {
    ptr.addAfter(value);
  }
  return ptr;
};

/**
 * Insert values before a pointer, using `insertBefore` if compatible, otherwise `addBefore`.
 * @param {object} ptr - Pointer with `addBefore` and optionally `insertBefore`.
 * @param {Iterable} values - Iterable of values to insert.
 * @returns {object} The pointer.
 */
export const insertValuesBefore = (ptr, values) => {
  if (typeof ptr.insertBefore == 'function' && ptr.list.isCompatible(values)) {
    ptr.insertBefore(ptr.list.makeFrom(values));
    return ptr;
  }
  return addValuesBefore(ptr, values);
};

/**
 * Insert values after a pointer, using `insertAfter` if compatible, otherwise `addAfter`.
 * @param {object} ptr - Pointer with `addAfter` and optionally `insertAfter`.
 * @param {Iterable} values - Iterable of values to insert.
 * @returns {object} The pointer.
 */
export const insertValuesAfter = (ptr, values) => {
  if (typeof ptr.insertAfter == 'function' && ptr.list.isCompatible(values)) {
    ptr.insertAfter(ptr.list.makeFrom(values));
    return ptr;
  }
  if (!Array.isArray(values)) values = Array.from(values);
  for (let i = values.length - 1; i >= 0; --i) {
    ptr.addAfter(values[i]);
  }
  return ptr;
};

/**
 * Find the first node matching a condition.
 * @param {object} list - List with a `getNodeIterator` method.
 * @param {Function} condition - Predicate receiving each node.
 * @returns {object|null} The matching node, or `null`.
 */
export const findNodeBy = (list, condition) => {
  for (const node of list.getNodeIterator()) {
    if (condition(node)) return node;
  }
  return null;
};

/**
 * Find the first pointer whose node matches a condition.
 * @param {object} list - List with a `getPtrIterator` method.
 * @param {Function} condition - Predicate receiving each node.
 * @returns {object|null} The matching pointer, or `null`.
 */
export const findPtrBy = (list, condition) => {
  for (const ptr of list.getPtrIterator()) {
    if (condition(ptr.node)) return ptr;
  }
  return null;
};

/**
 * Remove the first node matching a condition.
 * @param {object} list - List with a `getPtrIterator` method.
 * @param {Function} condition - Predicate receiving each node.
 * @returns {object|null} The removed node, or `null`.
 */
export const removeNodeBy = (list, condition) => {
  for (const ptr of list.getPtrIterator()) {
    if (condition(ptr.node)) return ptr.removeCurrent();
  }
  return null;
};

/**
 * Create an adapter that accumulates nodes pushed to the back.
 * @param {Function} ExtListClass - External list constructor.
 * @param {object} [options] - Link property names.
 * @returns {{nextName: string, prevName: string, pushBackNode: Function, releaseList: Function}} A pusher adapter.
 */
export const backPusher = (ExtListClass, options) => {
  const list = new ExtListClass(null, options),
    adapter = {
      nextName: list.nextName,
      prevName: list.prevName,

      pushBackNode: node => {
        const ptr = list.addNodeAfter(node);
        list.next();
        return ptr.node;
      },

      releaseList: () => list.make(list.next().detach())
    };
  return adapter;
};

/**
 * Create an adapter that accumulates nodes pushed to the front.
 * @param {Function} ExtListClass - External list constructor.
 * @param {object} [options] - Link property names.
 * @returns {{nextName: string, prevName: string, pushFrontNode: Function, releaseList: Function}} A pusher adapter.
 */
export const frontPusher = (ExtListClass, options) => {
  const list = new ExtListClass(null, options),
    adapter = {
      nextName: list.nextName,
      prevName: list.prevName,

      pushFrontNode: node => list.addNodeAfter(node).node,

      releaseList: () => list.make(list.detach())
    };
  return adapter;
};
