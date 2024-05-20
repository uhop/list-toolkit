'use strict';

import List from './core.js';
import {ValueNode} from './nodes.js';
import {pop} from './basics.js';
import {addAliases} from '../meta-utils.js';

export class ValueList extends List {
  popFront() {
    if (!this.isEmpty) return pop(this, this[this.nextName]).node.value;
  }

  popBack() {
    if (!this.isEmpty) return pop(this, this[this.prevName]).node.value;
  }

  adoptNode(node) {
    return node instanceof ValueNode ? super.adoptNode(node) : new ValueNode(node, this);
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

  getReverseValueIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        const nodeIterable = this.getReverseNodeIterable(from, to)[Symbol.iterator]();
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

addAliases(ValueList, {
  popFront: 'pop',
  getValueIterable: 'getIterable',
  getReverseValueIterable: 'getReverseIterable'
});

export default ValueList;
