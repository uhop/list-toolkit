'use strict';

import {addAliases} from './meta-utils.js';
import {HeadNode} from './list-nodes.js';
import {pop, extract, splice, append, isNodeLike, isStandAlone} from './list-basics.js';
import Ptr from './list-ptr.js';

export class ListHead {
  constructor(head, options) {
    if (head instanceof ListHead) {
      head = head.head;
    }
    if (head instanceof HeadNode) {
      this.head = head;
      return;
    }
    this.head = new HeadNode(options);
  }

  get isEmpty() {
    return this.head.isEmpty;
  }

  get isOne() {
    return this.head.isOne;
  }

  get isOneOrEmpty() {
    return this.head.isOneOrEmpty;
  }

  get front() {
    return this.head[this.head.nextName];
  }

  get back() {
    return this.head[this.head.prevName];
  }

  get frontPtr() {
    return new Ptr(this.head, this.head.front);
  }

  get backPtr() {
    return new Ptr(this.head, this.head.back);
  }

  getLength() {
    let n = 0;
    const nextName = this.head.nextName;
    for (let p = this.head[nextName]; p !== this.head; ++n, p = p[nextName]);
    return n;
  }

  makePtr(node) {
    return new Ptr(this.head, node || this.head.front);
  }

  popFrontNode() {
    return this.head.popFrontNode();
  }

  popBackNode() {
    return this.head.popBackNode();
  }

  pushFrontNode(node) {
    this.head.pushFrontNode(node);
    return this;
  }

  pushBackNode(node) {
    this.head.pushBackNode(node);
    return this;
  }

  appendFront(list) {
    if (!this.head.isCompatible(list.head)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const head = extract(this.head, {from: list.head[this.head.nextName], to: list.head[this.head.prevName]});
    splice(this.head, this.head[this.head.nextName], head);

    return this;
  }

  appendBack(list) {
    if (!this.head.isCompatible(list.head)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const head = extract(this.head, {from: list.head[this.head.nextName], to: list.head[this.head.prevName]});
    splice(this.head, this.head, head);

    return this;
  }

  moveToFront(node) {
    if (node instanceof Ptr) {
      if (!this.head.isCompatible(node.list.head)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.head.isNodeLike(node)) throw new Error('Not a compatible node');
    }

    if (this.head[this.head.nextName] === node) return this;
    splice(this.head, this.head[this.head.nextName], pop(this.head, node).node);

    return this;
  }

  moveToBack(node) {
    if (node instanceof Ptr) {
      if (!this.head.isCompatible(node.list.head)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.head.isNodeLike(node)) throw new Error('Not a compatible node');
    }

    if (this.head[this.head.prevName] === node) return this;
    splice(this.head, this.head, pop(this.head, node).node);

    return this;
  }

  clear(drop) {
    if (drop) {
      while (!this.head.isEmpty) this.head.popFrontNode();
    } else {
      this.head.clear();
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
    pop(this.head, node);
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
    return new ListHead(splice(this.head, new HeadNode(this.head), extract(this.head, {from, to})), this);
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    while (this.isEmpty && condition(this.front)) extracted.pushBack(this.popFront());
    if (this.isOneOrEmpty) return extracted;

    for (const ptr of this.getPtrIterable(this.front[this.head.nextName])) {
      if (condition(ptr.node)) extracted.pushBack(ptr.remove());
    }

    return extracted;
  }

  reverse() {
    let current = this.head;
    do {
      const next = current[this.head.nextName];
      current[this.head.nextName] = current[this.head.prevName];
      current[this.head.prevName] = next;
      current = next;
    } while (current !== this.head);
    return this;
  }

  sort(compareFn) {
    if (this.isOneOrEmpty) return this;

    const sortedNodes = Array.from(this).sort(compareFn);

    for (let i = 1; i < sortedNodes.length; i++) {
      const prev = sortedNodes[i - 1],
        current = sortedNodes[i];
      prev[this.head.nextName] = current;
      current[this.head.prevName] = prev;
    }

    const head = sortedNodes[0],
      tail = sortedNodes[sortedNodes.length - 1];
    tail[this.head.nextName] = head;
    head[this.head.prevName] = tail;

    this.head[this.head.nextName] = this.head[this.head.prevName] = this.head;
    splice(this.head, this.head, head);

    return this;
  }

  convertToHeadlessList() {
    this.head = extract(this.head, {from: this.head[this.head.nextName], to: this.head[this.head.prevName]});
    return this;
  }

  releaseAsHeadlessList() {
    const list = this.make();
    list.head = extract(this.head, {from: this.head[this.head.nextName], to: this.head[this.head.prevName]});
    return list;
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.head[this.head.nextName],
      readyToStop = this.isEmpty;
    return {
      next: () => {
        if (readyToStop && current === this.head) return {done: true};
        readyToStop = true;
        const value = current;
        current = current[this.head.nextName];
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
        let current = from || this.head[this.head.nextName],
          readyToStop = this.isEmpty;
        const stop = to ? to[this.head.nextName] : this.head;
        return {
          next: () => {
            if (readyToStop && current === stop) return {done: true};
            readyToStop = true;
            const value = current;
            current = current[this.head.nextName];
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
        let current = to || this.head[this.head.prevName],
          readyToStop = this.isEmpty;
        const stop = from ? from[this.head.prevName] : this.head;
        return {
          next: () => {
            if (readyToStop && current === stop) return {done: true};
            readyToStop = true;
            const value = current;
            current = current[this.head.prevName];
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
    return ListHead.from(this, this.head);
  }

  make(newHead = null) {
    return new ListHead(newHead, this.head);
  }

  makeFrom(values) {
    return ListHead.from(values, this.head);
  }

  static from(values, options) {
    const list = new ListHead(null, options);
    for (const value of values) list.pushBack(value);
    return list;
  }
}

Object.assign(ListHead, {pop, extract, splice, append, isNodeLike, isStandAlone, HeadNode, Ptr});
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
