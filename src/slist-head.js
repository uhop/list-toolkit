'use strict';

import {addAliases} from './meta-utils.js';

export class SListNode {
  constructor({nextName = 'next'} = {}) {
    this.nextName = nextName;
    this[nextName] = this;
  }
}

export class SListHeadNode extends SListNode {}

export class UnsafeHead {
  constructor(head) {
    this.head = head;
  }
}

export const unsafe = head => new UnsafeHead(head);

// useful low-level operations on singly linked lists

const pop = ({nextName}, prev) => {
  const node = prev[nextName];
  prev[nextName] = node[nextName];
  node[nextName] = node;
  return {node, list: prev};
};

const extract = ({nextName}, {prevFrom, to = prevFrom[nextName]}) => {
  const node = prevFrom[nextName];
  prevFrom[nextName] = to[nextName]; // exclude the range
  to[nextName] = node; // circle the range making node a list head
  return {prevFrom: to, to};
};

const splice = ({nextName}, target, {prevFrom, to = prevFrom[nextName]}) => {
  const tail = target[nextName];
  target[nextName] = prevFrom[nextName];
  prevFrom[nextName] = to[nextName]; // exclude the range
  to[nextName] = tail;
  return target;
};

const append = ({nextName}, target, {prevFrom, to = prevFrom[nextName]}) => {
  const head = prevFrom[nextName],
    next = target[nextName];
  prevFrom[nextName] = to[nextName]; // exclude the range
  // include the range
  target[nextName] = head;
  to[nextName] = next;
  return target;
};

const isNodeLike = ({nextName}, node) => node && node[nextName];
const isStandAlone = ({nextName}, node) => node && node[nextName] === node;

export class SListPtr {
  constructor(list, prev) {
    if (list instanceof SListPtr) {
      this.list = list.list;
      this.prev = list.prev;
    } else if (prev instanceof SListPtr) {
      if (list !== prev.list) throw new Error('Node specified by SListPtr must belong to the same list');
      this.list = list;
      this.prev = prev.prev;
    } else {
      this.list = list;
      this.prev = prev || list;
    }
  }

  get node() {
    return this.prev[this.list.nextName];
  }
  get isHead() {
    return this.prev[this.list.nextName] === this.list.head;
  }
  next() {
    this.prev = this.prev[this.list.nextName];
    return this;
  }
  clone() {
    return new SListPtr(this);
  }
  remove() {
    const node = this.prev[this.list.nextName];
    if (node === this.list || node === this.prev) return null;
    this.prev[this.list.nextName] = node[this.list.nextName];
    node[this.list.nextName] = node;
    return node;
  }
  addBefore(value) {
    splice(this.list, this.prev, {prevFrom: this.list.adopt(value)});
    return this;
  }
  addAfter(value) {
    splice(this.list, this.prev[this.list.nextName], {prevFrom: this.list.adopt(value)});
    return this;
  }
  insertBefore(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;
    const head = list.isHeadless ? list.head : pop(list, list.head).list;
    splice(this.list, this.prev, {prevFrom: head, to: head});
    return this;
  }
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;
    const head = list.isHeadless ? list.head : pop(list, list.head).list;
    splice(this.list, this.prev[this.list.nextName], {prevFrom: head, to: head});
    return this;
  }
}

export class SListHead {
  constructor(head, {nextName = 'next'} = {}) {
    if (head instanceof SListHead) {
      this.nextName = head.nextName;
      this.head = head.head;
      return;
    }
    this.nextName = nextName;
    if (head instanceof UnsafeHead) {
      this.head = head.head;
      return;
    }
    if (this.isNodeLike(head)) {
      this.head = head;
      return;
    }
    this.head = new SListHeadNode(this);
  }

  get isHeadless() {
    return !(this.head instanceof SListHeadNode);
  }

  get isEmpty() {
    return this.head instanceof SListHeadNode && this.head[this.nextName] === this.head;
  }

  get isOneNode() {
    if (this.head instanceof SListHeadNode) {
      const front = this.head[this.nextName];
      return front !== this.head && front[this.nextName] === this.head;
    }
    return this.head[this.nextName] === this.head;
  }

  get front() {
    return this.head instanceof SListHeadNode ? this.head[this.nextName] : this.head;
  }

  get frontPtr() {
    return this.head instanceof SListHeadNode ? new SListPtr(this, this.head) : null;
  }

  getLength() {
    let n = 0;
    for (let p = this.head[this.nextName]; p !== this.head; ++n, p = p[this.nextName]);
    if (this.isHeadless) ++n;
    return n;
  }

  isNodeLike(node) {
    return isNodeLike(this, node);
  }

  isCompatible(list) {
    return this === list || (list instanceof SListHead && this.nextName === list.nextName);
  }

  makePtr(prev) {
    return new SListPtr(this, prev || (this.isHeadless ? null : this.head));
  }

  popFrontNode() {
    if (this.isHeadless) throw new Error('Cannot pop from headless list');
    if (!this.isEmpty) return pop(this, this.head).node;
  }

  pushFrontNode(node) {
    if (this.isHeadless) throw new Error('Cannot push to headless list');
    splice(this, this.head, {prevFrom: this.adopt(node)});
    return this;
  }

  moveToFront(ptr) {
    if (!this.isCompatible(ptr.list)) throw new Error('Incompatible lists');
    if (this.isHeadless) throw new Error('Cannot move to headless list');
    if (!ptr.isHead) splice(this, this.head, {prevFrom: ptr.prev});
    return this;
  }

  clear(drop) {
    if (drop) {
      const wasHeadless = this.isHeadless;
      let current = this.head;
      do {
        const next = current[this.nextName];
        current[this.nextName] = current;
        current = next;
      } while (current !== this.head);
    } else {
      this.head = new SListHeadNode(this);
    }
    return this;
  }

  remove(fromPtr, to = fromPtr, drop) {
    this.extract(fromPtr, to).clear(drop);
    return this;
  }

  extract(fromPtr, to = fromPtr) {
    if (!this.isCompatible(fromPtr.list)) throw new Error('Incompatible lists');
    if (to instanceof SListPtr) {
      if (fromPtr.list !== to.list) throw new Error("Range specified by SListPtr's must belong to the same list");
      to = to.node;
    }
    return new SListHead(unsafe(splice(this, new SListHeadNode(this), extract(this, {prevFrom: fromPtr.prev, to}))), this);
  }

  extractBy(condition) {
    const extracted = new SListHeadBuilder(this);
    if (this.isEmpty) return extracted;

    const wasHeadless = this.isHeadless,
      rest = new SListHeadBuilder(this);

    let current = this.front;
    do {
      const next = current[this.nextName];
      (condition(current) ? extracted : rest).pushBack(current);
      current = next;
    } while (current !== this.head);

    if (wasHeadless) {
      const head = rest.head[this.nextName];
      rest.last = head;
      rest.head = head;
    }
    this.head = rest.head;

    return extracted;
  }

  reverse() {
    if (this.isEmpty || this.isOneNode) return this;
    let prev = this.head,
      current = prev[this.nextName];
    do {
      const next = current[this.nextName];
      current[this.nextName] = prev;
      prev = current;
      current = next;
    } while (current !== this.head);
    this.head[this.nextName] = prev;
    if (this.isHeadless) this.head = this.head[this.nextName];
    return this;
  }

  sort(compareFn) {
    if (this.isEmpty || this.isOneNode) return this;

    const sortedNodes = Array.from(this).sort(compareFn);

    for (let i = 1; i < sortedNodes.length; i++) {
      const prev = sortedNodes[i - 1],
        current = sortedNodes[i];
      prev[this.nextName] = current;
    }

    const head = sortedNodes[0],
      tail = sortedNodes[sortedNodes.length - 1];

    if (this.isHeadless) {
      this.head = tail[this.nextName] = head;
    } else {
      this.head[this.nextName] = head;
      tail[this.nextName] = this.head;
    }

    return this;
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
    if (from instanceof SListPtr) {
      if (to instanceof SListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by pointers must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof SListPtr) to = to.node;
    }
    if (from && !this.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

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

  getPtrIterable(fromPtr, to) {
    if (!fromPtr && this.isHeadless) throw new Error('"fromPtr" is required for headless lists');
    fromPtr ??= this.frontPtr;
    if (!this.isCompatible(fromPtr.list)) throw new Error('"fromPtr" is not compatible with this list');

    if (to instanceof SListPtr) {
      if (fromPtr.list !== to.list) throw new Error('Range specified by pointers must belong to the same list');
      to = to.node;
    }
    from = from.node;
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

    return {
      [Symbol.iterator]: () => {
        let current = fromPtr.clone(),
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this.head;
        return {
          next: () => {
            if (readyToStop && current.node === stop) return {done: true};
            readyToStop = true;
            const value = current.clone();
            current = current.next();
            return {value};
          }
        };
      }
    };
  }

  adopt(node) {
    if (node[this.nextName]) {
      if (node[this.nextName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node;
    return node;
  }

  // meta helpers

  clone() {
    return SListHead.from(this, this);
  }

  make(newHead = null) {
    return new SListHead(newHead, this);
  }

  makeFrom(values) {
    return SListHead.from(values, this);
  }

  static from(values, options) {
    const list = new SListHeadBuilder(options);
    for (const value of values) list.pushBack(value);
    return list;
  }
}

export class SListHeadBuilder extends SListHead {
  constructor(options) {
    super(null, options);
    this.last = this.head;
  }

  get range() {
    return {prevFrom: this.head, to: this.last};
  }

  get rangePtr() {
    return {prevFrom: new SListPtr(this), to: this.last};
  }

  syncLast() {
    let current = this.head;
    do {
      this.last = current;
      current = current[this.nextName];
    } while (current !== this.head);
    return this;
  }

  pushBackNode(node) {
    this.adopt(node);
    node[this.nextName] = this.last[this.nextName];
    this.last = this.last[this.nextName] = node;
    return this;
  }
}

Object.assign(SListHead, {pop, extract, splice, append, isNodeLike, isStandAlone, UnsafeHead, unsafe, Node: SListNode, HeadNode: SListHeadNode});
addAliases(SListHead, {popFrontNode: 'popFront, pop', pushFrontNode: 'pushFront, push', getNodeIterable: 'getIterable'});
addAliases(SListHeadBuilder, {pushBackNode: 'pushBack'});

export default SListHead;
