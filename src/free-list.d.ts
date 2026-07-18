/** Options for configuring a free list (object pool). */
export interface FreeListOptions<T extends object = object> {
  /** Factory used by `acquire()` when the pool is empty. Omit for a pure recycler (`acquire()` then returns `undefined` when empty). */
  create?: (() => T) | null;
  /** Hook called on every `release(node)` before pooling — scrub references here so pooled objects don't pin garbage. */
  reset?: ((node: T) => void) | null;
  /** Maximum number of pooled objects; releases beyond it are dropped for GC (default `Infinity`; `0` disables pooling). */
  capacity?: number;
  /** Property name (or symbol) used to thread the free list through pooled objects (default `'next'`). */
  nextName?: string | symbol;
  /** Optional second link property to scrub on `acquire()` — set it when pooling DLL nodes (e.g. `'prev'`), so recycled nodes are adoptable by lists. */
  prevName?: string | symbol | null;
}

/**
 * Free list / object pool: recycles objects by threading dead ones into an
 * intrusive singly linked list through their own link property — the pool itself
 * allocates nothing. Built for recycling list nodes (e.g. `ValueNode`s in hot
 * queues) but works for any object type.
 *
 * Recycled nodes come out of `acquire()` with their link properties nulled, so
 * they are directly adoptable by the toolkit's lists (`pushFrontNode`/`pushBackNode`).
 * Use the `reset` hook to clear payload references at `release()` time — a pooled
 * node holding a value would otherwise pin it for the garbage collector.
 */
export class FreeList<T extends object = object> {
  /** Factory for `acquire()` on an empty pool, or `null`. */
  create: (() => T) | null;
  /** Release hook, or `null`. */
  reset: ((node: T) => void) | null;
  /** Maximum number of pooled objects. */
  capacity: number;
  /** Link property threading the free list. */
  nextName: string | symbol;
  /** Second link property scrubbed on `acquire()`, or `null`. */
  prevName: string | symbol | null;
  /** Top of the free list, or `null` when empty. */
  head: T | null;
  /** Number of pooled objects. */
  size: number;

  /** @param options - Pool configuration. */
  constructor(options?: FreeListOptions<T>);

  /** Whether the pool holds no objects. */
  get isEmpty(): boolean;

  /** Whether the pool reached its capacity. */
  get isFull(): boolean;

  /**
   * Take an object from the pool, or make one with `create()` when empty.
   * Link properties are nulled on the way out.
   * @returns A recycled or fresh object; `undefined` when empty and no `create` was configured.
   */
  acquire(): T | undefined;

  /**
   * Return an object to the pool. Runs `reset` first; drops the object (for GC)
   * when the pool is full. The object must not be inside a list.
   * @param node - Object to recycle.
   * @returns `this` for chaining.
   */
  release(node: T): this;

  /**
   * Fill the pool with up to `count` freshly created objects (no-op without `create`).
   * @param count - Number of objects to add (bounded by `capacity`).
   * @returns `this` for chaining.
   */
  preallocate(count: number): this;

  /**
   * Drop all pooled objects (their threading links are nulled).
   * @returns `this` for chaining.
   */
  clear(): this;

  /** Iterate over the pooled objects. */
  [Symbol.iterator](): IterableIterator<T>;
}

export default FreeList;
