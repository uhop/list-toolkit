/** LIFO stack backed by a value list. */
export class Stack<V = unknown> {
  /** Number of elements in the stack. */
  size: number;

  /**
   * @param UnderlyingList - Optional value list constructor to use (default: ValueList).
   */
  constructor(UnderlyingList?: new () => object);

  /** Whether the stack has no elements. */
  get isEmpty(): boolean;

  /** The top element without removing it, or `undefined` if empty. */
  get top(): V | undefined;

  /**
   * Peek at the top element.
   * @returns The top value, or `undefined` if empty.
   */
  peek(): V | undefined;

  /**
   * Push a value onto the top of the stack.
   * @param value - Value to push.
   * @returns `this` for chaining.
   */
  push(value: V): this;

  /**
   * Alias for {@link push}.
   * @param value - Value to push.
   * @returns `this` for chaining.
   */
  pushFront(value: V): this;

  /**
   * Remove and return the top value.
   * @returns The top value, or `undefined` if empty.
   */
  pop(): V | undefined;

  /**
   * Push multiple values onto the stack.
   * @param values - Iterable of values.
   * @returns `this` for chaining.
   */
  pushValues(values: Iterable<V>): this;

  /**
   * Remove all elements.
   * @returns `this` for chaining.
   */
  clear(): this;

  /** Iterate over values from top to bottom. */
  [Symbol.iterator](): IterableIterator<V>;

  /**
   * Iterate over values from bottom to top.
   * @returns An iterable iterator.
   */
  getReverseIterator(): IterableIterator<V>;
}

export default Stack;
