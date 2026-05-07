/** FIFO queue backed by a value list. */
export class Queue<V = unknown> {
  /** Number of elements in the queue. */
  size: number;

  /**
   * @param underlyingList - Optional pre-existing value list to use.
   */
  constructor(underlyingList?: object);

  /** Whether the queue has no elements. */
  get isEmpty(): boolean;

  /** The front element without removing it, or `undefined` if empty. */
  get top(): V | undefined;

  /** Alias for {@link top}. */
  peek(): V | undefined;

  /**
   * Add a value to the back of the queue.
   * @param value - Value to enqueue.
   * @returns `this` for chaining.
   */
  add(value: V): this;

  /** Alias for {@link add}. */
  push(value: V): this;

  /** Alias for {@link add}. */
  pushBack(value: V): this;

  /** Alias for {@link add}. */
  enqueue(value: V): this;

  /**
   * Remove and return the front value.
   * @returns The front value, or `undefined` if empty.
   */
  remove(): V | undefined;

  /** Alias for {@link remove}. */
  pop(): V | undefined;

  /** Alias for {@link remove}. */
  popFront(): V | undefined;

  /** Alias for {@link remove}. */
  dequeue(): V | undefined;

  /**
   * Add multiple values to the back of the queue.
   * @param values - Iterable of values.
   * @returns `this` for chaining.
   */
  addValues(values: Iterable<V>): this;

  /**
   * Remove all elements.
   * @returns `this` for chaining.
   */
  clear(): this;

  /** Iterate over values from front to back. */
  [Symbol.iterator](): IterableIterator<V>;

  /**
   * Iterate over values from back to front. Delegates to the underlying list's
   * `getReverseIterator` if it has one (DLL-based lists do; SLL-based lists don't),
   * otherwise returns `undefined`.
   * @returns An iterable iterator, or `undefined` when the underlying list does not support reverse iteration.
   */
  getReverseIterator(): IterableIterator<V> | undefined;
}

export default Queue;
