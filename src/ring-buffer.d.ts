/** Options for configuring a ring buffer. */
export interface RingBufferOptions {
  /** Hard bound: pushing onto a full buffer evicts from the opposite end (keep-last-N semantics). Omit for an unbounded, growable buffer. */
  capacity?: number;
  /** Initial slot allocation hint for the growable mode (default 16; rounded up to a power of two). */
  initialCapacity?: number;
}

/**
 * Array-backed double-ended queue on a circular buffer: contiguous storage,
 * O(1) push/pop/peek at both ends, O(1) random access via `at()`, and no
 * allocation at steady state. Shares the `Deque` API (including the Array-parity
 * aliases `push`/`pop`/`shift`/`unshift`), so the two are drop-in replacements
 * for each other; the list-backed `Deque` keeps stable node identity, the ring
 * buffer wins on throughput and memory locality.
 *
 * With `{capacity}` the buffer is bounded: pushing onto a full buffer evicts the
 * element at the opposite end — a "keep the last N" sliding window.
 */
export class RingBuffer<V = unknown> {
  /** Hard bound, or `Infinity` when growable. */
  capacity: number;
  /** The backing array (a power-of-two ring). */
  array: (V | undefined)[];
  /** Index of the front element in `array`. */
  head: number;
  /** Number of elements. */
  size: number;

  /** @param options - Capacity semantics. */
  constructor(options?: RingBufferOptions);

  /** Whether the buffer has no elements. */
  get isEmpty(): boolean;

  /** Whether the buffer reached its `capacity` (always `false` when growable). */
  get isFull(): boolean;

  /** The front element without removing it, or `undefined` if empty. */
  get front(): V | undefined;

  /** The back element without removing it, or `undefined` if empty. */
  get back(): V | undefined;

  /** The front element without removing it, or `undefined` if empty. */
  peekFront(): V | undefined;

  /** The back element without removing it, or `undefined` if empty. */
  peekBack(): V | undefined;

  /**
   * Random access by position in O(1). Negative indices count from the back
   * (like `Array.prototype.at`).
   * @param index - Position from the front (or from the back when negative).
   * @returns The element, or `undefined` when out of range.
   */
  at(index: number): V | undefined;

  /**
   * Add a value to the front. Evicts the back element when bounded and full.
   * @param value - Value to add.
   * @returns `this` for chaining.
   */
  pushFront(value: V): this;

  /** Alias for {@link pushFront}. */
  unshift(value: V): this;

  /** Alias for {@link pushFront}. */
  addFront(value: V): this;

  /**
   * Add a value to the back. Evicts the front element when bounded and full.
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
   * Rotate: positive `n` moves `n` elements from the back to the front (Python
   * `deque.rotate` semantics), negative from the front to the back. O(1) when the
   * ring is physically full (a head shift), otherwise at most `size / 2` moves.
   * @param n - Number of positions (default 1).
   * @returns `this` for chaining.
   */
  rotate(n?: number): this;

  /**
   * Remove all elements (keeps the current allocation).
   * @returns `this` for chaining.
   */
  clear(): this;

  /**
   * Grow the backing array (doubling). Called automatically; exposed for pre-sizing.
   * Transiently holds both the old and new arrays — O(n) peak auxiliary space
   * during growth.
   * @returns `this` for chaining.
   */
  grow(): this;

  /** Iterate over values from front to back. */
  [Symbol.iterator](): IterableIterator<V>;

  /**
   * Iterate over values from back to front.
   * @returns An iterable of values.
   */
  getReverseIterator(): Iterable<V>;

  /**
   * Build a RingBuffer from an iterable.
   * @param values - Values to add at the back.
   * @param options - Capacity semantics.
   * @returns A new RingBuffer.
   */
  static from<V = unknown>(values: Iterable<V>, options?: RingBufferOptions): RingBuffer<V>;
}

export default RingBuffer;
