import {HeadNode, ExtListBase, PtrBase, DllOptions, DllRange} from './nodes.js';
import {Ptr} from './ptr.js';

/** Hosted node-based doubly linked list with a sentinel head. */
export class List<T extends object = object> extends HeadNode {
  /** The first node after the head. */
  get front(): T;

  /** The last node before the head. */
  get back(): T;

  /** A range spanning all nodes, or `null` if empty. */
  get range(): DllRange<T> | null;

  /** Pointer to the first node. */
  get frontPtr(): Ptr<T>;

  /** Pointer to the last node. */
  get backPtr(): Ptr<T>;

  /**
   * Create a pointer to a node in this list.
   * @param node - Target node, or `undefined` for the front.
   * @returns A new Ptr.
   */
  makePtr(node?: T): Ptr<T>;

  /**
   * Create a pointer to the node after `prev`.
   * @param prev - Preceding node, or `undefined` for the front.
   * @returns A new Ptr.
   */
  makePtrFromPrev(prev?: T): Ptr<T>;

  /**
   * Insert a value at the front.
   * @param value - Value or node to insert.
   * @returns A Ptr to the inserted node.
   */
  pushFront(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert a value at the back.
   * @param value - Value or node to insert.
   * @returns A Ptr to the inserted node.
   */
  pushBack(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Remove and return the front node.
   * @returns The removed node, or `undefined` if empty.
   */
  popFrontNode(): T | undefined;

  /**
   * Remove and return the back node.
   * @returns The removed node, or `undefined` if empty.
   */
  popBackNode(): T | undefined;

  /**
   * Alias for {@link popFrontNode}.
   * @returns The removed node, or `undefined` if empty.
   */
  popFront(): T | undefined;

  /**
   * Alias for {@link popFrontNode}.
   * @returns The removed node, or `undefined` if empty.
   */
  pop(): T | undefined;

  /**
   * Alias for {@link popBackNode}.
   * @returns The removed node, or `undefined` if empty.
   */
  popBack(): T | undefined;

  /**
   * Insert an existing node at the front.
   * @param nodeOrPtr - Node or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  pushFrontNode(nodeOrPtr: T | PtrBase<T>): Ptr<T>;

  /**
   * Alias for {@link pushFront}.
   * @param value - Value or node to insert.
   * @returns A Ptr to the inserted node.
   */
  push(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert an existing node at the back.
   * @param nodeOrPtr - Node or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  pushBackNode(nodeOrPtr: T | PtrBase<T>): Ptr<T>;

  /**
   * Move all nodes from another list to the front.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the new front.
   */
  appendFront(list: HeadNode): Ptr<T>;

  /**
   * Move all nodes from another list to the back.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the first appended node.
   */
  appendBack(list: HeadNode): Ptr<T>;

  /**
   * Alias for {@link appendBack}.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the first appended node.
   */
  append(list: HeadNode): Ptr<T>;

  /**
   * Move a node to the front of the list.
   * @param nodeOrPtr - Node or pointer to move.
   * @returns A Ptr to the front.
   */
  moveToFront(nodeOrPtr: T | PtrBase<T>): Ptr<T>;

  /**
   * Move a node to the back of the list.
   * @param nodeOrPtr - Node or pointer to move.
   * @returns A Ptr to the back.
   */
  moveToBack(nodeOrPtr: T | PtrBase<T>): Ptr<T>;

  /**
   * Remove all nodes.
   * @param drop - If `true`, pop nodes one by one (making each stand-alone).
   * @returns `this` for chaining.
   */
  clear(drop?: boolean): this;

  /**
   * Remove a single node from the list.
   * @param nodeOrPtr - Node or pointer to remove.
   * @returns The removed node.
   */
  removeNode(nodeOrPtr: T | PtrBase<T>): T;

  /**
   * Remove a range of nodes and optionally drop them.
   * @param range - Range to remove.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns A new List containing the removed nodes.
   */
  removeRange(range?: DllRange<T>, drop?: boolean): List<T>;

  /**
   * Extract a range of nodes into a new list.
   * @param range - Range to extract (defaults to the whole list).
   * @returns A new List containing the extracted nodes.
   */
  extractRange(range?: DllRange<T>): List<T>;

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param condition - Predicate receiving each node.
   * @returns A new List containing the extracted nodes.
   */
  extractBy(condition: (node: T) => boolean): List<T>;

  /**
   * Reverse the order of all nodes in place.
   * @returns `this` for chaining.
   */
  reverse(): this;

  /**
   * Sort nodes in place using merge sort.
   * @param lessFn - Comparison function returning `true` if `a` should precede `b`.
   * @returns `this` for chaining.
   */
  sort(lessFn: (a: T, b: T) => boolean): this;

  /**
   * Detach all nodes as a raw circular list (no sentinel).
   * @returns Head of the raw circular list, or `null` if empty.
   */
  releaseRawList(): T | null;

  /**
   * Detach all nodes as a null-terminated list.
   * @returns Object with `head` and `tail`, or `null` if empty.
   */
  releaseNTList(): {head: T; tail: T} | null;

  /**
   * Validate that a range is reachable within this list.
   * @param range - Range to validate.
   * @returns `true` if the range is valid.
   */
  validateRange(range?: DllRange<T>): boolean;

  /** Iterate over nodes from front to back. */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Get an iterable over nodes in a range.
   * @param range - Sub-range to iterate (defaults to the whole list).
   * @returns An iterable iterator of nodes.
   */
  getNodeIterator(range?: DllRange<T>): IterableIterator<T>;

  /**
   * Alias for {@link getNodeIterator}.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of nodes.
   */
  getIterator(range?: DllRange<T>): IterableIterator<T>;

  /**
   * Get an iterable of Ptr objects over a range.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of Ptrs.
   */
  getPtrIterator(range?: DllRange<T>): IterableIterator<Ptr<T>>;

  /**
   * Get an iterable over nodes in reverse order.
   * @param range - Sub-range to iterate (defaults to the whole list).
   * @returns An iterable iterator of nodes.
   */
  getReverseNodeIterator(range?: DllRange<T>): IterableIterator<T>;

  /**
   * Alias for {@link getReverseNodeIterator}.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of nodes.
   */
  getReverseIterator(range?: DllRange<T>): IterableIterator<T>;

  /**
   * Get an iterable of Ptr objects in reverse order.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of Ptrs.
   */
  getReversePtrIterator(range?: DllRange<T>): IterableIterator<Ptr<T>>;

  /**
   * Create an empty list with the same options.
   * @returns A new empty List.
   */
  make(): List<T>;

  /**
   * Create a list from values with the same options.
   * @param values - Iterable of values.
   * @returns A new List.
   */
  makeFrom(values: Iterable<T>): List<T>;

  /**
   * Create a list by extracting a range with the same options.
   * @param range - Range to extract.
   * @returns A new List.
   */
  makeFromRange(range: DllRange<T>): List<T>;

  /**
   * Build a list from an iterable.
   * @param values - Iterable of values.
   * @param options - Link property names.
   * @returns A new List.
   */
  static from<T extends object = object>(values: Iterable<T>, options?: DllOptions): List<T>;

  /**
   * Build a list by extracting a range.
   * @param range - Fully specified range.
   * @param options - Link property names.
   * @returns A new List.
   */
  static fromRange<T extends object = object>(range: DllRange<T> | null, options?: DllOptions): List<T>;

  /**
   * Convert an external list into a hosted list.
   * @param extList - External list to consume (will be cleared).
   * @returns A new List.
   */
  static fromExtList<T extends object = object>(extList: ExtListBase<T>): List<T>;

  /** The Ptr class associated with this list type. */
  static Ptr: typeof Ptr;
}

export {Ptr};
export default List;
