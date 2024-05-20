'use strict';

import List from './core.js';
import {ValueNode} from './nodes.js';
import {addAliases} from '../meta-utils.js';

export class ValueSList extends List {
  popFront() {
    return this.popFrontNode()?.value;
  }

  adopt(node) {
    return node instanceof ValueNode ? super.adopt(node) : new ValueNode(node, this);
  }

  // iterators

  [Symbol.iterator]() {
    let current = this[this.nextName],
      readyToStop = this.isEmpty;
    return {
      next: () => {
        if (readyToStop && current === this) return {done: true};
        readyToStop = true;
        const value = current.value;
        current = current[this.nextName];
        return {value};
      }
    };
  }

  getValueIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        const nodeIterable = this.getNodeIterable(from, to)[Symbol.iterator]();
        return {
          next: () => {
            const result = nodeIterable.next();
            if (result.done) return result;
            return {value: result.value.value};
          }
        };
      }
    };
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

addAliases(ValueSList, {
  popFront: 'pop',
  getValueIterable: 'getIterable'
});

export default ValueSList;
