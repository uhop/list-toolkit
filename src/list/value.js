import List, {Ptr} from './core.js';
import {ValueNode} from './nodes.js';
import {pop} from './basics.js';
import {addAliases, mapIterator, normalizeIterator} from '../meta-utils.js';

/**
 * Hosted value-based doubly linked list. Wraps values in {@link ValueNode}.
 * Iterators yield unwrapped values; use `getNodeIterator` for ValueNode access.
 */
export class ValueList extends List {
  /**
   * Remove and return the front value.
   * @returns {*} The unwrapped value, or `undefined` if empty.
   */
  popFront() {
    if (!this.isEmpty) return pop(this, this[this.nextName]).extracted.value;
  }

  /**
   * Remove and return the back value.
   * @returns {*} The unwrapped value, or `undefined` if empty.
   */
  popBack() {
    if (!this.isEmpty) return pop(this, this[this.prevName]).extracted.value;
  }

  /**
   * Adopt a value, pointer, or ValueNode into this list.
   * @param {*} value - Raw value, Ptr, or ValueNode.
   * @returns {ValueNode} A ValueNode ready for insertion.
   */
  adoptValue(value) {
    if (value instanceof Ptr) {
      if (!this.isCompatiblePtr(value)) throw new Error('Incompatible pointer');
      if (value.node instanceof ValueNode) {
        value.list = this;
        return super.adoptNode(value);
      }
      return new ValueNode(value.node, this);
    }
    if (value instanceof ValueNode) {
      if (!this.isNodeLike(value)) throw new Error('Incompatible node');
      return super.adoptNode(value);
    }
    return new ValueNode(value, this);
  }

  /** Iterate over unwrapped values from front to back. */
  [Symbol.iterator]() {
    let current = this[this.nextName],
      readyToStop = this.isEmpty;
    return normalizeIterator({
      next: () => {
        if (readyToStop && current === this) return {done: true};
        readyToStop = true;
        const value = current.value;
        current = current[this.nextName];
        return {value};
      }
    });
  }

  /**
   * Get an iterable over unwrapped values in a range.
   * @param {object} [range] - Sub-range to iterate.
   * @returns {Iterable} An iterable iterator of values.
   */
  getValueIterator(range) {
    return mapIterator(this.getNodeIterator(range), node => node.value);
  }

  /**
   * Get an iterable over unwrapped values in reverse order.
   * @param {object} [range] - Sub-range to iterate.
   * @returns {Iterable} An iterable iterator of values.
   */
  getReverseValueIterator(range) {
    return mapIterator(this.getReverseNodeIterator(range), node => node.value);
  }

  /**
   * Create a shallow clone of this list.
   * @returns {ValueList} A new ValueList with the same values.
   */
  clone() {
    return ValueList.from(this, this);
  }

  /**
   * Create an empty list with the same options.
   * @returns {ValueList} A new empty ValueList.
   */
  make() {
    return new ValueList(this);
  }

  /**
   * Create a list from values with the same options.
   * @param {Iterable} values - Iterable of values.
   * @returns {ValueList} A new ValueList.
   */
  makeFrom(values) {
    return ValueList.from(values, this);
  }

  /**
   * Build a ValueList from an iterable.
   * @param {Iterable} values - Iterable of values.
   * @param {object} [options] - Link property names.
   * @returns {ValueList} A new ValueList.
   */
  static from(values, options) {
    const list = new ValueList(options);
    for (const value of values) list.pushBack(value);
    return list;
  }
}

ValueList.Ptr = Ptr;
ValueList.ValueNode = ValueNode;

addAliases(ValueList.prototype, {
  popFront: 'pop',
  getValueIterator: 'getIterator',
  getReverseValueIterator: 'getReverseIterator'
});

export {ValueNode, Ptr};
export default ValueList;
