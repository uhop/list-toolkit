import {HeadNode, PtrBase, ExtListBase, SllOptions, SllRange, SllPtrRange} from './nodes.js';
import {Ptr} from './ptr.js';

/** Hosted node-based singly linked list. */
export class SList<T extends object = object> extends HeadNode {
  /** The first node after the head. */
  get front(): T;

  /** The last node in the list. */
  get back(): T;

  /** A range spanning all nodes, or `null` if empty. */
  get range(): SllRange<T> | null;

  /** Pointer to the first node. */
  get frontPtr(): Ptr<T>;

  /** A pointer-based range spanning all nodes, or `null` if empty. */
  get ptrRange(): SllPtrRange<T> | null;

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
   * Remove and return the front node.
   * @returns The removed node, or `undefined` if empty.
   */
  popFrontNode(): T | undefined;

  /** Alias for {@link popFrontNode}. */
  popFront(): T | undefined;

  /** Alias for {@link popFrontNode}. */
  pop(): T | undefined;

  /**
   * Insert a value at the front.
   * @param value - Node or value to insert.
   * @returns A Ptr to the front.
   */
  pushFront(value: T | PtrBase<T>): Ptr<T>;

  /** Alias for {@link pushFront}. */
  push(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert a value at the back.
   * @param value - Node or value to insert.
   * @returns A Ptr to the inserted node.
   */
  pushBack(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert an existing node at the front.
   * @param nodeOrPtr - Node or pointer to insert.
   * @returns A Ptr to the front.
   */
  pushFrontNode(nodeOrPtr: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert an existing node at the back.
   * @param nodeOrPtr - Node or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  pushBackNode(nodeOrPtr: T | PtrBase<T>): Ptr<T>;

  /**
   * Move all nodes from another list to the front.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the new front, or this list itself when `list` was empty (no-op chainable).
   */
  appendFront(list: HeadNode): Ptr<T> | this;

  /**
   * Move all nodes from another list to the back.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the first appended node, or this list itself when `list` was empty (no-op chainable).
   */
  appendBack(list: HeadNode): Ptr<T> | this;

  /** Alias for {@link appendBack}. */
  append(list: HeadNode): Ptr<T> | this;

  /**
   * Move a pointed-to node to the front.
   * @param ptr - Pointer to the node to move.
   * @returns A Ptr to the front, or `this` if at head.
   */
  moveToFront(ptr: PtrBase<T>): Ptr<T> | this;

  /**
   * Move a pointed-to node to the back.
   * @param ptr - Pointer to the node to move.
   * @returns A Ptr to the back, or `this` if at head.
   */
  moveToBack(ptr: PtrBase<T>): Ptr<T> | this;

  /**
   * Remove all nodes.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns `this` for chaining.
   */
  clear(drop?: boolean): this;

  /**
   * Remove a node via its pointer.
   * @param ptr - Pointer to the node to remove.
   * @returns The removed node, or `null` if at head.
   */
  removeNode(ptr: PtrBase<T>): T | null;

  /**
   * Remove a pointer-based range and optionally drop nodes.
   * @param ptrRange - Range to remove.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns A new SList containing the removed nodes.
   */
  removeRange(ptrRange?: SllPtrRange<T>, drop?: boolean): SList<T>;

  /**
   * Extract a pointer-based range into a new list.
   * @param ptrRange - Range to extract (defaults to the whole list).
   * @returns A new SList containing the extracted nodes.
   */
  extractRange(ptrRange?: SllPtrRange<T>): SList<T>;

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param condition - Predicate receiving each node.
   * @returns A new SList containing the extracted nodes.
   */
  extractBy(condition: (node: T) => boolean): SList<T>;

  /**
   * Reverse the order of all nodes in place.
   * @returns `this` for chaining.
   */
  reverse(): this;

  /**
   * Sort nodes in place using merge sort.
   * @param lessFn - Returns `true` if `a` should precede `b`.
   * @returns `this` for chaining.
   */
  sort(lessFn: (a: T, b: T) => boolean): this;

  /**
   * Detach all nodes as a pointer range.
   * @returns A pointer range, or `null` if empty.
   */
  releaseAsPtrRange(): SllPtrRange<T> | null;

  /**
   * Detach all nodes as a raw circular list.
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
  validateRange(range?: SllRange<T>): boolean;

  /** Iterate over nodes from front to back. */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Get an iterable over nodes in a range.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of nodes.
   */
  getNodeIterator(range?: SllRange<T>): IterableIterator<T>;

  /** Alias for {@link getNodeIterator}. */
  getIterator(range?: SllRange<T>): IterableIterator<T>;

  /**
   * Get an iterable of Ptr objects over a pointer range.
   * @param ptrRange - Sub-range to iterate.
   * @returns An iterable iterator of Ptrs.
   */
  getPtrIterator(ptrRange?: SllPtrRange<T>): IterableIterator<Ptr<T>>;

  /**
   * Create an empty list with the same options.
   * @returns A new empty SList.
   */
  make(): SList<T>;

  /**
   * Create a list from values with the same options.
   * @param values - Iterable of node objects.
   * @returns A new SList.
   */
  makeFrom(values: Iterable<T>): SList<T>;

  /**
   * Create a list from a range with the same options.
   * @param range - Range to copy.
   * @returns A new SList.
   */
  makeFromRange(range: SllRange<T>): SList<T>;

  /**
   * Build an SList from an iterable of node objects.
   * @param values - Iterable of nodes.
   * @param options - Link property names.
   * @returns A new SList.
   */
  static from<T extends object = object>(values: Iterable<T>, options?: SllOptions): SList<T>;

  /**
   * Build an SList from a pointer range.
   * @param ptrRange - Pointer range to copy.
   * @param options - Link property names.
   * @returns A new SList.
   */
  static fromPtrRange<T extends object = object>(ptrRange: SllPtrRange<T>, options?: SllOptions): SList<T>;

  /**
   * Build an SList from a node range. Requires `range.list` (SLL has no back pointer
   * to derive `prevFrom` from `range.from`); for Ptr-bearing ranges prefer `fromPtrRange`.
   * @param range - Node range to copy. Must include `list` for prev-walking.
   * @param options - Link property names.
   * @returns A new SList.
   */
  static fromRange<T extends object = object>(range: SllRange<T> | null, options?: SllOptions): SList<T>;

  /**
   * Build an SList from an external list, consuming it.
   * @param extList - External list to consume.
   * @returns A new SList.
   */
  static fromExtList<T extends object = object>(extList: ExtListBase<T>): SList<T>;

  /** The Ptr class associated with this list type. */
  static Ptr: typeof Ptr;
}

export {Ptr};
export default SList;
