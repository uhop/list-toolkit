'use strict';

import List, {Ptr} from './core.js';
import {ValueNode} from './nodes.js';
import {pop} from './basics.js';
import {addAliases, mapIterator, normalizeIterator} from '../meta-utils.js';

export class ValueList extends List {
  popFront() {
    if (!this.isEmpty) return pop(this, this[this.nextName]).extracted.value;
  }

  popBack() {
    if (!this.isEmpty) return pop(this, this[this.prevName]).extracted.value;
  }

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

  getValueIterator(range) {
    return mapIterator(this.getNodeIterator(range), node => node.value);
  }

  getReverseValueIterator(range) {
    return mapIterator(this.getReverseNodeIterator(range), node => node.value);
  }

  // meta helpers

  clone() {
    return ValueList.from(this, this);
  }

  make() {
    return new ValueList(this);
  }

  makeFrom(values) {
    return ValueList.from(values, this);
  }

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
