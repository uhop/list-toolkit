import {copyOptions} from '../meta-utils.js';

const defaultLess = (a, b) => a < b;
const defaultEqual = (a, b) => a === b;

/** Abstract base class for heap implementations. */
export class HeapBase {
  /** @param {object} [options] - Ordering options (`less`, `equal`, `compare`). */
  constructor(options) {
    copyOptions(this, HeapBase.defaults, options);
  }

  /** Whether the heap has no elements. */
  get isEmpty() {
    throw new Error('Not implemented');
  }
  /** The minimum element without removing it. */
  get top() {
    throw new Error('Not implemented');
  }
  /**
   * Alias for `top`.
   * @returns {*} The minimum element.
   */
  peek() {
    return this.top;
  }
  /**
   * Remove and return the minimum element.
   * @returns {*} The removed element.
   */
  pop() {
    throw new Error('Not implemented');
  }
  /**
   * Add an element to the heap.
   * @param {*} value - Element to add.
   * @returns {HeapBase} `this` for chaining.
   */
  push() {
    throw new Error('Not implemented');
  }
  /**
   * Remove all elements.
   * @returns {HeapBase} `this` for chaining.
   */
  clear() {
    throw new Error('Not implemented');
  }

  /**
   * Push then pop in one operation (more efficient than separate calls).
   * @param {*} value - Element to push.
   * @returns {*} The popped element.
   */
  pushPop(value) {
    this.push(value);
    return this.pop();
  }
  /**
   * Pop then push in one operation (more efficient than separate calls).
   * @param {*} value - Element to push.
   * @returns {*} The popped element.
   */
  replaceTop(value) {
    const z = this.pop();
    this.push(value);
    return z;
  }

  /**
   * Merge one or more iterables or heaps into this heap.
   * @param {...Iterable} args - Arrays or heaps to merge.
   * @returns {HeapBase} `this` for chaining.
   */
  merge(...args) {
    throw new Error('Not implemented');
  }
  /**
   * Create a shallow copy of this heap.
   * @returns {HeapBase} A new heap with the same elements.
   */
  clone() {
    throw new Error('Not implemented');
  }
  /**
   * Create an empty heap with the same options.
   * @param {...*} args - Additional arguments for the constructor.
   * @returns {HeapBase} A new heap.
   */
  make(...args) {
    return new this.constructor(this, ...args);
  }
}

HeapBase.defaults = {less: defaultLess, equal: defaultEqual, compare: null};

export default HeapBase;
