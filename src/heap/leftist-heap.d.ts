import HeapBase, {HeapOptions} from './basics.js';

/** Node used internally by {@link LeftistHeap}. */
export class LeftistHeapNode<T = unknown> {
  /** The stored value. */
  value: T;
  /** Left child, or `null`. */
  left: LeftistHeapNode<T> | null;
  /** Right child, or `null`. */
  right: LeftistHeapNode<T> | null;
  /** S-value (rank) of this node. */
  s: number;

  /** @param value - Value to store. */
  constructor(value: T);

  /** Reset children to `null` and s-value to 1. */
  clear(): void;

  /**
   * Create a deep copy of this subtree.
   * @returns A new LeftistHeapNode tree.
   */
  clone(): LeftistHeapNode<T>;
}

/** Merge-based leftist heap. */
export class LeftistHeap<T = unknown> extends HeapBase<T> {
  /** Root node, or `null` if empty. */
  root: LeftistHeapNode<T> | null;
  /** Number of elements. */
  size: number;

  /**
   * @param options - Ordering functions.
   * @param args - Initial heaps to merge.
   */
  constructor(options?: HeapOptions<T>, ...args: LeftistHeap<T>[]);

  /** Whether the heap has no elements. */
  get isEmpty(): boolean;

  /** Number of elements. */
  get length(): number;

  /** The minimum element without removing it. */
  get top(): T | undefined;

  /** Alias for {@link top}. */
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
   * Merge other leftist heaps into this one, consuming them.
   * @param args - Heaps to merge (they are cleared).
   * @returns `this` for chaining.
   */
  merge(...args: LeftistHeap<T>[]): this;

  /**
   * Create a deep copy of this heap.
   * @returns A new LeftistHeap with the same elements.
   */
  clone(): LeftistHeap<T>;

  /**
   * Build a LeftistHeap from an iterable.
   * @param array - Iterable of values.
   * @param options - Ordering functions.
   * @returns A new LeftistHeap.
   */
  static from<T = unknown>(array: Iterable<T>, options?: HeapOptions<T>): LeftistHeap<T>;
}

export default LeftistHeap;
