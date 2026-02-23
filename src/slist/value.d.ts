import {HeadNode, ValueNode, PtrBase, SllOptions, SllRange, SllPtrRange} from './nodes.js';
import {Ptr} from './ptr.js';

/**
 * Hosted value-based singly linked list. Wraps values in {@link ValueNode}.
 *
 * Extends `SList` at runtime. Internally nodes are `ValueNode<V>`.
 * The default iterator and `getIterator` yield unwrapped `V` values;
 * use `getNodeIterator` for `ValueNode<V>` nodes.
 */
export class ValueSList<V = unknown> extends HeadNode {
  /** Pointer to the first node. */
  get frontPtr(): Ptr<ValueNode<V>>;

  /** A pointer-based range spanning all nodes, or `null` if empty. */
  get ptrRange(): SllPtrRange<ValueNode<V>> | null;

  /**
   * Create a pointer to a node in this list.
   * @param node - Target node, or `undefined` for the front.
   * @returns A new Ptr.
   */
  makePtr(node?: ValueNode<V>): Ptr<ValueNode<V>>;

  /**
   * Create a pointer to the node after `prev`.
   * @param prev - Preceding node, or `undefined` for the front.
   * @returns A new Ptr.
   */
  makePtrFromPrev(prev?: ValueNode<V>): Ptr<ValueNode<V>>;

  /**
   * Remove and return the front value.
   * @returns The unwrapped value, or `undefined` if empty.
   */
  popFront(): V | undefined;

  /**
   * Alias for {@link popFront}.
   * @returns The unwrapped value, or `undefined` if empty.
   */
  pop(): V | undefined;

  /**
   * Remove and return the front ValueNode.
   * @returns The removed node, or `undefined` if empty.
   */
  popFrontNode(): ValueNode<V> | undefined;

  /**
   * Insert a value at the front.
   * @param value - Raw value, ValueNode, or Ptr.
   * @returns A Ptr to the front.
   */
  pushFront(value: V | ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Alias for {@link pushFront}.
   * @param value - Raw value, ValueNode, or Ptr.
   * @returns A Ptr to the front.
   */
  push(value: V | ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Insert a value at the back.
   * @param value - Raw value, ValueNode, or Ptr.
   * @returns A Ptr to the inserted node.
   */
  pushBack(value: V | ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Insert an existing ValueNode at the front.
   * @param nodeOrPtr - ValueNode or pointer to insert.
   * @returns A Ptr to the front.
   */
  pushFrontNode(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Insert an existing ValueNode at the back.
   * @param nodeOrPtr - ValueNode or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  pushBackNode(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Move all nodes from another list to the front.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the new front.
   */
  appendFront(list: HeadNode): Ptr<ValueNode<V>>;

  /**
   * Move all nodes from another list to the back.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the first appended node.
   */
  appendBack(list: HeadNode): Ptr<ValueNode<V>>;

  /**
   * Alias for {@link appendBack}.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the first appended node.
   */
  append(list: HeadNode): Ptr<ValueNode<V>>;

  /**
   * Move a pointed-to node to the front.
   * @param ptr - Pointer to the node to move.
   * @returns A Ptr to the front, or `this` if at head.
   */
  moveToFront(ptr: PtrBase<ValueNode<V>>): Ptr<ValueNode<V>> | this;

  /**
   * Move a pointed-to node to the back.
   * @param ptr - Pointer to the node to move.
   * @returns A Ptr to the back, or `this` if at head.
   */
  moveToBack(ptr: PtrBase<ValueNode<V>>): Ptr<ValueNode<V>> | this;

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
  removeNode(ptr: PtrBase<ValueNode<V>>): ValueNode<V> | null;

  /**
   * Remove a pointer-based range and optionally drop nodes.
   * @param ptrRange - Range to remove.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns A new ValueSList containing the removed values.
   */
  removeRange(ptrRange?: SllPtrRange<ValueNode<V>>, drop?: boolean): ValueSList<V>;

  /**
   * Extract a pointer-based range into a new list.
   * @param ptrRange - Range to extract (defaults to the whole list).
   * @returns A new ValueSList containing the extracted values.
   */
  extractRange(ptrRange?: SllPtrRange<ValueNode<V>>): ValueSList<V>;

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param condition - Predicate receiving each ValueNode.
   * @returns A new ValueSList containing the extracted values.
   */
  extractBy(condition: (node: ValueNode<V>) => boolean): ValueSList<V>;

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

  /**
   * Detach all nodes as a raw circular list.
   * @returns Head of the raw circular list, or `null` if empty.
   */
  releaseRawList(): ValueNode<V> | null;

  /**
   * Detach all nodes as a null-terminated list.
   * @returns Object with `head` and `tail`, or `null` if empty.
   */
  releaseNTList(): { head: ValueNode<V>; tail: ValueNode<V> } | null;

  /**
   * Validate that a range is reachable within this list.
   * @param range - Range to validate.
   * @returns `true` if the range is valid.
   */
  validateRange(range?: SllRange<ValueNode<V>>): boolean;

  /**
   * Adopt a value, pointer, or ValueNode into this list.
   * @param value - Raw value, Ptr, or ValueNode.
   * @returns A ValueNode ready for insertion.
   */
  adoptValue(value: V | ValueNode<V> | PtrBase<ValueNode<V>>): ValueNode<V>;

  /** Iterate over unwrapped values from front to back. */
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

  /**
   * Alias for {@link getValueIterator}. Yields unwrapped values.
   * @param range - Sub-range to iterate.
   * @returns An iterable iterator of values.
   */
  getIterator(range?: SllRange<ValueNode<V>>): IterableIterator<V>;

  /**
   * Get an iterable of Ptr objects over a pointer range.
   * @param ptrRange - Sub-range to iterate.
   * @returns An iterable iterator of Ptrs.
   */
  getPtrIterator(ptrRange?: SllPtrRange<ValueNode<V>>): IterableIterator<Ptr<ValueNode<V>>>;

  /**
   * Create a shallow clone of this list.
   * @returns A new ValueSList with the same values.
   */
  clone(): ValueSList<V>;

  /**
   * Create an empty list with the same options.
   * @returns A new empty ValueSList.
   */
  make(): ValueSList<V>;

  /**
   * Create a list from values with the same options.
   * @param values - Iterable of values.
   * @returns A new ValueSList.
   */
  makeFrom(values: Iterable<V>): ValueSList<V>;

  /**
   * Build a ValueSList from an iterable.
   * @param values - Iterable of values.
   * @param options - Link property names.
   * @returns A new ValueSList.
   */
  static from<V = unknown>(values: Iterable<V>, options?: SllOptions): ValueSList<V>;

  /** The Ptr class associated with this list type. */
  static Ptr: typeof Ptr;

  /** The ValueNode class used by this list type. */
  static ValueNode: typeof ValueNode;
}

export { ValueNode, Ptr };
export default ValueSList;
