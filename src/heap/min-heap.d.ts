import HeapBase, {HeapOptions} from './basics.js';

/** Array-based binary min-heap. */
export class MinHeap<T = unknown> extends HeapBase<T> {
  /** The underlying array storing heap elements. */
  array: T[];

  /**
   * @param options - Ordering functions.
   * @param args - Initial arrays or heaps to merge.
   */
  constructor(options?: HeapOptions<T>, ...args: Array<MinHeap<T> | T[]>);

  /** Number of elements in the heap. */
  get length(): number;

  /** Whether the heap has no elements. */
  get isEmpty(): boolean;

  /** The minimum element without removing it. */
  get top(): T | undefined;

  /** Alias for {@link top}. */
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
  replaceTop(value: T): T;

  /**
   * Check whether a value exists in the heap.
   * @param value - Value to search for.
   * @returns `true` if found.
   */
  has(value: T): boolean;

  /**
   * Find the index of a value in the underlying array.
   * @param value - Value to search for.
   * @returns The index, or `-1` if not found.
   */
  findIndex(value: T): number;

  /**
   * Remove a value from the heap.
   * @param value - Value to remove.
   * @returns `this` for chaining.
   */
  remove(value: T): this;

  /**
   * Remove an element by its array index.
   * @param index - Index to remove.
   * @returns `this` for chaining.
   */
  removeByIndex(index: number): this;

  /**
   * Replace a value with a new one.
   * @param value - Value to find and replace.
   * @param newValue - Replacement value.
   * @returns `this` for chaining.
   */
  replace(value: T, newValue: T): this;

  /**
   * Replace an element at a given index.
   * @param index - Index to replace.
   * @param newValue - Replacement value.
   * @returns `this` for chaining.
   */
  replaceByIndex(index: number, newValue: T): this;

  /**
   * Re-sift the top element downward after an in-place mutation.
   * @returns `this` for chaining.
   */
  updateTop(): this;

  /**
   * Re-sift an element at a given index after an in-place mutation.
   * @param index - Index of the mutated element.
   * @param isDecreased - `true` if the key decreased (sift up), `false` to sift down.
   * @returns `this` for chaining.
   */
  updateByIndex(index: number, isDecreased: boolean): this;

  /**
   * Remove all elements.
   * @returns `this` for chaining.
   */
  clear(): this;

  /**
   * Sort the array in place and release it, leaving the heap empty.
   * @returns The sorted array.
   */
  releaseSorted(): T[];

  /**
   * Merge other heaps or arrays into this heap.
   * @param args - Heaps or arrays to merge.
   * @returns `this` for chaining.
   */
  merge(...args: Array<MinHeap<T> | T[]>): this;

  /**
   * Create a deep copy of this heap.
   * @returns A new MinHeap with the same elements.
   */
  clone(): MinHeap<T>;

  /**
   * Build a heap-ordered array in place.
   * @param array - Array to heapify.
   * @param less - Ordering function.
   * @returns The heapified array.
   */
  static build<T = unknown>(array: T[], less?: (a: T, b: T) => boolean): T[];

  /**
   * Pop the minimum from a heap array.
   * @param heapArray - Heap-ordered array.
   * @param less - Ordering function.
   * @returns The minimum element, or `undefined` if empty.
   */
  static pop<T = unknown>(heapArray: T[], less?: (a: T, b: T) => boolean): T | undefined;

  /**
   * Push a value onto a heap array.
   * @param heapArray - Heap-ordered array.
   * @param item - Value to push.
   * @param less - Ordering function.
   * @returns The array.
   */
  static push<T = unknown>(heapArray: T[], item: T, less?: (a: T, b: T) => boolean): T[];

  /**
   * Push then pop in one operation on a heap array.
   * @param heapArray - Heap-ordered array.
   * @param item - Value to push.
   * @param less - Ordering function.
   * @returns The minimum element.
   */
  static pushPop<T = unknown>(heapArray: T[], item: T, less?: (a: T, b: T) => boolean): T;

  /**
   * Replace the top of a heap array.
   * @param heapArray - Heap-ordered array.
   * @param item - Replacement value.
   * @param less - Ordering function.
   * @returns The old top element.
   */
  static replaceTop<T = unknown>(heapArray: T[], item: T, less?: (a: T, b: T) => boolean): T;

  /**
   * Check whether a value exists in a heap array.
   * @param heapArray - Heap-ordered array.
   * @param item - Value to search for.
   * @param equal - Equality function.
   * @returns `true` if found.
   */
  static has<T = unknown>(heapArray: T[], item: T, equal?: (a: T, b: T) => boolean): boolean;

  /**
   * Find the index of a value in a heap array.
   * @param heapArray - Heap-ordered array.
   * @param item - Value to search for.
   * @param equal - Equality function.
   * @returns The index, or `-1` if not found.
   */
  static findIndex<T = unknown>(heapArray: T[], item: T, equal?: (a: T, b: T) => boolean): number;

  /**
   * Remove an element by index from a heap array.
   * @param heapArray - Heap-ordered array.
   * @param index - Index to remove.
   * @param less - Ordering function.
   * @returns The array.
   */
  static removeByIndex<T = unknown>(heapArray: T[], index: number, less?: (a: T, b: T) => boolean): T[];

  /**
   * Remove a value from a heap array.
   * @param heapArray - Heap-ordered array.
   * @param item - Value to remove.
   * @param less - Ordering function.
   * @param equal - Equality function.
   * @returns The array.
   */
  static remove<T = unknown>(heapArray: T[], item: T, less?: (a: T, b: T) => boolean, equal?: (a: T, b: T) => boolean): T[];

  /**
   * Replace an element at a given index in a heap array.
   * @param heapArray - Heap-ordered array.
   * @param index - Index to replace.
   * @param newItem - Replacement value.
   * @param less - Ordering function.
   * @returns The array.
   */
  static replaceByIndex<T = unknown>(heapArray: T[], index: number, newItem: T, less?: (a: T, b: T) => boolean): T[];

  /**
   * Replace a value in a heap array.
   * @param heapArray - Heap-ordered array.
   * @param item - Value to find and replace.
   * @param newItem - Replacement value.
   * @param less - Ordering function.
   * @param equal - Equality function.
   * @returns The array.
   */
  static replace<T = unknown>(heapArray: T[], item: T, newItem: T, less?: (a: T, b: T) => boolean, equal?: (a: T, b: T) => boolean): T[];

  /**
   * Re-sift an element at a given index in a heap array.
   * @param heapArray - Heap-ordered array.
   * @param index - Index of the mutated element.
   * @param isDecreased - `true` if the key decreased.
   * @param less - Ordering function.
   * @returns The array.
   */
  static updateByIndex<T = unknown>(heapArray: T[], index: number, isDecreased: boolean, less?: (a: T, b: T) => boolean): T[];

  /**
   * Heap-sort an array in place (ascending order).
   * @param heapArray - Heap-ordered array.
   * @param less - Ordering function.
   * @returns The sorted array.
   */
  static sort<T = unknown>(heapArray: T[], less?: (a: T, b: T) => boolean): T[];

  /**
   * Build a MinHeap from an array.
   * @param array - Array of values.
   * @param options - Ordering functions.
   * @returns A new MinHeap.
   */
  static from<T = unknown>(array: T[], options?: HeapOptions<T>): MinHeap<T>;
}

export default MinHeap;
