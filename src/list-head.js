'use strict';

import {addAliases} from './meta-utils.js';
import {HeadNode} from './list-nodes.js';
import {pop, extract, splice, append, isNodeLike, isStandAlone} from './list-basics.js';
import Ptr from './list-ptr.js';

export class UnsafeHead {
  constructor(head) {
    this.head = head;
  }
}

export const unsafe = head => new UnsafeHead(head);

export class ListHead {
  constructor(head, {nextName = 'next', prevName = 'prev'} = {}) {
    if (head instanceof ListHead) {
      this.nextName = head.nextName;
      this.prevName = head.prevName;
      this.head = head.head;
      return;
    }
    this.nextName = nextName;
    this.prevName = prevName;
    if (head instanceof UnsafeHead) {
      this.head = head.head;
      return;
    }
    if (isNodeLike(this, head)) {
      this.head = head;
      return;
    }
    this.head = new HeadNode(this);
  }

  get isHeadless() {
    return !(this.head instanceof HeadNode);
  }

  get isEmpty() {
    return this.head instanceof HeadNode && this.head[this.nextName] === this.head;
  }

  get isOne() {
    return this.head instanceof HeadNode
      ? this.head[this.nextName] !== this.head && this.head[this.nextName][this.nextName] === this.head
      : this.head[this.nextName] === this.head;
  }

  get isOneOrEmpty() {
    return this.head instanceof HeadNode ? this.head[this.nextName][this.nextName] === this.head : this.head[this.nextName] === this.head;
  }

  get front() {
    return this.head instanceof HeadNode ? this.head[this.nextName] : this.head;
  }

  get back() {
    return this.head[this.prevName];
  }

  get frontPtr() {
    return new Ptr(this.head, this.front);
  }

  get backPtr() {
    return new Ptr(this.head, this.back);
  }

  getLength() {
    let n = 0;
    for (let p = this.head[this.nextName]; p !== this.head; ++n, p = p[this.nextName]);
    if (this.isHeadless) ++n;
    return n;
  }

  makePtr(node) {
    return new Ptr(this.head, node || this.front);
  }

  popFrontNode() {
    if (this.isHeadless) {
      const result = pop(this, this.head);
      this.head = result.node === result.list ? new HeadNode(this) : result.list;
      return result.node;
    }
    if (!this.isEmpty) return pop(this, this.head[this.nextName]).node;
  }

  popBackNode() {
    if (this.isHeadless) {
      const result = pop(this, this.head[this.prevName]);
      if (result.node === result.list) this.head = new HeadNode(this);
      return result.node;
    }
    if (!this.isEmpty) return pop(this, this.head[this.prevName]).node;
  }

  pushFrontNode(node) {
    splice(this, this.head[this.nextName], this.adopt(node));
    if (this.isHeadless) this.head = node;
    return this;
  }

  pushBackNode(node) {
    splice(this, this.head, this.adopt(node));
    return this;
  }

  appendFront(list) {
    if (!this.head.isCompatible(list.head)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    let head;
    if (list.isHeadless) {
      list = list.head;
      list.head = new HeadNode(list);
    } else {
      head = extract(this, {from: list.head[this.nextName], to: list.head[this.prevName]});
    }

    if (this.isHeadless) {
      this.head = splice(this, head, this.head);
    } else {
      splice(this, this.head[this.nextName], head);
    }

    return this;
  }

  appendBack(list) {
    if (!this.head.isCompatible(list.head)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    let head;
    if (list.isHeadless) {
      list = list.head;
      list.head = new HeadNode(list);
    } else {
      head = extract(this, {from: list.head[this.nextName], to: list.head[this.prevName]});
    }

    splice(this, this.head, head);

    return this;
  }

  moveToFront(node) {
    if (node instanceof Ptr) {
      if (!this.head.isCompatible(node.list.head)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.head.isNodeLike(node)) throw new Error('Not a compatible node');
    }

    if (this.isHeadless) {
      if (this.head === node) return this;
      this.head = splice(this, this.head, pop(this, node).node);
    } else {
      if (this.head[this.nextName] === node) return this;
      splice(this, this.head[this.nextName], pop(this, node).node);
    }

    return this;
  }

  moveToBack(node) {
    if (node instanceof Ptr) {
      if (!this.head.isCompatible(node.list.head)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.head.isNodeLike(node)) throw new Error('Not a compatible node');
    }

    if (this.head[this.prevName] === node) return this;
    splice(this, this.head, pop(this, node).node);

    return this;
  }

  clear(drop) {
    if (drop) {
      while (!this.isEmpty) this.popFront();
    } else {
      this.head = new HeadNode(this);
    }
    return this;
  }

  removeNode(node) {
    if (node instanceof Ptr) {
      if (!this.head.isCompatible(node.list.head)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.head.isNodeLike(node)) throw new Error('Not a compatible node');
    }
    pop(this, node);
    return this;
  }

  remove(from, to = from, drop) {
    this.extract(from, to).clear(drop);
    return this;
  }

  extract(from, to = from) {
    if (from instanceof Ptr) {
      if (to instanceof Ptr) {
        if (from.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof Ptr) to = to.node;
    }
    if (!this.head.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (!this.head.isNodeLike(to)) throw new Error('"to" is not a compatible node');
    return new ListHead(unsafe(splice(this, new HeadNode(this), extract(this, {from, to}))), this);
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    while (this.isEmpty && condition(this.front)) extracted.pushBack(this.popFront());
    if (this.isOneOrEmpty) return extracted;

    for (const ptr of this.getPtrIterable(this.front[this.nextName])) {
      if (condition(ptr.node)) extracted.pushBack(ptr.remove());
    }

    return extracted;
  }

  reverse() {
    let current = this.head;
    do {
      const next = current[this.nextName];
      current[this.nextName] = current[this.prevName];
      current[this.prevName] = next;
      current = next;
    } while (current !== this.head);
    if (this.isHeadless) this.head = this.head[this.nextName];
    return this;
  }

  sort(compareFn) {
    if (this.isOneOrEmpty) return this;

    const sortedNodes = Array.from(this).sort(compareFn);

    for (let i = 1; i < sortedNodes.length; i++) {
      const prev = sortedNodes[i - 1],
        current = sortedNodes[i];
      prev[this.nextName] = current;
      current[this.prevName] = prev;
    }

    const head = sortedNodes[0],
      tail = sortedNodes[sortedNodes.length - 1];
    tail[this.nextName] = head;
    head[this.prevName] = tail;

    if (this.isHeadless) {
      this.head = head;
    } else {
      this.head[this.nextName] = this.head[this.prevName] = this.head;
      splice(this, this.head, head);
    }

    return this;
  }

  adopt(node) {
    if (node[this.nextName] || node[this.prevName]) {
      if (node[this.nextName] === node && node[this.prevName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node[this.prevName] = node;
    return node;
  }

  convertToHeadlessList() {
    if (this.isHeadless) return this;
    this.head = extract(this, {from: this.head[this.nextName], to: this.head[this.prevName]});
    return this;
  }

  releaseAsHeadlessList() {
    const list = this.make();
    if (this.isHeadless) {
      list.head = this.head;
      this.head = new HeadNode(this);
    } else {
      list.head = extract(this, {from: this.head[this.nextName], to: this.head[this.prevName]});
    }
    return list;
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.isHeadless ? this.head : this.head[this.nextName],
      readyToStop = this.isEmpty;
    return {
      next: () => {
        if (readyToStop && current === this.head) return {done: true};
        readyToStop = true;
        const value = current;
        current = current[this.nextName];
        return {value};
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
    if (from && !this.head.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (to && !this.head.isNodeLike(to)) throw new Error('"to" is not a compatible node');

    return {
      [Symbol.iterator]: () => {
        let current = from || (this.isHeadless ? this.head : this.head[this.nextName]),
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this.head;
        return {
          next: () => {
            if (readyToStop && current === stop) return {done: true};
            readyToStop = true;
            const value = current;
            current = current[this.nextName];
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
            return {value: new Ptr(this.head, result.value)};
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
    if (from && !this.head.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (to && !this.head.isNodeLike(to)) throw new Error('"to" is not a compatible node');

    return {
      [Symbol.iterator]: () => {
        let current = to || this.head[this.prevName],
          readyToStop = this.isEmpty;
        const stop = from ? from[this.prevName] : this.head;
        return {
          next: () => {
            if (readyToStop && current === stop) return {done: true};
            readyToStop = true;
            const value = current;
            current = current[this.prevName];
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
            return {value: new Ptr(this.head, result.value)};
          }
        };
      }
    };
  }

  // meta helpers

  clone() {
    return ListHead.from(this);
  }

  make(newHead = null) {
    return new ListHead(newHead, this);
  }

  makeFrom(values) {
    return ListHead.from(values, this);
  }

  static from(values, options) {
    const list = new ListHead(null, options);
    for (const value of values) list.pushBack(value);
    return list;
  }
}

Object.assign(ListHead, {pop, extract, splice, append, isNodeLike, isStandAlone, UnsafeHead, unsafe, HeadNode, Ptr});
addAliases(ListHead, {
  popFrontNode: 'popFront, pop',
  pushFrontNode: 'pushFront, push',
  popBackNode: 'popBack',
  pushBackNode: 'pushBack',
  getNodeIterable: 'getIterable',
  getReverseNodeIterable: 'getReverseIterable',
  appendBack: 'append'
});

export default ListHead;
