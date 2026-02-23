import HeapBase, {HeapOptions} from './basics.js';

/** Node used internally by {@link SkewHeap}. */
export class SkewHeapNode<T = unknown> {
  /** The stored value. */
  value: T;
  /** Left child, or `null`. */
  left: SkewHeapNode<T> | null;
  /** Right child, or `null`. */
  right: SkewHeapNode<T> | null;

  /** @param value - Value to store. */
  constructor(value: T);

  /** Reset children to `null`. */
  clear(): void;

  /**
   * Create a deep copy of this subtree.
   * @returns A new SkewHeapNode tree.
   */
  clone(): SkewHeapNode<T>;
}

/** Merge-based skew heap. */
export class SkewHeap<T = unknown> extends HeapBase<T> {
  /** Root node, or `null` if empty. */
  root: SkewHeapNode<T> | null;
  /** Number of elements. */
  size: number;

  /**
   * @param options - Ordering functions.
   * @param args - Initial heaps to merge.
   */
  constructor(options?: HeapOptions<T>, ...args: SkewHeap<T>[]);

  /** Whether the heap has no elements. */
  get isEmpty(): boolean;

  /** Number of elements. */
  get length(): number;

  /** The minimum element without removing it. */
  get top(): T | undefined;

  /**
   * Alias for {@link top}.
   * @returns The minimum element, or `undefined` if empty.
   */
  peek(): T | undefined;

  /**
   * Insert a value into the heap.
   * @param value - Value to insert.
   * @returns `this` for chaining.
   */
  push(value: T): this;

  /**
   * Remove and return the minimum element.
   * @returns The minimum element, or `undefined` if empty.
   */
  pop(): T | undefined;

  /**
   * Push a value then immediately pop the minimum.
   * @param value - Value to push.
   * @returns The minimum element after the push.
   */
  pushPop(value: T): T;

  /**
   * Pop the minimum then push a new value.
   * @param value - Value to push after popping.
   * @returns The old minimum element, or `undefined` if was empty.
   */
  replaceTop(value: T): T | undefined;

  /**
   * Remove all elements.
   * @returns `this` for chaining.
   */
  clear(): this;

  /**
   * Merge other skew heaps into this one, consuming them.
   * @param args - Heaps to merge (they are cleared).
   * @returns `this` for chaining.
   */
  merge(...args: SkewHeap<T>[]): this;

  /**
   * Create a deep copy of this heap.
   * @returns A new SkewHeap with the same elements.
   */
  clone(): SkewHeap<T>;

  /**
   * Build a SkewHeap from an iterable.
   * @param array - Iterable of values.
   * @param options - Ordering functions.
   * @returns A new SkewHeap.
   */
  static from<T = unknown>(array: Iterable<T>, options?: HeapOptions<T>): SkewHeap<T>;
}

export default SkewHeap;
