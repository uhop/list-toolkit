import ValueList from './value-list.js';
import {addAlias} from './meta-utils.js';
import {pushValuesFront} from './list-utils.js';

/** LIFO stack backed by a value list. */
export class Stack {
  /** @param {Function} [UnderlyingList=ValueList] - Constructor for the backing list. */
  constructor(UnderlyingList = ValueList) {
    this.size = 0;
    this.list = new UnderlyingList();
  }
  /** Whether the stack has no elements. */
  get isEmpty() {
    return this.list.isEmpty;
  }
  /** The top element without removing it, or `undefined` if empty. */
  get top() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  /** Alias for {@link Stack#top|top}. */
  peek() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  /**
   * Push a value onto the stack.
   * @param {*} value - Value to push.
   * @returns {Stack} `this` for chaining.
   */
  push(value) {
    this.list.pushFront(value);
    ++this.size;
    return this;
  }
  /**
   * Remove and return the top value.
   * @returns {*} The popped value, or `undefined` if empty.
   */
  pop() {
    if (!this.list.isEmpty) {
      --this.size;
      return this.list.popFront();
    }
    // return undefined;
  }
  /**
   * Push multiple values onto the stack.
   * @param {Iterable} values - Values to push.
   * @returns {Stack} `this` for chaining.
   */
  pushValues(values) {
    pushValuesFront(this, values);
    return this;
  }
  /**
   * Remove all elements.
   * @returns {Stack} `this` for chaining.
   */
  clear() {
    this.list.clear();
    this.size = 0;
    return this;
  }
  /** Iterate over values from top to bottom. */
  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
  /**
   * Get an iterable over values in reverse (bottom-to-top) order.
   * @returns {Iterable} An iterable iterator of values.
   */
  getReverseIterator() {
    return this.list.getReverseIterator?.();
  }
}

addAlias(Stack.prototype, 'push', 'pushFront');

export default Stack;
