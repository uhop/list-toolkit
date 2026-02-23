import {ExtListBase, PtrBase, SllOptions, SllRange, SllPtrRange} from './nodes.js';

/** Pointer for navigating and mutating an external (headless) SLL. */
export class Ptr<T extends object = object> extends PtrBase<T> {
  /** The external list this pointer belongs to. */
  list: ExtSList<T>;

  /**
   * @param list - Owning list or another Ptr to copy.
   * @param node - Target node.
   * @param prev - Preceding node.
   */
  constructor(list: ExtSList<T> | Ptr<T>, node?: T | PtrBase<T>, prev?: T);

  /**
   * Create a copy of this pointer.
   * @returns A new Ptr referencing the same list and node.
   */
  clone(): Ptr<T>;
}

/** External (headless) node-based singly linked list. */
export class ExtSList<T extends object = object> extends ExtListBase<T> {
  /** A pointer-based range spanning all nodes, or `null` if empty. */
  get ptrRange(): SllPtrRange<T> | null;

  /**
   * Create a pointer to a node in this list.
   * @param node - Target node, or `undefined` for the head.
   * @returns A new Ptr.
   */
  makePtr(node?: T): Ptr<T>;

  /**
   * Create a pointer to the node after `prev`.
   * @param prev - Preceding node, or `undefined` for the head.
   * @returns A new Ptr.
   */
  makePtrFromPrev(prev?: T): Ptr<T>;

  /**
   * Remove the node after the head.
   * @returns The removed node, or `null` if empty.
   */
  removeNodeAfter(): T | null;

  /** Alias for {@link removeNodeAfter}. */
  removeAfter(): T | null;

  /**
   * Insert a value after the head.
   * @param value - Value or node to insert.
   * @returns A Ptr to the inserted node.
   */
  addAfter(value: T | PtrBase<T>): Ptr<T>;

  /** Alias for {@link addAfter}. */
  add(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert an existing node after the head.
   * @param node - Node or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeAfter(node: T | PtrBase<T>): Ptr<T>;

  /**
   * Splice another external list's nodes after the head.
   * @param extList - Compatible external list to consume.
   * @returns A Ptr to the first inserted node.
   */
  insertAfter(extList: ExtSList<T>): Ptr<T>;

  /**
   * Move a pointed-to node to just after the head.
   * @param ptr - Pointer to the node to move.
   * @returns A Ptr to the moved node, or `this` if already at head.
   */
  moveAfter(ptr: PtrBase<T>): Ptr<T> | this;

  /**
   * Remove all nodes.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns `this` for chaining.
   */
  clear(drop?: boolean): this;

  /**
   * Remove a node via its pointer.
   * @param ptr - Pointer to the node to remove.
   * @returns The removed node, or `null` if empty.
   */
  removeNode(ptr: PtrBase<T>): T | null;

  /**
   * Remove a pointer-based range and optionally drop nodes.
   * @param ptrRange - Range to remove.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns A new ExtSList containing the removed nodes.
   */
  removeRange(ptrRange?: SllPtrRange<T>, drop?: boolean): ExtSList<T>;

  /**
   * Extract a pointer-based range into a new list.
   * @param ptrRange - Range to extract (defaults to the whole list).
   * @returns A new ExtSList containing the extracted nodes.
   */
  extractRange(ptrRange?: SllPtrRange<T>): ExtSList<T>;

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param condition - Predicate receiving each node.
   * @returns A new ExtSList containing the extracted nodes.
   */
  extractBy(condition: (node: T) => boolean): ExtSList<T>;

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

  /** Iterate over nodes starting from the head. */
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
   * Create a shallow clone of this list (shares nodes).
   * @returns A new ExtSList pointing to the same head.
   */
  clone(): ExtSList<T>;

  /**
   * Create an empty list with the same options.
   * @param head - Optional initial head node.
   * @returns A new ExtSList.
   */
  make(head?: T | null): ExtSList<T>;

  /**
   * Create a list from values with the same options.
   * @param values - Iterable of node objects.
   * @returns A new ExtSList.
   */
  makeFrom(values: Iterable<T>): ExtSList<T>;

  /**
   * Build an ExtSList from an iterable of node objects.
   * @param values - Iterable of nodes.
   * @param options - Link property names.
   * @returns A new ExtSList.
   */
  static from<T extends object = object>(values: Iterable<T>, options?: SllOptions): ExtSList<T>;

  /** The Ptr class associated with this list type. */
  static Ptr: typeof Ptr;
}

export default ExtSList;
