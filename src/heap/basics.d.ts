/** Options for configuring heap ordering. */
export interface HeapOptions<T = unknown> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less?: (a: T, b: T) => boolean;
  /** Returns `true` if `a` and `b` are considered equal. */
  equal?: (a: T, b: T) => boolean;
  /** Comparison function returning negative, zero, or positive. Overrides `less`/`equal` when set. */
  compare?: ((a: T, b: T) => number) | null;
}

/** Abstract base class for heap implementations. */
export class HeapBase<T = unknown> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less: (a: T, b: T) => boolean;
  /** Returns `true` if `a` and `b` are considered equal. */
  equal: (a: T, b: T) => boolean;
  /** Comparison function, or `null` if using `less`/`equal`. */
  compare: ((a: T, b: T) => number) | null;

  /** @param options - Ordering functions. */
  constructor(options?: HeapOptions<T>);

  /** Whether the heap has no elements. */
  get isEmpty(): boolean;

  /** The minimum element without removing it. */
  get top(): T | undefined;

  /**
   * Alias for {@link top}.
   * @returns The minimum element, or `undefined` if empty.
   */
  peek(): T | undefined;

  /**
   * Remove and return the minimum element.
   * @returns The minimum element, or `undefined` if empty.
   */
  pop(): T | undefined;

  /**
   * Insert a value into the heap.
   * @param value - Value to insert.
   * @returns `this` for chaining.
   */
  push(value: T): this;

  /**
   * Remove all elements.
   * @returns `this` for chaining.
   */
  clear(): this;

  /**
   * Push a value then immediately pop the minimum.
   * @param value - Value to push.
   * @returns The minimum element after the push.
   */
  pushPop(value: T): T;

  /**
   * Pop the minimum then push a new value.
   * @param value - Value to push after popping.
   * @returns The old minimum element.
   */
  replaceTop(value: T): T | undefined;

  /**
   * Merge other heaps or iterables into this heap.
   * @param args - Heaps or iterables to merge.
   * @returns `this` for chaining.
   */
  merge(...args: Array<HeapBase<T> | Iterable<T>>): this;

  /**
   * Create a deep copy of this heap.
   * @returns A new heap with the same elements.
   */
  clone(): HeapBase<T>;

  /**
   * Create a new empty heap with the same options.
   * @param args - Additional constructor arguments.
   * @returns A new heap.
   */
  make(...args: any[]): HeapBase<T>;

  /** Default ordering functions. */
  static defaults: HeapOptions;
}

export default HeapBase;
