/** Options for configuring a skip list. */
export interface SkipListOptions<T = unknown> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less?: (a: T, b: T) => boolean;
  /** Comparison function returning negative, zero, or positive. Overrides `less` when set. */
  compare?: ((a: T, b: T) => number) | null;
  /** Probability of promoting a node one level up (default 0.5). */
  p?: number;
  /** Maximum tower height (default 32). */
  maxLevel?: number;
  /** Random source returning numbers in `[0, 1)` (default `Math.random`). Inject for deterministic behavior. */
  random?: () => number;
}

/** Value range for bounded iteration. Both bounds are inclusive and optional. */
export interface SkipListRange<T = unknown> {
  /** Start value (inclusive). */
  from?: T;
  /** End value (inclusive). */
  to?: T;
}

/** Node used internally by {@link SkipList}. */
export class SkipListNode<T = unknown> {
  /** The stored value. */
  value: T;
  /** Forward pointers, one per level; index 0 is the bottom lane. */
  next: (SkipListNode<T> | null)[];
  /** Previous node on the bottom lane, or `null` for the first node. */
  prev: SkipListNode<T> | null;

  /**
   * @param value - Value to store.
   * @param level - Tower height.
   */
  constructor(value: T, level: number);

  /** Tower height of this node. */
  get level(): number;
}

/**
 * Probabilistic ordered container: layered singly linked lists with a doubly linked
 * bottom lane. Expected O(log n) search/insert/remove with high probability; ordered,
 * reverse, and bounded-range iteration. Reads do not mutate the structure.
 */
export class SkipList<T = unknown> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less: (a: T, b: T) => boolean;
  /** Comparison function, or `null` if using `less`. */
  compare: ((a: T, b: T) => number) | null;
  /** Probability of promoting a node one level up. */
  p: number;
  /** Maximum tower height. */
  maxLevel: number;
  /** Random source in `[0, 1)`. */
  random: () => number;
  /** Head sentinel; its `next` array is the current tower of lanes. */
  head: SkipListNode<T>;
  /** Last node on the bottom lane, or `null` if empty. */
  last: SkipListNode<T> | null;
  /** Number of elements. */
  size: number;

  /** @param options - Ordering and randomization options. */
  constructor(options?: SkipListOptions<T>);

  /** Whether the list has no elements. */
  get isEmpty(): boolean;

  /** Number of elements. An alias of `size`. */
  get length(): number;

  /**
   * The node with the minimum value.
   * @returns The first node, or `null` if empty. O(1).
   */
  getMin(): SkipListNode<T> | null;

  /**
   * The node with the maximum value.
   * @returns The last node, or `null` if empty. O(1).
   */
  getMax(): SkipListNode<T> | null;

  /**
   * Generate a random tower height in `[1, maxLevel]`.
   * @returns The height drawn from a geometric distribution with parameter `p`.
   */
  randomLevel(): number;

  /**
   * Collect the rightmost node strictly less than `value` on every lane.
   * @param value - Search value.
   * @returns Predecessor nodes, one per lane (the head sentinel where none).
   */
  findPrevs(value: T): SkipListNode<T>[];

  /**
   * Find a node by value.
   * @param value - Value to search for.
   * @returns The matching node, or `null` if not found.
   */
  find(value: T): SkipListNode<T> | null;

  /**
   * Check if a value is present.
   * @param value - Value to search for.
   * @returns `true` if found.
   */
  has(value: T): boolean;

  /**
   * Find the node with the greatest value ≤ `value`.
   * @param value - Upper bound (inclusive).
   * @returns The floor node, or `null` if all values are greater.
   */
  floor(value: T): SkipListNode<T> | null;

  /**
   * Find the node with the smallest value ≥ `value`.
   * @param value - Lower bound (inclusive).
   * @returns The ceiling node, or `null` if all values are smaller.
   */
  ceil(value: T): SkipListNode<T> | null;

  /**
   * Insert a value. Duplicates are ignored.
   * @param value - Value to insert.
   * @returns `this` for chaining.
   */
  insert(value: T): this;

  /**
   * Remove a value. Missing values are ignored.
   * @param value - Value to remove.
   * @returns `this` for chaining.
   */
  remove(value: T): this;

  /**
   * Remove and return the minimum value.
   * @returns The removed value, or `undefined` if empty.
   */
  popFront(): T | undefined;

  /**
   * Drop empty lanes from the head tower.
   * @returns `this` for chaining.
   */
  trimHead(): this;

  /**
   * Remove all elements.
   * @returns `this` for chaining.
   */
  clear(): this;

  /** Iterate over values in ascending order. */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Iterate over values in ascending order within an inclusive value range.
   * @param range - Optional `{from, to}` value bounds.
   * @returns An iterable of values.
   */
  getIterator(range?: SkipListRange<T>): Iterable<T>;

  /**
   * Iterate over nodes in ascending order within an inclusive value range.
   * @param range - Optional `{from, to}` value bounds.
   * @returns An iterable of nodes.
   */
  getNodeIterator(range?: SkipListRange<T>): Iterable<SkipListNode<T>>;

  /**
   * Iterate over values in descending order.
   * @returns An iterable of values.
   */
  getReverseIterator(): Iterable<T>;

  /**
   * Build a SkipList from an iterable.
   * @param values - Iterable of values to insert.
   * @param options - Ordering and randomization options.
   * @returns A new SkipList.
   */
  static from<T = unknown>(values: Iterable<T>, options?: SkipListOptions<T>): SkipList<T>;

  /** Default options used when `options` are omitted. */
  static defaults: SkipListOptions;
}

export default SkipList;
