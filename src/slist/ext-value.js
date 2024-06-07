'use strict';

import ExtSList, {Ptr} from './ext.js';
import {ValueNode} from './nodes.js';
import {addAlias, mapIterator, normalizeIterator} from '../meta-utils.js';

export class ExtValueSList extends ExtSList {
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

  // iterators

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

  getValueIterator(range) {
    return mapIterator(this.getNodeIterator(range), node => node.value);
  }

  // meta helpers

  clone() {
    return new ExtValueSList(this);
  }

  make(head = null) {
    return new ExtValueSList(head, this);
  }

  makeFrom(values) {
    return ExtValueSList.from(values, this);
  }

  static from(values, options) {
    const list = new ExtValueSList(null, options);
    for (const value of values) {
      list.addAfter(value);
      list.next();
    }
    return list.next();
  }
}

ExtValueSList.Ptr = Ptr;
ExtValueSList.ValueNode = ValueNode;

addAlias(ExtValueSList.prototype, 'getIterator', 'getValueIterator');

export {ValueNode};
export default ExtValueSList;
