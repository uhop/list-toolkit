'use strict';

import {addAliases} from './meta-utils.js';
import {HeadNode, ValueNode} from './list-nodes.js';
import {pop, extract, splice, append, isNodeLike, isStandAlone} from './list-basics.js';
import Ptr from './list-ptr.js';

// useful low-level operations on doubly linked lists

export class List extends HeadNode {
  constructor() {
    super();
  }

  get isEmpty() {
    return this.next === this;
  }

  get isOne() {
    return this.next !== this && this.next.next === this;
  }

  get isOneOrEmpty() {
    return this.next.next === this;
  }

  get front() {
    return this.next;
  }

  get back() {
    return this.prev;
  }

  get frontPtr() {
    return new Ptr(this, this.next);
  }

  get backPtr() {
    return new Ptr(this, this.prev);
  }

  getLength() {
    let n = 0;
    for (let p = this.next; p !== this; ++n, p = p.next);
    return n;
  }

  isValidValueNode(node) {
    return node instanceof ValueNode && isStandAlone(this, node);
  }

  makePtr(node) {
    return new Ptr(this, node || this.next);
  }

  popFront() {
    if (this.next !== this) {
      return pop(this, this.next).node.value;
    }
  }

  popBack() {
    if (this.prev !== this) {
      return pop(this, this.prev).node.value;
    }
  }

  popFrontNode() {
    if (this.next !== this) {
      return pop(this, this.next).node;
    }
  }

  popBackNode() {
    if (this.prev !== this) {
      return pop(this, this.prev).node;
    }
  }

  pushFront(value) {
    splice(this, this.next, this.isValidValueNode(value) ? value : new ValueNode(value));
    return this;
  }

  pushBack(value) {
    splice(this, this, this.isValidValueNode(value) ? value : new ValueNode(value));
    return this;
  }

  appendFront(list) {
    if (list.next !== list) {
      splice(this, this.next, extract(this, {from: list.next, to: list.prev}));
    }
    return this;
  }

  appendBack(list) {
    if (list.next !== list) {
      splice(this, this, extract(this, {from: list.next, to: list.prev}));
    }
    return this;
  }

  moveToFront(node) {
    if (node instanceof Ptr) node = node.node;
    if (this.next !== node) {
      splice(this, this.next, pop(this, node).node);
    }
    return this;
  }

  moveToBack(node) {
    if (node instanceof Ptr) node = node.node;
    if (this.prev !== node) {
      splice(this, this, pop(this, node).node);
    }
    return this;
  }

  clear() {
    this.prev = this.next = this;
    return this;
  }

  remove(from, to = from) {
    if (from instanceof Ptr) {
      if (to instanceof Ptr) {
        if (from.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof Ptr) to = to.node;
    }
    extract(this, {from, to});
    return this;
  }

  removeNode(node) {
    if (node instanceof Ptr) node = node.node;
    pop(this, node);
    return this;
  }

  extract(from, to) {
    if (from instanceof Ptr) {
      if (to instanceof Ptr) {
        if (from.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof Ptr) to = to.node;
    }
    return splice(this, new List(), extract(this, {from, to}));
  }

  extractBy(condition) {
    const extracted = this.make();
    for (const ptr of this.getPtrIterable()) {
      if (condition(ptr.node)) extracted.pushBack(ptr.remove());
    }
    return extracted;
  }

  reverse() {
    let current = this;
    do {
      const next = current.next;
      current.next = current.prev;
      current.prev = next;
      current = next;
    } while (current !== this);
    return this;
  }

  sort(compareFn) {
    let current = this.next;
    for (const value of Array.from(this).sort(compareFn)) {
      current.value = value;
      current = current.next;
    }
    return this;
  }

  adopt(value) {
    return this.isValidValueNode(value) ? value : new ValueNode(value);
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.next;
    return {
      next: () => {
        if (current === this) return {done: true};
        const value = current.value;
        current = current.next;
        return {value};
      }
    };
  }

  getIterable(from, to) {
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

  getNodeIterable(from, to) {
    if (from instanceof Ptr) {
      if (to instanceof Ptr) {
        if (from.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof Ptr) to = to.node;
    }
    return {
      [Symbol.iterator]: () => {
        let current = from || this.next;
        const stop = to ? to.next : this;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const value = current;
            current = current.next;
            return {value};
          }
        };
      }
    };
  }

  getPtrIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        const nodeIterable = this.getNodeIterable(from, to)[Symbol.iterator]();
        return {
          next: () => {
            const result = nodeIterable.next();
            if (result.done) return result;
            return {value: new Ptr(this, result.value)};
          }
        };
      }
    };
  }

  getReverseIterable(from, to) {
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

  getReverseNodeIterable(from, to) {
    if (from instanceof Ptr) {
      if (to instanceof Ptr) {
        if (from.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof Ptr) to = to.node;
    }
    return {
      [Symbol.iterator]: () => {
        let current = to || this.prev;
        const stop = from ? from.prev : this;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const value = current;
            current = current.prev;
            return {value};
          }
        };
      }
    };
  }

  getReversePtrIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        const nodeIterable = this.getReverseNodeIterable(from, to)[Symbol.iterator]();
        return {
          next: () => {
            const result = nodeIterable.next();
            if (result.done) return result;
            return {value: new Ptr(this, result.value)};
          }
        };
      }
    };
  }

  // meta helpers

  clone() {
    return List.from(this);
  }

  make() {
    return new List();
  }

  makeFrom(values) {
    return List.from(values);
  }

  static from(values) {
    const list = new List();
    for (const value of values) list.pushBack(value);
    return list;
  }
}

Object.assign(List, {pop, extract, splice, append, isNodeLike, isStandAlone, HeadNode, ValueNode, Ptr});
addAliases(List, {popFront: 'pop', pushFront: 'push', appendBack: 'append'});

export default List;
