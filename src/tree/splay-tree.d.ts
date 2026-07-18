/** Options for configuring splay tree ordering. */
export interface SplayTreeOptions<T = unknown> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less?: (a: T, b: T) => boolean;
  /** Comparison function returning negative, zero, or positive. Overrides `less` when set. */
  compare?: ((a: T, b: T) => number) | null;
}

/** Value range for bounded iteration. Both bounds are inclusive and optional. */
export interface SplayTreeRange<T = unknown> {
  /** Start value (inclusive). */
  from?: T;
  /** End value (inclusive). */
  to?: T;
}

/** Node used internally by {@link SplayTree}. */
export class SplayTreeNode<T = unknown> {
  /** The stored value. */
  value: T;
  /** Left child, or `null`. */
  left: SplayTreeNode<T> | null;
  /** Right child, or `null`. */
  right: SplayTreeNode<T> | null;
  /** Parent node, or `null` for the root. */
  parent: SplayTreeNode<T> | null;
  /** Subtree size: this node plus all descendants. Maintained by the tree. */
  size: number;

  /** @param value - Value to store. */
  constructor(value: T);

  /**
   * Find the minimum node in this subtree.
   * @returns The leftmost descendant.
   */
  getMin(): SplayTreeNode<T>;

  /**
   * Find the maximum node in this subtree.
   * @returns The rightmost descendant.
   */
  getMax(): SplayTreeNode<T>;
}

/**
 * Self-adjusting binary search tree with subtree-size augmentation (order statistics).
 * Set semantics: duplicates are not stored. Splaying operations (`promote`, `insert`,
 * `remove`, `splitMaxTree`, `join`) restructure the tree and carry the amortized
 * O(log n) bound; read-only lookups (`find`, `has`, `floor`, `ceil`, `at`, `indexOf`,
 * iteration) do not splay — they cost O(depth), which is O(n) on a degenerate shape,
 * and contribute nothing to the amortization. Use `promote` when the access pattern
 * should adapt the tree.
 */
export class SplayTree<T = unknown> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less: (a: T, b: T) => boolean;
  /** Comparison function, or `null` if using `less`. */
  compare: ((a: T, b: T) => number) | null;
  /** Root node, or `null` if empty. */
  root: SplayTreeNode<T> | null;
  /** Number of elements. */
  size: number;

  /** @param options - Ordering functions. */
  constructor(options?: SplayTreeOptions<T>);

  /** Whether the tree has no elements. */
  get isEmpty(): boolean;

  /** Number of elements. */
  get length(): number;

  /**
   * Find the node with the minimum value. Read-only: does not splay.
   * @returns The minimum node, or `null` if the tree is empty.
   */
  getMin(): SplayTreeNode<T> | null;

  /**
   * Find the node with the maximum value. Read-only: does not splay.
   * @returns The maximum node, or `null` if the tree is empty.
   */
  getMax(): SplayTreeNode<T> | null;

  /**
   * Find a node by value. Read-only: does not splay — see {@link promote}
   * for the access that restructures the tree.
   * @param value - Value to search for.
   * @returns The matching node, or `null` if not found.
   */
  find(value: T): SplayTreeNode<T> | null;

  /**
   * Check if a value is present. Read-only: does not splay.
   * @param value - Value to search for.
   * @returns `true` if found.
   */
  has(value: T): boolean;

  /**
   * Find the node with the greatest value ≤ `value`. Read-only: does not splay.
   * @param value - Upper bound (inclusive).
   * @returns The floor node, or `null` if all values are greater.
   */
  floor(value: T): SplayTreeNode<T> | null;

  /**
   * Find the node with the smallest value ≥ `value`. Read-only: does not splay.
   * @param value - Lower bound (inclusive).
   * @returns The ceiling node, or `null` if all values are smaller.
   */
  ceil(value: T): SplayTreeNode<T> | null;

  /**
   * Find the node at a position in sorted order. Negative indices count from the end.
   * Read-only: does not splay.
   * @param index - Zero-based position.
   * @returns The node, or `null` if the index is out of range.
   */
  at(index: number): SplayTreeNode<T> | null;

  /**
   * Find the position of a value in sorted order. Read-only: does not splay.
   * @param value - Value to search for.
   * @returns The zero-based position, or `-1` if not found.
   */
  indexOf(value: T): number;

  /**
   * Find and splay a node to the root. This is the access that maintains
   * the amortized O(log n) bound.
   * @param value - Value to search for and promote.
   * @returns The matching node, or `null` if not found.
   */
  promote(value: T): SplayTreeNode<T> | null;

  /**
   * Splay a given node to the root.
   * @param node - Node to splay.
   * @returns `this` for chaining.
   */
  splay(node: SplayTreeNode<T>): this;

  /**
   * Insert a value. Duplicates are not stored: if the value already exists,
   * its node is splayed to the root and the tree is unchanged.
   * @param value - Value to insert.
   * @returns `this` for chaining.
   */
  insert(value: T): this;

  /**
   * Remove a value from the tree.
   * @param value - Value to remove.
   * @returns `this` for chaining.
   */
  remove(value: T): this;

  /**
   * Remove all elements.
   * @returns `this` for chaining.
   */
  clear(): this;

  /**
   * Split the tree: values ≤ `value` stay, values > `value` go to the returned tree.
   * Amortized O(log n).
   * @param value - Split point.
   * @returns A new SplayTree containing values greater than `value`.
   */
  splitMaxTree(value: T): SplayTree<T>;

  /**
   * Join another tree into this one (unsafe: assumes all values in `tree` are greater).
   * @param tree - Tree to join (cleared after joining).
   * @returns `this` for chaining.
   */
  joinMaxTreeUnsafe(tree: SplayTree<T>): this;

  /**
   * Join another tree into this one. Falls back to individual inserts if ranges overlap.
   * @param tree - Tree to join (cleared after joining).
   * @returns `this` for chaining.
   */
  join(tree: SplayTree<T>): this;

  /** Iterate over values in ascending order. Read-only: does not splay. */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Iterate over values in ascending order within an inclusive value range.
   * Read-only: does not splay.
   * @param range - Optional `{from, to}` value bounds.
   * @returns An iterable of values.
   */
  getIterator(range?: SplayTreeRange<T>): Iterable<T>;

  /**
   * Iterate over nodes in ascending order within an inclusive value range.
   * Read-only: does not splay.
   * @param range - Optional `{from, to}` value bounds.
   * @returns An iterable of nodes.
   */
  getNodeIterator(range?: SplayTreeRange<T>): Iterable<SplayTreeNode<T>>;

  /**
   * Iterate over values in descending order. Read-only: does not splay.
   * @returns An iterable of values.
   */
  getReverseIterator(): Iterable<T>;

  /**
   * Build a SplayTree from an iterable.
   * @param values - Iterable of values to insert.
   * @param options - Ordering functions.
   * @returns A new SplayTree.
   */
  static from<T = unknown>(values: Iterable<T>, options?: SplayTreeOptions<T>): SplayTree<T>;

  /** Default ordering functions. */
  static defaults: SplayTreeOptions;
}

export default SplayTree;
