/** Options for configuring an indexed heap. */
export interface IndexedHeapOptions<T extends object = object> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less?: (a: T, b: T) => boolean;
  /** Equality function (unused by the heap itself; kept for family compatibility). */
  equal?: (a: T, b: T) => boolean;
  /** Comparison function returning negative, zero, or positive. Overrides `less` when set. */
  compare?: ((a: T, b: T) => number) | null;
  /** Property name (or symbol) used to store the heap index on elements (default `'heapIndex'`). Different names allow the same object in multiple heaps. */
  indexName?: string | symbol;
}

/**
 * Array-based binary min-heap that stores each element's position on the element
 * itself under a configurable property name — the intrusive-links technique applied
 * to heaps. This buys O(1) `has`/`findIndex` and O(log n) `remove`/`update`/`replace`
 * by handle (no scans), making it a priority queue with efficient reschedule/cancel.
 *
 * Elements must be objects: the heap writes the index property on them (`-1` when
 * an element leaves the heap). Use distinct `indexName`s to keep the same object
 * in several heaps at once. There is no `clone()` — two heaps cannot share elements
 * under one index name.
 */
export class IndexedHeap<T extends object = object> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less: (a: T, b: T) => boolean;
  /** Equality function (unused by the heap itself). */
  equal: (a: T, b: T) => boolean;
  /** Comparison function, or `null` if using `less`. */
  compare: ((a: T, b: T) => number) | null;
  /** Property name (or symbol) storing the heap index on elements. */
  indexName: string | symbol;
  /** The underlying array (a valid binary heap). */
  array: T[];

  /**
   * @param options - Ordering functions and the index property name.
   * @param args - Heaps, arrays, or iterables to merge in (heaps are drained).
   */
  constructor(options?: IndexedHeapOptions<T>, ...args: (IndexedHeap<T> | Iterable<T>)[]);

  /** Number of elements. */
  get length(): number;

  /** Number of elements. An alias of `length`. */
  get size(): number;

  /** Whether the heap has no elements. */
  get isEmpty(): boolean;

  /** The minimum element, or `undefined` if empty. */
  get top(): T | undefined;

  /** The minimum element, or `undefined` if empty. An alias of `top`. */
  peek(): T | undefined;

  /**
   * Find the element's position in O(1) by reading its index property.
   * @param value - Element to locate.
   * @returns The index, or `-1` if the element is not in this heap.
   */
  findIndex(value: T): number;

  /**
   * Check if an element is in this heap. O(1).
   * @param value - Element to check.
   * @returns `true` if present.
   */
  has(value: T): boolean;

  /**
   * Add an element. O(log n).
   * @param value - Element to add.
   * @returns `this` for chaining.
   */
  push(value: T): this;

  /**
   * Remove and return the minimum element. O(log n).
   * @returns The removed element, or `undefined` if empty.
   */
  pop(): T | undefined;

  /**
   * Push, then pop — optimized single sift.
   * @param value - Element to push.
   * @returns The minimum of the operation.
   */
  pushPop(value: T): T;

  /**
   * Replace the minimum with a new element, re-heapify.
   * @param value - Replacement element.
   * @returns The previous minimum, or `undefined` if the heap was empty.
   */
  replaceTop(value: T): T | undefined;

  /**
   * Restore the heap property for the element at `index`, sifting in whichever
   * direction is needed.
   * @param index - Position to re-sift.
   * @returns `this` for chaining.
   */
  siftFrom(index: number): this;

  /**
   * Re-heapify after mutating an element's priority. O(log n), no scan.
   * @param value - The mutated element (located by its index property).
   * @param isDecreased - Pass `true` if the priority moved toward the top,
   * `false` toward the bottom; omit to detect the direction automatically.
   * @returns `this` for chaining.
   */
  update(value: T, isDecreased?: boolean): this;

  /**
   * Re-heapify after mutating the top element.
   * @returns `this` for chaining.
   */
  updateTop(): this;

  /**
   * Remove an element by handle. O(log n), no scan.
   * @param value - Element to remove (located by its index property).
   * @returns `this` for chaining.
   */
  remove(value: T): this;

  /**
   * Remove the element at an index.
   * @param index - Position to remove; out-of-range is ignored.
   * @returns `this` for chaining.
   */
  removeByIndex(index: number): this;

  /**
   * Replace an element with another, re-heapify. O(log n), no scan.
   * @param value - Element to replace (located by its index property).
   * @param newValue - Replacement element.
   * @returns `this` for chaining.
   */
  replace(value: T, newValue: T): this;

  /**
   * Replace the element at an index, re-heapify.
   * @param index - Position to replace; out-of-range is ignored.
   * @param newValue - Replacement element.
   * @returns `this` for chaining.
   */
  replaceByIndex(index: number, newValue: T): this;

  /**
   * Merge heaps, arrays, or iterables into this heap, then rebuild in O(n).
   * Heap arguments are drained (an element tracks one position per index name).
   * The concatenation transiently duplicates the combined storage — O(n + k)
   * peak auxiliary space.
   * @param args - Sources to merge.
   * @returns `this` for chaining.
   */
  merge(...args: (IndexedHeap<T> | Iterable<T>)[]): this;

  /**
   * Heapify the underlying array in place and restamp all indices. O(n).
   * @returns `this` for chaining.
   */
  build(): this;

  /**
   * Remove all elements.
   * @returns `this` for chaining.
   */
  clear(): this;

  /**
   * Heap-sort the underlying array in place (reverse `less` order, matching
   * `MinHeap.releaseSorted`), detach and return it; the heap becomes empty and
   * all indices are reset.
   * @returns The sorted array.
   */
  releaseSorted(): T[];

  /**
   * Create a new heap of the same shape.
   * @param args - Sources to merge into the new heap.
   * @returns A new IndexedHeap with this heap's options.
   */
  make(...args: (IndexedHeap<T> | Iterable<T>)[]): IndexedHeap<T>;

  /**
   * Build an IndexedHeap from an iterable in O(n). A passed array is adopted.
   * @param values - Elements to heapify.
   * @param options - Ordering functions and the index property name.
   * @returns A new IndexedHeap.
   */
  static from<T extends object = object>(values: Iterable<T>, options?: IndexedHeapOptions<T>): IndexedHeap<T>;

  /** Default options used when `options` are omitted. */
  static defaults: IndexedHeapOptions;
}

export default IndexedHeap;
