/**
 * Validate that a circular DLL is well-formed (every next/prev pair is consistent).
 * @param list - Head node of the circular list (must have `nextName` and `prevName`).
 * @returns `true` if the list is valid.
 */
export function isValidList(list: object): boolean;

/**
 * Validate that a circular SLL is well-formed (every next link is truthy and loops back).
 * @param list - Head node of the circular list (must have `nextName`).
 * @returns `true` if the list is valid.
 */
export function isValidSList(list: object): boolean;

/**
 * Push values to the front of a list one by one.
 * @param list - List with a `pushFront` method.
 * @param values - Iterable of values to push.
 * @returns The list.
 */
export function pushValuesFront<L extends object>(list: L, values: Iterable<any>): L;

/**
 * Push values to the back of a list one by one.
 * @param list - List with a `pushBack` method.
 * @param values - Iterable of values to push.
 * @returns The list.
 */
export function pushValuesBack<L extends object>(list: L, values: Iterable<any>): L;

/**
 * Append values to the front of a list, using `appendFront` if compatible, otherwise `pushFront`.
 * @param list - List with `pushFront` and optionally `appendFront`.
 * @param values - Iterable or compatible list of values.
 * @returns The list.
 */
export function appendValuesFront<L extends object>(list: L, values: Iterable<any>): L;

/**
 * Append values to the back of a list, using `appendBack` if compatible, otherwise `pushBack`.
 * @param list - List with `pushBack` and optionally `appendBack`.
 * @param values - Iterable or compatible list of values.
 * @returns The list.
 */
export function appendValuesBack<L extends object>(list: L, values: Iterable<any>): L;

/**
 * Add values before a pointer position one by one.
 * @param ptr - Pointer with an `addBefore` method.
 * @param values - Iterable of values to add.
 * @returns The pointer.
 */
export function addValuesBefore<P extends object>(ptr: P, values: Iterable<any>): P;

/**
 * Add values after a pointer position one by one.
 * @param ptr - Pointer with an `addAfter` method.
 * @param values - Iterable of values to add.
 * @returns The pointer.
 */
export function addValuesAfter<P extends object>(ptr: P, values: Iterable<any>): P;

/**
 * Insert values before a pointer, using `insertBefore` if compatible, otherwise `addBefore`.
 * @param ptr - Pointer with `addBefore` and optionally `insertBefore`.
 * @param values - Iterable of values to insert.
 * @returns The pointer.
 */
export function insertValuesBefore<P extends object>(ptr: P, values: Iterable<any>): P;

/**
 * Insert values after a pointer, using `insertAfter` if compatible, otherwise `addAfter`.
 * @param ptr - Pointer with `addAfter` and optionally `insertAfter`.
 * @param values - Iterable of values to insert.
 * @returns The pointer.
 */
export function insertValuesAfter<P extends object>(ptr: P, values: Iterable<any>): P;

/**
 * Find the first node matching a condition.
 * @param list - List with a `getNodeIterator` method.
 * @param condition - Predicate receiving each node.
 * @returns The matching node, or `null`.
 */
export function findNodeBy<T extends object>(list: object, condition: (node: T) => boolean): T | null;

/**
 * Find the first pointer whose node matches a condition.
 * @param list - List with a `getPtrIterator` method.
 * @param condition - Predicate receiving each node.
 * @returns The matching pointer, or `null`.
 */
export function findPtrBy(list: object, condition: (node: object) => boolean): object | null;

/**
 * Remove the first node matching a condition.
 * @param list - List with a `getPtrIterator` method.
 * @param condition - Predicate receiving each node.
 * @returns The removed node, or `null`.
 */
export function removeNodeBy(list: object, condition: (node: object) => boolean): object | null;

/** Adapter returned by {@link backPusher}. */
export interface PusherAdapter {
  /** Next link property name. */
  nextName: string;
  /** Previous link property name. */
  prevName: string;
  /** Push a node to the back and return it. */
  pushBackNode(node: object): object;
  /** Release the accumulated list. */
  releaseList(): object;
}

/** Adapter returned by {@link frontPusher}. */
export interface FrontPusherAdapter {
  /** Next link property name. */
  nextName: string;
  /** Previous link property name. */
  prevName: string;
  /** Push a node to the front and return it. */
  pushFrontNode(node: object): object;
  /** Release the accumulated list. */
  releaseList(): object;
}

/**
 * Create an adapter that accumulates nodes pushed to the back.
 * @param ExtListClass - External list constructor.
 * @param options - Link property names.
 * @returns A pusher adapter.
 */
export function backPusher(ExtListClass: new (...args: any[]) => any, options?: object): PusherAdapter;

/**
 * Create an adapter that accumulates nodes pushed to the front.
 * @param ExtListClass - External list constructor.
 * @param options - Link property names.
 * @returns A pusher adapter.
 */
export function frontPusher(ExtListClass: new (...args: any[]) => any, options?: object): FrontPusherAdapter;
