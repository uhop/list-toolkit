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

  /**
   * Peek at the front element.
   * @returns The front value, or `undefined` if empty.
   */
  peek(): V | undefined;

  /**
   * Add a value to the back of the queue.
   * @param value - Value to enqueue.
   * @returns `this` for chaining.
   */
  add(value: V): this;

  /**
   * Alias for {@link add}.
   * @param value - Value to enqueue.
   * @returns `this` for chaining.
   */
  push(value: V): this;

  /**
   * Alias for {@link add}.
   * @param value - Value to enqueue.
   * @returns `this` for chaining.
   */
  pushBack(value: V): this;

  /**
   * Alias for {@link add}.
   * @param value - Value to enqueue.
   * @returns `this` for chaining.
   */
  enqueue(value: V): this;

  /**
   * Remove and return the front value.
   * @returns The front value, or `undefined` if empty.
   */
  remove(): V | undefined;

  /**
   * Alias for {@link remove}.
   * @returns The front value, or `undefined` if empty.
   */
  pop(): V | undefined;

  /**
   * Alias for {@link remove}.
   * @returns The front value, or `undefined` if empty.
   */
  popFront(): V | undefined;

  /**
   * Alias for {@link remove}.
   * @returns The front value, or `undefined` if empty.
   */
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
   * Iterate over values from back to front.
   * @returns An iterable iterator.
   */
  getReverseIterator(): IterableIterator<V>;
}

export default Queue;
