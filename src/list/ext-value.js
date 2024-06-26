'use strict';

import ExtList, {Ptr} from './ext.js';
import {ValueNode} from './nodes.js';
import {addAliases, mapIterator, normalizeIterator} from '../meta-utils.js';

export class ExtValueList extends ExtList {
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

  getReverseValueIterator(range) {
    return mapIterator(this.getReverseNodeIterator(range), node => node.value);
  }

  // meta helpers

  clone() {
    return new ExtValueList(this);
  }

  make(head = null) {
    return new ExtValueList(head, this);
  }

  makeFrom(values) {
    return ExtValueList.from(values, this);
  }

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
