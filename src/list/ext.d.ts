import {ExtListBase, PtrBase, DllOptions, DllRange} from './nodes.js';

/** Pointer for navigating and mutating an external (headless) DLL. */
export class Ptr<T extends object = object> extends PtrBase<T> {
  /** The external list this pointer belongs to. */
  list: ExtList<T>;

  /**
   * @param list - Owning list or another Ptr to copy.
   * @param node - Target node.
   */
  constructor(list: ExtList<T> | Ptr<T>, node?: T);

  /**
   * Create a copy of this pointer.
   * @returns A new Ptr referencing the same list and node.
   */
  clone(): Ptr<T>;
}

/** External (headless) node-based doubly linked list. */
export class ExtList<T extends object = object> extends ExtListBase<T> {
  /**
   * Create a pointer to a node in this list.
   * @param node - Target node, or `undefined` for the head.
   * @returns A new Ptr, or `null` if the list is empty and no node given.
   */
  makePtr(node?: T): Ptr<T> | null;

  /**
   * Create a pointer to the node after `prev`.
   * @param prev - Preceding node, or `undefined` for the front.
   * @returns A new Ptr.
   */
  makePtrFromPrev(prev?: T): Ptr<T>;

  // Ptr-style API

  /**
   * Remove the current head node and advance to the next.
   * @returns The removed node, or `null` if empty.
   */
  removeCurrent(): T | null;

  /**
   * Remove the node before the head.
   * @returns The removed node, or `null` if empty.
   */
  removeNodeBefore(): T | null;

  /**
   * Alias for {@link removeNodeBefore}.
   * @returns The removed node, or `null` if empty.
   */
  removeBefore(): T | null;

  /**
   * Remove the node after the head.
   * @returns The removed node, or `null` if empty.
   */
  removeNodeAfter(): T | null;

  /**
   * Alias for {@link removeNodeAfter}.
   * @returns The removed node, or `null` if empty.
   */
  removeAfter(): T | null;

  /**
   * Insert a value before the head.
   * @param value - Value or node to insert.
   * @returns A Ptr to the inserted node.
   */
  addBefore(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert a value after the head.
   * @param value - Value or node to insert.
   * @returns A Ptr to the inserted node.
   */
  addAfter(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Alias for {@link addAfter}.
   * @param value - Value or node to insert.
   * @returns A Ptr to the inserted node.
   */
  add(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert an existing node before the head.
   * @param nodeOrPtr - Node or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeBefore(nodeOrPtr: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert an existing node after the head.
   * @param nodeOrPtr - Node or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeAfter(nodeOrPtr: T | PtrBase<T>): Ptr<T>;

  /**
   * Splice another external list's nodes before the head.
   * @param extList - Compatible external list to consume.
   * @returns A Ptr to the first inserted node, or `null` if empty.
   */
  insertBefore(extList: ExtList<T>): Ptr<T> | null;

  /**
   * Splice another external list's nodes after the head.
   * @param extList - Compatible external list to consume.
   * @returns A Ptr to the first inserted node, or `null` if empty.
   */
  insertAfter(extList: ExtList<T>): Ptr<T> | null;

  /**
   * Move a node to just before the head.
   * @param nodeOrPtr - Node or pointer to move.
   * @returns A Ptr to the moved node, or `this` if already at head.
   */
  moveBefore(nodeOrPtr: T | PtrBase<T>): Ptr<T> | this;

  /**
   * Move a node to just after the head.
   * @param nodeOrPtr - Node or pointer to move.
   * @returns A Ptr to the moved node, or `this` if already at head.
   */
  moveAfter(nodeOrPtr: T | PtrBase<T>): Ptr<T> | this;

  // List-style API

  /**
   * Remove all nodes.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns `this` for chaining.
   */
  clear(drop?: boolean): this;

  /**
   * Remove a single node from the list.
   * @param nodeOrPtr - Node or pointer to remove.
   * @returns The removed node, or `null` if empty.
   */
  removeNode(nodeOrPtr: T | PtrBase<T>): T | null;

  /**
   * Remove a range of nodes and optionally drop them.
   * @param range - Range to remove.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns A new ExtList containing the removed nodes.
   */
  removeRange(range?: DllRange<T>, drop?: boolean): ExtList<T>;

  /**
   * Extract a range of nodes into a new list.
   * @param range - Range to extract (defaults to the whole list).
   * @returns A new ExtList containing the extracted nodes.
   */
  extractRange(range?: DllRange<T>): ExtList<T>;

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param condition - Predicate receiving each node.
   * @returns A new ExtList containing the extracted nodes.
   */
  extractBy(condition: (node: T) => boolean): ExtList<T>;

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

  /** Iterate over nodes starting from the head. */
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
   * Create a shallow clone of this list (shares nodes).
   * @returns A new ExtList pointing to the same head.
   */
  clone(): ExtList<T>;

  /**
   * Create an empty list with the same options.
   * @param head - Optional initial head node.
   * @returns A new ExtList.
   */
  make(head?: T | null): ExtList<T>;

  /**
   * Create a list from values with the same options.
   * @param values - Iterable of node objects.
   * @returns A new ExtList.
   */
  makeFrom(values: Iterable<T>): ExtList<T>;

  /**
   * Build an ExtList from an iterable of node objects.
   * @param values - Iterable of nodes.
   * @param options - Link property names.
   * @returns A new ExtList.
   */
  static from<T extends object = object>(values: Iterable<T>, options?: DllOptions): ExtList<T>;

  /** The Ptr class associated with this list type. */
  static Ptr: typeof Ptr;
}

export default ExtList;
