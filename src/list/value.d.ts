import {HeadNode, ValueNode, PtrBase, DllOptions, DllRange} from './nodes.js';
import {Ptr} from './ptr.js';

/**
 * Hosted value-based doubly linked list. Wraps values in {@link ValueNode}.
 *
 * Extends `List` at runtime. Internally nodes are `ValueNode<V>`.
 * The default iterator and `getIterator`/`getReverseIterator` yield
 * unwrapped `V` values; use `getNodeIterator`/`getReverseNodeIterator`
 * for `ValueNode<V>` nodes.
 */
export class ValueList<V = unknown> extends HeadNode {
  /** The first ValueNode after the head. */
  get front(): ValueNode<V>;

  /** The last ValueNode before the head. */
  get back(): ValueNode<V>;

  /** A range spanning all nodes, or `null` if empty. */
  get range(): DllRange<ValueNode<V>> | null;

  /** Pointer to the first node. */
  get frontPtr(): Ptr<ValueNode<V>>;

  /** Pointer to the last node. */
  get backPtr(): Ptr<ValueNode<V>>;

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

  /** Alias for {@link popFront}. */
  pop(): V | undefined;

  /**
   * Remove and return the back value.
   * @returns The unwrapped value, or `undefined` if empty.
   */
  popBack(): V | undefined;

  /**
   * Remove and return the front ValueNode.
   * @returns The removed node, or `undefined` if empty.
   */
  popFrontNode(): ValueNode<V> | undefined;

  /**
   * Remove and return the back ValueNode.
   * @returns The removed node, or `undefined` if empty.
   */
  popBackNode(): ValueNode<V> | undefined;

  /**
   * Insert a value at the front.
   * @param value - Raw value, ValueNode, or Ptr.
   * @returns A Ptr to the inserted node.
   */
  pushFront(value: V | ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /** Alias for {@link pushFront}. */
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
   * @returns A Ptr to the inserted node.
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

  /** Alias for {@link appendBack}. */
  append(list: HeadNode): Ptr<ValueNode<V>>;

  /**
   * Move a node to the front of the list.
   * @param nodeOrPtr - Node or pointer to move.
   * @returns A Ptr to the front.
   */
  moveToFront(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

  /**
   * Move a node to the back of the list.
   * @param nodeOrPtr - Node or pointer to move.
   * @returns A Ptr to the back.
   */
  moveToBack(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): Ptr<ValueNode<V>>;

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
  removeNode(nodeOrPtr: ValueNode<V> | PtrBase<ValueNode<V>>): ValueNode<V>;

  /**
   * Remove a range of nodes and optionally drop them.
   * @param range - Range to remove.
   * @param drop - If `true`, make each removed node stand-alone.
   * @returns A new ValueList containing the removed values.
   */
  removeRange(range?: DllRange<ValueNode<V>>, drop?: boolean): ValueList<V>;

  /**
   * Extract a range of nodes into a new list.
   * @param range - Range to extract (defaults to the whole list).
   * @returns A new ValueList containing the extracted values.
   */
  extractRange(range?: DllRange<ValueNode<V>>): ValueList<V>;

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param condition - Predicate receiving each ValueNode.
   * @returns A new ValueList containing the extracted values.
   */
  extractBy(condition: (node: ValueNode<V>) => boolean): ValueList<V>;

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
   * Detach all nodes as a raw circular list (no sentinel).
   * @returns Head of the raw circular list, or `null` if empty.
   */
  releaseRawList(): ValueNode<V> | null;

  /**
   * Detach all nodes as a null-terminated list.
   * @returns Object with `head` and `tail`, or `null` if empty.
   */
  releaseNTList(): {head: ValueNode<V>; tail: ValueNode<V>} | null;

  /**
   * Validate that a range is reachable within this list.
   * @param range - Range to validate.
   * @returns `true` if the range is valid.
   */
  validateRange(range?: DllRange<ValueNode<V>>): boolean;

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
   * @returns A new ValueList with the same values.
   */
  clone(): ValueList<V>;

  /**
   * Create an empty list with the same options.
   * @returns A new empty ValueList.
   */
  make(): ValueList<V>;

  /**
   * Create a list from values with the same options.
   * @param values - Iterable of values.
   * @returns A new ValueList.
   */
  makeFrom(values: Iterable<V>): ValueList<V>;

  /**
   * Build a ValueList from an iterable.
   * @param values - Iterable of values.
   * @param options - Link property names.
   * @returns A new ValueList.
   */
  static from<V = unknown>(values: Iterable<V>, options?: DllOptions): ValueList<V>;

  /** The Ptr class associated with this list type. */
  static Ptr: typeof Ptr;

  /** The ValueNode class used by this list type. */
  static ValueNode: typeof ValueNode;
}

export {ValueNode, Ptr};
export default ValueList;
