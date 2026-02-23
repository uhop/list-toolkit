import ValueList from './value-list.js';
import {addAliases} from './meta-utils.js';
import {pushValuesBack} from './list-utils.js';

/** FIFO queue backed by a value list. */
export class Queue {
  /** @param {object} [underlyingList] - Backing list instance (default: new ValueList). */
  constructor(underlyingList = new ValueList()) {
    this.list = underlyingList;
    this.size = this.list.getLength();
  }
  /** Whether the queue has no elements. */
  get isEmpty() {
    return this.list.isEmpty;
  }
  /** The front element without removing it, or `undefined` if empty. */
  get top() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  /**
   * Alias for `top`.
   * @returns {*} The front element, or `undefined`.
   */
  peek() {
    return this.list.isEmpty ? undefined : this.list.front.value;
  }
  /**
   * Add a value to the back of the queue.
   * @param {*} value - Value to enqueue.
   * @returns {Queue} `this` for chaining.
   */
  add(value) {
    this.list.pushBack(value);
    ++this.size;
    return this;
  }
  /**
   * Remove and return the front value.
   * @returns {*} The dequeued value, or `undefined` if empty.
   */
  remove() {
    if (!this.list.isEmpty) {
      --this.size;
      return this.list.popFront();
    }
    // return undefined;
  }
  /**
   * Enqueue multiple values.
   * @param {Iterable} values - Values to add.
   * @returns {Queue} `this` for chaining.
   */
  addValues(values) {
    pushValuesBack(this, values);
    return this;
  }
  /**
   * Remove all elements.
   * @returns {Queue} `this` for chaining.
   */
  clear() {
    this.list.clear();
    this.size = 0;
    return this;
  }
  /** Iterate over values from front to back. */
  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
  /**
   * Get an iterable over values in reverse order.
   * @returns {Iterable} An iterable iterator of values.
   */
  getReverseIterator() {
    return this.list.getReverseIterator?.();
  }
}

addAliases(Queue.prototype, {add: 'push, pushBack, enqueue', remove: 'pop, popFront, dequeue'});

export default Queue;
