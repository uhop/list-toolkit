/** Options for configuring an unrolled list. */
export interface UnrolledListOptions {
  /** Number of value slots per chunk (default 64). */
  chunkSize?: number;
}

/** Internal chunk node: a mini two-ended array on a doubly linked chain. */
export interface UnrolledListChunk<V = unknown> {
  /** Value slots (length = `chunkSize`). */
  values: (V | undefined)[];
  /** Index of the first occupied slot. */
  start: number;
  /** Number of occupied slots. */
  count: number;
  /** Next chunk, or `null`. */
  next: UnrolledListChunk<V> | null;
  /** Previous chunk, or `null`. */
  prev: UnrolledListChunk<V> | null;
}

/**
 * Unrolled value list: values are stored in chunked arrays strung on a doubly
 * linked chain — one allocation per `chunkSize` values instead of one per value,
 * with chunk-contiguous memory for fast iteration. Values never move once placed:
 * unlike an array or ring buffer there are no growth copies, and unlike a plain
 * value list there is no per-value node overhead.
 *
 * Front/back operations and iteration only (plus O(n/chunkSize) `at()`): the
 * pipeline container. For mid-sequence surgery or stable node identity use the
 * regular lists; for bounded keep-last-N semantics use `RingBuffer`.
 */
export class UnrolledList<V = unknown> {
  /** Value slots per chunk. */
  chunkSize: number;
  /** First chunk, or `null` when empty. */
  head: UnrolledListChunk<V> | null;
  /** Last chunk, or `null` when empty. */
  tail: UnrolledListChunk<V> | null;
  /** Number of values. */
  size: number;

  /** @param options - Chunk geometry. */
  constructor(options?: UnrolledListOptions);

  /** Whether the list has no values. */
  get isEmpty(): boolean;

  /** The first value, or `undefined` if empty. */
  get front(): V | undefined;

  /** The last value, or `undefined` if empty. */
  get back(): V | undefined;

  /** The first value, or `undefined` if empty. */
  peekFront(): V | undefined;

  /** The last value, or `undefined` if empty. */
  peekBack(): V | undefined;

  /**
   * Random access by position in O(n / chunkSize), walking from the nearer end.
   * Negative indices count from the back (like `Array.prototype.at`).
   * @param index - Position from the front (or the back when negative).
   * @returns The value, or `undefined` when out of range.
   */
  at(index: number): V | undefined;

  /**
   * Add a value to the front. Amortized O(1).
   * @param value - Value to add.
   * @returns `this` for chaining.
   */
  pushFront(value: V): this;

  /** Alias for {@link pushFront}. */
  unshift(value: V): this;

  /** Alias for {@link pushFront}. */
  addFront(value: V): this;

  /**
   * Add a value to the back. Amortized O(1).
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
   * Remove and return the front value. O(1).
   * @returns The front value, or `undefined` if empty.
   */
  popFront(): V | undefined;

  /** Alias for {@link popFront}. */
  shift(): V | undefined;

  /** Alias for {@link popFront}. */
  removeFront(): V | undefined;

  /**
   * Remove and return the back value. O(1).
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
   * Remove all values.
   * @returns `this` for chaining.
   */
  clear(): this;

  /** Iterate over values from front to back. */
  [Symbol.iterator](): IterableIterator<V>;

  /**
   * Iterate over values from back to front.
   * @returns An iterable of values.
   */
  getReverseIterator(): Iterable<V>;

  /**
   * Build an UnrolledList from an iterable.
   * @param values - Values to add at the back.
   * @param options - Chunk geometry.
   * @returns A new UnrolledList.
   */
  static from<V = unknown>(values: Iterable<V>, options?: UnrolledListOptions): UnrolledList<V>;
}

export default UnrolledList;
