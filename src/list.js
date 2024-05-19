'use strict';

import {addAliases} from './meta-utils.js';

export class Node {
  constructor() {
    this.next = this.prev = this;
  }
}

export class ValueNode extends Node {
  constructor(value) {
    super();
    this.value = value;
  }
}

// useful low-level operations on doubly linked lists

const pop = head => {
  const rest = head.next;
  head.prev.next = head.next;
  head.next.prev = head.prev;
  head.prev = head.next = head;
  return {node: head, list: rest};
};

const extract = (from, to = from) => {
  const prev = from.prev,
    next = to.next;
  prev.next = next;
  next.prev = prev;
  from.prev = to;
  to.next = from;
  return from;
};

const splice = (head1, head2) => {
  const tail1 = head1.prev,
    tail2 = head2.prev;
  tail1.next = head2;
  head2.prev = tail1;
  tail2.next = head1;
  head1.prev = tail2;
  return head1;
};

const append = (target, from, to = from) => {
  // extract
  from.prev.next = to.next;
  to.next.prev = from.prev;

  // splice
  const next = target.next;
  target.next = from;
  from.prev = target;
  to.next = next;
  next.prev = to;

  return target;
};

const isNodeLike = node => node && node.prev && node.next;
const isStandAlone = node => node && node.prev === node && node.next === node;

export class Ptr {
  constructor(list, node) {
    if (list instanceof Ptr) {
      this.list = list.list;
      this.node = list.node;
    } else if (node instanceof Ptr) {
      if (list !== node.list) throw new Error('Node specified by Ptr must belong to the same list');
      this.list = list;
      this.node = node.node;
    } else {
      this.list = list;
      this.node = node || list.next;
    }
  }
  get isHead() {
    return this.node === this.list;
  }
  next() {
    this.node = this.node.next;
    return this;
  }
  prev() {
    this.node = this.node.prev;
    return this;
  }
  clone() {
    return new Ptr(this.list, this.node);
  }
  remove() {
    if (this.node === this.list) return null;
    const node = this.node;
    this.node = node.next;
    return pop(node).node;
  }
  addBefore(value) {
    splice(this.node, value instanceof ValueNode ? value : new ValueNode(value));
    return this;
  }
  addAfter(value) {
    splice(this.node.next, value instanceof ValueNode ? value : new ValueNode(value));
    return this;
  }
  insertBefore(list) {
    splice(this.node, pop(list).list);
    return this;
  }
  insertAfter(list) {
    splice(this.node.next, pop(list).list);
    return this;
  }
}

export class List extends Node {
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

  isNodeLike(node) {
    return isNodeLike(node);
  }

  isValidValueNode(node) {
    return node instanceof ValueNode && isStandAlone(node);
  }

  makePtr(node) {
    return new Ptr(this, node || this.next);
  }

  popFront() {
    if (this.next !== this) {
      return pop(this.next).node.value;
    }
  }

  popBack() {
    if (this.prev !== this) {
      return pop(this.prev).node.value;
    }
  }

  popFrontNode() {
    if (this.next !== this) {
      return pop(this.next).node;
    }
  }

  popBackNode() {
    if (this.prev !== this) {
      return pop(this.prev).node;
    }
  }

  pushFront(value) {
    splice(this.next, this.isValidValueNode(value) ? value : new ValueNode(value));
    return this;
  }

  pushBack(value) {
    splice(this, this.isValidValueNode(value) ? value : new ValueNode(value));
    return this;
  }

  appendFront(list) {
    if (list.next !== list) {
      splice(this.next, extract(list.next, list.prev));
    }
    return this;
  }

  appendBack(list) {
    if (list.next !== list) {
      splice(this, extract(list.next, list.prev));
    }
    return this;
  }

  moveToFront(node) {
    if (node instanceof Ptr) node = node.node;
    if (this.next !== node) {
      splice(this.next, pop(node).node);
    }
    return this;
  }

  moveToBack(node) {
    if (node instanceof Ptr) node = node.node;
    if (this.prev !== node) {
      splice(this, pop(node).node);
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
    extract(from, to);
    return this;
  }

  removeNode(node) {
    if (node instanceof Ptr) node = node.node;
    pop(node);
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
    return splice(new List(), extract(from, to));
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

Object.assign(List, {pop, extract, splice, append, isNodeLike, isStandAlone, Node, ValueNode, Ptr});
addAliases(List, {popFront: 'pop', pushFront: 'push', appendBack: 'append'});

export default List;
