import ExtList, {Ptr} from './ext.js';
import {ValueNode} from './nodes.js';
import {addAliases, mapIterator, normalizeIterator} from '../meta-utils.js';

/**
 * External (headless) value-based doubly linked list. Wraps values in {@link ValueNode}.
 * Iterators yield unwrapped values; use `getNodeIterator` for ValueNode access.
 */
export class ExtValueList extends ExtList {
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

  /** Iterate over unwrapped values starting from the head. */
  [Symbol.iterator]() {
    let current = this.head,
      readyToStop = this.isEmpty;
    return normalizeIterator({
      next: () => {
        if (readyToStop && current === this.head) return {done: true};
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
   * @returns {ExtValueList} A new ExtValueList pointing to the same head.
   */
  clone() {
    return new ExtValueList(this);
  }

  /**
   * Create an empty list with the same options.
   * @param {object|null} [head=null] - Optional initial head node.
   * @returns {ExtValueList} A new ExtValueList.
   */
  make(head = null) {
    return new ExtValueList(head, this);
  }

  /**
   * Create a list from values with the same options.
   * @param {Iterable} values - Iterable of values.
   * @returns {ExtValueList} A new ExtValueList.
   */
  makeFrom(values) {
    return ExtValueList.from(values, this);
  }

  /**
   * Build an ExtValueList from an iterable.
   * @param {Iterable} values - Iterable of values.
   * @param {object} [options] - Link property names.
   * @returns {ExtValueList} A new ExtValueList.
   */
  static from(values, options) {
    const list = new ExtValueList(null, options);
    for (const value of values) {
      list.addAfter(value);
      list.next();
    }
    return list.next();
  }
}

ExtValueList.Ptr = Ptr;
ExtValueList.ValueNode = ValueNode;

addAliases(ExtValueList.prototype, {
  getValueIterator: 'getIterator',
  getReverseValueIterator: 'getReverseIterator'
});

export {ValueNode};
export default ExtValueList;
