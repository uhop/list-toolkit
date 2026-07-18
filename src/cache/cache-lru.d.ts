/** Options for configuring a cache. */
export interface CacheOptions {
  /** Maximum number of entries (default 10). */
  capacity?: number;
}

/** LRU (Least Recently Used) cache backed by a doubly linked value list and a Map. */
export class CacheLRU<K = unknown, V = unknown> {
  /** Maximum number of entries. */
  capacity: number;

  /**
   * @param capacity - Maximum number of entries (default 10), or an options object.
   */
  constructor(capacity?: number | CacheOptions);

  /** Whether the cache has no entries. */
  get isEmpty(): boolean;

  /** Number of entries currently stored. */
  get size(): number;

  /**
   * Check whether a key exists in the cache.
   * @param key - Key to look up.
   * @returns `true` if the key is present.
   */
  has(key: K): boolean;

  /**
   * Look up a value by key, promoting it as most recently used.
   * @param key - Key to look up.
   * @returns The value, or `undefined` if not found.
   */
  find(key: K): V | undefined;

  /** Alias for {@link find}. */
  get(key: K): V | undefined;

  /**
   * Look up a value by key **without side effects** — no recency promotion, no
   * frequency counting, no reference bit (works across all cache policies).
   * @param key - Key to look up.
   * @returns The value, or `undefined` if not found.
   */
  peek(key: K): V | undefined;

  /**
   * Remove an entry by key.
   * @param key - Key to remove.
   * @returns `this` for chaining.
   */
  remove(key: K): this;

  /** Alias for {@link remove}. */
  delete(key: K): this;

  /**
   * Add or update an entry. Evicts the least recently used entry if at capacity.
   * @param key - Key to register.
   * @param value - Value to associate.
   * @returns `this` for chaining.
   */
  register(key: K, value: V): this;

  /** Alias for {@link register}. */
  add(key: K, value: V): this;

  /** Alias for {@link register}. */
  set(key: K, value: V): this;

  /**
   * Evict one entry according to the cache's policy.
   * @returns `this` for chaining.
   */
  evict(): this;

  /**
   * Change the capacity, evicting entries (per the cache's policy) until the cache fits.
   * @param capacity - New maximum number of entries (clamped to ≥ 1).
   * @returns `this` for chaining.
   */
  setCapacity(capacity: number): this;

  /**
   * Remove all entries.
   * @returns `this` for chaining.
   */
  clear(): this;

  /** Iterate over `{key, value}` entry objects from most to least recently used. */
  [Symbol.iterator](): IterableIterator<{key: K; value: V}>;

  /**
   * Iterate over `{key, value}` entry objects from least to most recently used.
   * @returns An iterable iterator.
   */
  getReverseIterator(): IterableIterator<{key: K; value: V}>;
}

export default CacheLRU;
