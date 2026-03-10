import {ExtListBase, ValueNode, PtrBase, SllOptions, SllRange, SllPtrRange} from './nodes.js';
import {Ptr} from './ext.js';

/**
 * External (headless) value-based singly linked list. Wraps values in {@link ValueNode}.
 *
 * Extends `ExtSList` at runtime. Internally nodes are `ValueNode<V>`.
 * The default iterator and `getIterator` yield unwrapped `V` values;
 * use `getNodeIterator` for `ValueNode<V>` nodes.
 */
export class ExtValueSList<V = unknown> extends ExtListBase<ValueNode<V>> {
  /** A pointer-based range spanning all nodes, or `null` if empty. */
  get ptrRange(): SllPtrRange<ValueNode<V>> | null;

  /**
   * Create a pointer to a node in this list.
   * @param node - Target node, or `undefined` for the head.
   * @returns A new Ptr.
   */
  makePtr(node?: ValueNode<V>): Ptr<ValueNode<V>>;

  /**
   * Create a pointer to the node after `prev`.
   * @param prev - Preceding node, or `undefined` for the head.
   * @returns A new Ptr.
   */
  makePtrFromPrev(prev?: ValueNode<V>): Ptr<ValueNode<V>>;

  /**
   * Remove the node after the head.
   * @returns The removed node, or `null` if empty.
   */
  removeNodeAfter(): ValueNode<V> | null;

  /** Alias for {@link removeNodeAfter}. */
  removeAfter(): ValueNode<V> | null;

  /**
   * Adopt a value, pointer, or ValueNode into this list.
   * @param value - Raw value, Ptr, or ValueNode.
   * @returns A ValueNode ready for insertion.
   */
  adoptValue(value: V | ValueNode<V> | PtrBase<ValueNode<V>>): ValueNode<V>;

  /**
   * Insert a value after the head.
   * @param value - Raw value, ValueNode, or Ptr.
   * @returns A Ptr to the inserted node.
   */
  addAfter(value: V | ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /** Alias for {@link addAfter}. */
  add(value: V | ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Insert an existing node after the head.
   * @param node - ValueNode or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeAfter(node: ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Splice another list's nodes after the head.
   * @param extList - Compatible external list to consume.
   * @returns A Ptr to the first inserted node.
   */
  insertAfter(extList: ExtValueSList<V>): Ptr<ValueNode<V>>;

  /**
   * Move a pointed-to node to just after the head.
   * @param ptr - Pointer to the node to move.
   * @returns A Ptr to the moved node, or `this` if already at head.
   */
  moveAfter(ptr: PtrBase<ValueNode<V>>): Ptr<ValueNode<V>> | this;

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
  removeNode(ptr: PtrBase<ValueNode<V>>): ValueNode<V> | null;

  /**
   * Remove a pointer-based range and optionally drop nodes.
   * @param ptrRange - Range to remove.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns A new ExtValueSList containing the removed values.
   */
  removeRange(ptrRange?: SllPtrRange<ValueNode<V>>, drop?: boolean): ExtValueSList<V>;

  /**
   * Extract a pointer-based range into a new list.
   * @param ptrRange - Range to extract (defaults to the whole list).
   * @returns A new ExtValueSList containing the extracted values.
   */
  extractRange(ptrRange?: SllPtrRange<ValueNode<V>>): ExtValueSList<V>;

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param condition - Predicate receiving each ValueNode.
   * @returns A new ExtValueSList containing the extracted values.
   */
  extractBy(condition: (node: ValueNode<V>) => boolean): ExtValueSList<V>;

  /**
   * Reverse the order of all nodes in place.
   * @returns `this` for chaining.
   */
  reverse(): this;

  /**
   * Sort nodes in place using merge sort.
   * @param lessFn - Comparison receiving ValueNodes, returns `true` if `a` should precede `b`.
   * @returns `this` for chaining.
   */
  sort(lessFn: (a: ValueNode<V>, b: ValueNode<V>) => boolean): this;

  /** Iterate over unwrapped values starting from the head. */
  [Symbol.iterator](): IterableIterator<V>;

  /**
   * Get an iterable over ValueNodes in a range.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of ValueNodes.
   */
  getNodeIterator(range?: SllRange<ValueNode<V>>): IterableIterator<ValueNode<V>>;

  /**
   * Get an iterable over unwrapped values in a range.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of values.
   */
  getValueIterator(range?: SllRange<ValueNode<V>>): IterableIterator<V>;

  /** Alias for {@link getValueIterator}. */
  getIterator(range?: SllRange<ValueNode<V>>): IterableIterator<V>;

  /**
   * Get an iterable of Ptr objects over a pointer range.
   * @param ptrRange - Sub-range to iterate.
   * @returns An iterable iterator of Ptrs.
   */
  getPtrIterator(ptrRange?: SllPtrRange<ValueNode<V>>): IterableIterator<Ptr<ValueNode<V>>>;

  /**
   * Create a shallow clone of this list.
   * @returns A new ExtValueSList pointing to the same head.
   */
  clone(): ExtValueSList<V>;

  /**
   * Create an empty list with the same options.
   * @param head - Optional initial head node.
   * @returns A new ExtValueSList.
   */
  make(head?: ValueNode<V> | null): ExtValueSList<V>;

  /**
   * Create a list from values with the same options.
   * @param values - Iterable of values.
   * @returns A new ExtValueSList.
   */
  makeFrom(values: Iterable<V>): ExtValueSList<V>;

  /**
   * Build an ExtValueSList from an iterable.
   * @param values - Iterable of values.
   * @param options - Link property names.
   * @returns A new ExtValueSList.
   */
  static from<V = unknown>(values: Iterable<V>, options?: SllOptions): ExtValueSList<V>;

  /** The Ptr class associated with this list type. */
  static Ptr: typeof Ptr;

  /** The ValueNode class used by this list type. */
  static ValueNode: typeof ValueNode;
}

export {ValueNode};
export default ExtValueSList;
