import {ExtListBase, ValueNode, PtrBase, DllOptions, DllRange} from './nodes.js';
import {Ptr} from './ext.js';

/**
 * External (headless) value-based doubly linked list. Wraps values in {@link ValueNode}.
 *
 * Extends `ExtList` at runtime. Internally nodes are `ValueNode<V>`.
 * The default iterator and `getIterator`/`getReverseIterator` yield
 * unwrapped `V` values; use `getNodeIterator`/`getReverseNodeIterator`
 * for `ValueNode<V>` nodes.
 */
export class ExtValueList<V = unknown> extends ExtListBase<ValueNode<V>> {
  /**
   * Create a pointer to a node in this list.
   * @param node - Target node, or `undefined` for the head.
   * @returns A new Ptr, or `null` if the list is empty and no node given.
   */
  makePtr(node?: ValueNode<V>): Ptr<ValueNode<V>> | null;

  /**
   * Create a pointer to the node after `prev`.
   * @param prev - Preceding node, or `undefined` for the front.
   * @returns A new Ptr.
   */
  makePtrFromPrev(prev?: ValueNode<V>): Ptr<ValueNode<V>>;

  /**
   * Remove the current head node and advance to the next.
   * @returns The removed node, or `null` if empty.
   */
  removeCurrent(): ValueNode<V> | null;

  /**
   * Remove the node before the head.
   * @returns The removed node, or `null` if empty.
   */
  removeNodeBefore(): ValueNode<V> | null;

  /** Alias for {@link removeNodeBefore}. */
  removeBefore(): ValueNode<V> | null;

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
   * Insert a value before the head.
   * @param value - Raw value, ValueNode, or Ptr.
   * @returns A Ptr to the inserted node.
   */
  addBefore(value: V | ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Insert an existing node before the head.
   * @param nodeOrPtr - ValueNode or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeBefore(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Insert an existing node after the head.
   * @param nodeOrPtr - ValueNode or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeAfter(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Splice another list's nodes before the head.
   * @param extList - Compatible external list to consume.
   * @returns A Ptr to the first inserted node, or `null` if empty.
   */
  insertBefore(extList: ExtValueList<V>): Ptr<ValueNode<V>> | null;

  /**
   * Splice another list's nodes after the head.
   * @param extList - Compatible external list to consume.
   * @returns A Ptr to the first inserted node, or `null` if empty.
   */
  insertAfter(extList: ExtValueList<V>): Ptr<ValueNode<V>> | null;

  /**
   * Move a node to just before the head.
   * @param nodeOrPtr - Node or pointer to move.
   * @returns A Ptr to the moved node, or `this` if already at head.
   */
  moveBefore(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>> | this;

  /**
   * Move a node to just after the head.
   * @param nodeOrPtr - Node or pointer to move.
   * @returns A Ptr to the moved node, or `this` if already at head.
   */
  moveAfter(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>> | this;

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
  removeNode(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): ValueNode<V> | null;

  /**
   * Remove a range of nodes and optionally drop them.
   * @param range - Range to remove.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns A new ExtValueList containing the removed values.
   */
  removeRange(range?: DllRange<ValueNode<V>>, drop?: boolean): ExtValueList<V>;

  /**
   * Extract a range of nodes into a new list.
   * @param range - Range to extract (defaults to the whole list).
   * @returns A new ExtValueList containing the extracted values.
   */
  extractRange(range?: DllRange<ValueNode<V>>): ExtValueList<V>;

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param condition - Predicate receiving each ValueNode.
   * @returns A new ExtValueList containing the extracted values.
   */
  extractBy(condition: (node: ValueNode<V>) => boolean): ExtValueList<V>;

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
  getNodeIterator(range?: DllRange<ValueNode<V>>): IterableIterator<ValueNode<V>>;

  /**
   * Get an iterable over unwrapped values in a range.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of values.
   */
  getValueIterator(range?: DllRange<ValueNode<V>>): IterableIterator<V>;

  /** Alias for {@link getValueIterator}. */
  getIterator(range?: DllRange<ValueNode<V>>): IterableIterator<V>;

  /**
   * Get an iterable over ValueNodes in reverse order.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of ValueNodes.
   */
  getReverseNodeIterator(range?: DllRange<ValueNode<V>>): IterableIterator<ValueNode<V>>;

  /**
   * Get an iterable over unwrapped values in reverse order.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of values.
   */
  getReverseValueIterator(range?: DllRange<ValueNode<V>>): IterableIterator<V>;

  /** Alias for {@link getReverseValueIterator}. */
  getReverseIterator(range?: DllRange<ValueNode<V>>): IterableIterator<V>;

  /**
   * Get an iterable of Ptr objects over a range.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of Ptrs.
   */
  getPtrIterator(range?: DllRange<ValueNode<V>>): IterableIterator<Ptr<ValueNode<V>>>;

  /**
   * Get an iterable of Ptr objects in reverse order.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of Ptrs.
   */
  getReversePtrIterator(range?: DllRange<ValueNode<V>>): IterableIterator<Ptr<ValueNode<V>>>;

  /**
   * Create a shallow clone of this list.
   * @returns A new ExtValueList pointing to the same head.
   */
  clone(): ExtValueList<V>;

  /**
   * Create an empty list with the same options.
   * @param head - Optional initial head node.
   * @returns A new ExtValueList.
   */
  make(head?: ValueNode<V> | null): ExtValueList<V>;

  /**
   * Create a list from values with the same options.
   * @param values - Iterable of values.
   * @returns A new ExtValueList.
   */
  makeFrom(values: Iterable<V>): ExtValueList<V>;

  /**
   * Build an ExtValueList from an iterable.
   * @param values - Iterable of values.
   * @param options - Link property names.
   * @returns A new ExtValueList.
   */
  static from<V = unknown>(values: Iterable<V>, options?: DllOptions): ExtValueList<V>;

  /** The Ptr class associated with this list type. */
  static Ptr: typeof Ptr;

  /** The ValueNode class used by this list type. */
  static ValueNode: typeof ValueNode;
}

export {ValueNode};
export default ExtValueList;
