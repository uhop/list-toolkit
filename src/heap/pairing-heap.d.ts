/** Options for configuring a pairing heap. */
export interface PairingHeapOptions<T = unknown> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less?: (a: T, b: T) => boolean;
  /** Comparison function returning negative, zero, or positive. Overrides `less` when set. */
  compare?: ((a: T, b: T) => number) | null;
}

/**
 * Node of a {@link PairingHeap} — the handle returned by `push()`. Keep it to
 * update or remove the element later. `value` is public: mutate it, then call
 * `update(node, isDecreased?)` to restore the heap.
 */
export class PairingHeapNode<T = unknown> {
  /** The stored value. */
  value: T;
  /** Leftmost child, or `null`. */
  child: PairingHeapNode<T> | null;
  /** Next sibling, or `null`. */
  sibling: PairingHeapNode<T> | null;
  /** Previous sibling, or the parent for a leftmost child; `null` for the root. */
  prev: PairingHeapNode<T> | null;

  /** @param value - Value to store. */
  constructor(value: T);
}

/**
 * Node-based merge heap with the best practical profile of the merge-heap family:
 * O(1) `push` and `merge`, O(log n) amortized `pop`, and — the reason it exists —
 * decrease-key by node handle: `push()` returns the node, and `update(node, true)`
 * restores the heap in O(1) amortized after the value got smaller.
 *
 * Handles are owned by the heap that returned them (like list `Ptr`s): passing a
 * node from another heap, or one already popped, is undefined behavior — there is
 * no membership validation. Use `IndexedHeap` when honest O(1) membership checks
 * are needed.
 */
export class PairingHeap<T = unknown> {
  /** Returns `true` if `a` should be ordered before `b`. */
  less: (a: T, b: T) => boolean;
  /** Comparison function, or `null` if using `less`. */
  compare: ((a: T, b: T) => number) | null;
  /** Root node, or `null` if empty. */
  root: PairingHeapNode<T> | null;
  /** Number of elements. */
  size: number;

  /**
   * @param options - Ordering functions.
   * @param args - Heaps (drained in O(1) each) or iterables of values to merge in.
   */
  constructor(options?: PairingHeapOptions<T>, ...args: (PairingHeap<T> | Iterable<T>)[]);

  /** Whether the heap has no elements. */
  get isEmpty(): boolean;

  /** Number of elements. An alias of `size`. */
  get length(): number;

  /** The minimum value, or `undefined` if empty. */
  get top(): T | undefined;

  /** The minimum value, or `undefined` if empty. An alias of `top`. */
  peek(): T | undefined;

  /**
   * Add a value. O(1).
   * @param value - Value to add.
   * @returns The new node — keep it as a handle for `update()`/`remove()`.
   */
  push(value: T): PairingHeapNode<T>;

  /**
   * Remove and return the minimum value. O(log n) amortized. The two-pass pairing
   * transiently allocates an array proportional to the removed root's child count —
   * worst O(n) peak auxiliary space for a single call.
   * @returns The removed value, or `undefined` if empty.
   */
  pop(): T | undefined;

  /**
   * Push, then pop — optimized (returns `value` immediately when it is the minimum).
   * @param value - Value to push.
   * @returns The minimum of the operation.
   */
  pushPop(value: T): T;

  /**
   * Pop, then push — replace the minimum.
   * @param value - Replacement value.
   * @returns The previous minimum, or `undefined` if the heap was empty.
   */
  replaceTop(value: T): T | undefined;

  /**
   * Restore the heap after mutating a node's value. Pass `isDecreased = true` when
   * the value got smaller (the classic decrease-key — O(1) amortized: cut + meld);
   * omit it or pass `false` for the general case (O(log n) amortized; the general
   * path re-pairs the node's children — same transient pairing array as `pop`).
   * @param node - Handle returned by `push()`.
   * @param isDecreased - `true` if the value moved toward the top.
   * @returns `this` for chaining.
   */
  update(node: PairingHeapNode<T>, isDecreased?: boolean): this;

  /**
   * Remove an element by handle. O(log n) amortized (re-pairs the node's children —
   * same transient pairing array as `pop`).
   * @param node - Handle returned by `push()`.
   * @returns `this` for chaining.
   */
  remove(node: PairingHeapNode<T>): this;

  /**
   * Remove all elements. Outstanding handles become invalid.
   * @returns `this` for chaining.
   */
  clear(): this;

  /**
   * Merge heaps and/or iterables of values into this heap. Heap arguments are
   * melded in O(1) each and drained; iterables are pushed value by value.
   * @param args - Sources to merge.
   * @returns `this` for chaining.
   */
  merge(...args: (PairingHeap<T> | Iterable<T>)[]): this;

  /**
   * Create a deep copy (new nodes; old handles keep belonging to the original).
   * @returns A new PairingHeap.
   */
  clone(): PairingHeap<T>;

  /**
   * Create a new heap of the same shape.
   * @param args - Sources to merge into the new heap.
   * @returns A new PairingHeap with this heap's options.
   */
  make(...args: (PairingHeap<T> | Iterable<T>)[]): PairingHeap<T>;

  /**
   * Build a PairingHeap from an iterable (O(k) — pushes are O(1)).
   * @param values - Values to add.
   * @param options - Ordering functions.
   * @returns A new PairingHeap.
   */
  static from<T = unknown>(values: Iterable<T>, options?: PairingHeapOptions<T>): PairingHeap<T>;
}

export default PairingHeap;
