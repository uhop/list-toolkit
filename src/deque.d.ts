/** Double-ended queue backed by a value list (DLL-based: both ends must be O(1)). */
export class Deque<V = unknown> {
  /** Number of elements in the deque. */
  size: number;

  /**
   * @param underlyingList - A pre-existing value list to adopt, or a list class to instantiate.
   */
  constructor(underlyingList?: object | (new () => object));

  /** Whether the deque has no elements. */
  get isEmpty(): boolean;

  /** The front element without removing it, or `undefined` if empty. */
  get front(): V | undefined;

  /** The back element without removing it, or `undefined` if empty. */
  get back(): V | undefined;

  /** The front element without removing it, or `undefined` if empty. */
  peekFront(): V | undefined;

  /** The back element without removing it, or `undefined` if empty. */
  peekBack(): V | undefined;

  /**
   * Add a value to the front.
   * @param value - Value to add.
   * @returns `this` for chaining.
   */
  pushFront(value: V): this;

  /** Alias for {@link pushFront}. */
  unshift(value: V): this;

  /** Alias for {@link pushFront}. */
  addFront(value: V): this;

  /**
   * Add a value to the back.
   * @param value - Value to add.
   * @returns `this` for chaining.
   */
  pushBack(value: V): this;

  /** Alias for {@link pushBack}. */
  push(value: V): this;

  /** Alias for {@link pushBack}. */
  add(value: V): this;

  /** Alias for {@link pushBack}. */
  addBack(value: V): this;

  /**
   * Remove and return the front value.
   * @returns The front value, or `undefined` if empty.
   */
  popFront(): V | undefined;

  /** Alias for {@link popFront}. */
  shift(): V | undefined;

  /** Alias for {@link popFront}. */
  removeFront(): V | undefined;

  /**
   * Remove and return the back value.
   * @returns The back value, or `undefined` if empty.
   */
  popBack(): V | undefined;

  /** Alias for {@link popBack}. */
  pop(): V | undefined;

  /** Alias for {@link popBack}. */
  removeBack(): V | undefined;

  /**
   * Add multiple values to the front (in iteration order, so they end up reversed).
   * @param values - Iterable of values.
   * @returns `this` for chaining.
   */
  pushValuesFront(values: Iterable<V>): this;

  /**
   * Add multiple values to the back.
   * @param values - Iterable of values.
   * @returns `this` for chaining.
   */
  pushValuesBack(values: Iterable<V>): this;

  /**
   * Rotate the deque: positive `n` moves `n` elements from the back to the front
   * (Python `deque.rotate` semantics), negative `n` from the front to the back.
   * @param n - Number of positions (default 1).
   * @returns `this` for chaining.
   */
  rotate(n?: number): this;

  /**
   * Remove all elements.
   * @returns `this` for chaining.
   */
  clear(): this;

  /** Iterate over values from front to back. */
  [Symbol.iterator](): IterableIterator<V>;

  /**
   * Iterate over values from back to front.
   * @returns An iterable iterator, or `undefined` when the underlying list does not support reverse iteration.
   */
  getReverseIterator(): IterableIterator<V> | undefined;
}

export default Deque;
