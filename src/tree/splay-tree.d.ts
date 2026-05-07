/** Options for configuring splay tree ordering. */
export interface SplayTreeOptions<T = unknown> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less?: (a: T, b: T) => boolean;
  /** Comparison function returning negative, zero, or positive. Overrides `less` when set. */
  compare?: ((a: T, b: T) => number) | null;
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

/** Self-adjusting binary search tree. */
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
   * Find the node with the minimum value.
   * @returns The minimum node, or `null` if the tree is empty.
   */
  getMin(): SplayTreeNode<T> | null;

  /**
   * Find the node with the maximum value.
   * @returns The maximum node, or `null` if the tree is empty.
   */
  getMax(): SplayTreeNode<T> | null;

  /**
   * Find a node by value.
   * @param value - Value to search for.
   * @returns The matching node, or `null` if not found.
   */
  find(value: T): SplayTreeNode<T> | null;

  /**
   * Find and splay a node to the root.
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
   * Insert a value. If the value already exists, it is splayed to the root.
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

  /** Iterate over values in ascending order. */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Iterate over values in descending order.
   * @returns An iterable iterator.
   */
  getReverseIterator(): IterableIterator<T>;

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
