'use strict';

import List, {Ptr} from './core.js';
import {ValueNode} from './nodes.js';
import {addAliases, mapIterator, normalizeIterator} from '../meta-utils.js';

export class ValueSList extends List {
  popFront() {
    return this.popFrontNode()?.value;
  }

  adoptValue(value) {
    if (value instanceof Ptr) {
      if (value.node instanceof ValueNode) return super.adoptNode(value);
      value.list = this;
      return new ValueNode(value.node, this);
    }
    return value instanceof ValueNode ? super.adoptNode(value) : new ValueNode(value, this);
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

  // meta helpers

  clone() {
    return ValueSList.from(this, this);
  }

  make() {
    return new ValueSList(this);
  }

  makeFrom(values) {
    return ValueSList.from(values, this);
  }

  static from(values, options) {
    const list = new ValueSList(options);
    for (const value of values) list.pushBack(value);
    return list;
  }
}

ValueSList.Ptr = Ptr;
ValueSList.ValueNode = ValueNode;

addAliases(ValueSList, {popFront: 'pop', getValueIterator: 'getIterator'}, true);

export {ValueNode, Ptr};
export default ValueSList;
