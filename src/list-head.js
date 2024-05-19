'use strict';

import {addAliases} from './meta-utils.js';

export class ListNode {
  constructor({nextName = 'next', prevName = 'prev'} = {}) {
    this.nextName = nextName;
    this.prevName = prevName;
    this[nextName] = this[prevName] = this;
  }
}

export class ListHeadNode extends ListNode {}

export class UnsafeHead {
  constructor(head) {
    this.head = head;
  }
}

export const unsafe = head => new UnsafeHead(head);

// useful low-level operations on doubly linked lists

const pop = ({nextName, prevName}, head) => {
  const rest = head[nextName];
  head[prevName][nextName] = head[nextName];
  head[nextName][prevName] = head[prevName];
  head[prevName] = head[nextName] = head;
  return {node: head, list: rest};
};

const extract = ({nextName, prevName}, from, to = from) => {
  const prev = from[prevName],
    next = to[nextName];
  prev[nextName] = next;
  next[prevName] = prev;
  from[prevName] = to;
  to[nextName] = from;
  return from;
};

const splice = ({nextName, prevName}, head1, head2) => {
  const tail1 = head1[prevName],
    tail2 = head2[prevName];
  tail1[nextName] = head2;
  head2[prevName] = tail1;
  tail2[nextName] = head1;
  head1[prevName] = tail2;
  return head1;
};

const append = ({nextName, prevName}, target, from, to = from) => {
  // extract
  from[prevName][nextName] = to[nextName];
  to[nextName][prevName] = from[prevName];

  // splice
  const next = target[nextName];
  target[nextName] = from;
  from[prevName] = target;
  to[nextName] = next;
  next[prevName] = to;

  return target;
};

const isNodeLike = ({nextName, prevName}, node) => node && node[prevName] && node[nextName];
const isStandAlone = ({nextName, prevName}, node) => node && node[prevName] === node && node[nextName] === node;

export class ListPtr {
  constructor(list, node) {
    if (list instanceof ListPtr) {
      this.list = list.list;
      this.node = list.node;
    } else if (node instanceof ListPtr) {
      if (list !== node.list) throw new Error('Node specified by ListPtr must belong to the same list');
      this.list = list;
      this.node = node.node;
    } else {
      this.list = list;
      this.node = node || list.front;
    }
  }
  get isHead() {
    return this.node === this.list.head;
  }
  next() {
    this.node = this.node[this.list.nextName];
    return this;
  }
  prev() {
    this.node = this.node[this.list.prevName];
    return this;
  }
  clone() {
    return new ListPtr(this);
  }
  remove() {
    if (this.node === this.list) return null;
    const node = this.node;
    this.node = node[this.list.nextName];
    return pop(this.list, node).node;
  }
  addBefore(value) {
    splice(this.list, this.node, this.list.adopt(value));
    return this;
  }
  addAfter(value) {
    splice(this.list, this.node[this.list.nextName], this.list.adopt(value));
    return this;
  }
  insertBefore(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;
    const head = list.isHeadless ? list.head : pop(list, list.head).list;
    splice(this.list, this.node, head);
    return this;
  }
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;
    const head = list.isHeadless ? list.head : pop(list, list.head).list;
    splice(this.list, this.node[this.list.nextName], head);
    return this;
  }
}

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
    if (this.isNodeLike(head)) {
      this.head = head;
      return;
    }
    this.head = new ListHeadNode(this);
  }

  get isHeadless() {
    return !(this.head instanceof ListHeadNode);
  }

  get isEmpty() {
    return this.head instanceof ListHeadNode && this.head[this.nextName] === this.head;
  }

  get isOneNode() {
    return this.head instanceof ListHeadNode ? this.head[this.nextName] === this.head[this.prevName] : this.head[this.nextName] === this.head;
  }

  get front() {
    return this.head instanceof ListHeadNode ? this.head[this.nextName] : this.head;
  }

  get back() {
    return this.head[this.prevName];
  }

  get frontPtr() {
    return new ListPtr(this, this.front);
  }

  get backPtr() {
    return new ListPtr(this, this.back);
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
    return list instanceof ListHead && this.nextName === list.nextName && this.prevName === list.prevName;
  }

  makePtr(node) {
    return new ListPtr(this, node || this.front);
  }

  popFrontNode() {
    if (this.isHeadless) {
      const result = pop(this, this.head);
      this.head = result.node === result.list ? new ListHeadNode(this) : result.list;
      return result.node;
    }
    if (!this.isEmpty) return pop(this, this.head[this.nextName]).node;
  }

  popBackNode() {
    if (this.isHeadless) {
      const result = pop(this, this.head[this.prevName]);
      if (result.node === result.list) this.head = new ListHeadNode(this);
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
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    let head;
    if (list.isHeadless) {
      list = list.head;
      list.head = new ListHeadNode(list);
    } else {
      head = extract(this, list.head[this.nextName], list.head[this.prevName]);
    }

    if (this.isHeadless) {
      this.head = splice(this, head, this.head);
    } else {
      splice(this, this.head[this.nextName], head);
    }

    return this;
  }

  appendBack(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    let head;
    if (list.isHeadless) {
      list = list.head;
      list.head = new ListHeadNode(list);
    } else {
      head = extract(this, list.head[this.nextName], list.head[this.prevName]);
    }

    splice(this, this.head, head);

    return this;
  }

  moveToFront(node) {
    if (node instanceof ListPtr) {
      if (!this.isCompatible(node.list)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.isNodeLike(node)) throw new Error('Not a compatible node');
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
    if (node instanceof ListPtr) {
      if (!this.isCompatible(node.list)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.isNodeLike(node)) throw new Error('Not a compatible node');
    }

    if (this.head[this.prevName] === node) return this;
    splice(this, this.head, pop(this, node).node);

    return this;
  }

  clear(drop) {
    if (drop) {
      while (!this.isEmpty) this.popFront();
    } else {
      this.head = new ListHeadNode(this);
    }
    return this;
  }

  removeNode(node) {
    if (node instanceof ListPtr) {
      if (!this.isCompatible(node.list)) throw new Error('Incompatible lists');
      node = node.node;
    } else {
      if (!this.isNodeLike(node)) throw new Error('Not a compatible node');
    }
    pop(this, node);
    return this;
  }

  remove(from, to = from, drop) {
    this.extract(from, to).clear(drop);
    return this;
  }

  extract(from, to = from) {
    if (from instanceof ListPtr) {
      if (to instanceof ListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof ListPtr) to = to.node;
    }
    if (!this.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (!this.isNodeLike(to)) throw new Error('"to" is not a compatible node');
    return new ListHead(unsafe(splice(this, new ListHeadNode(this), extract(this, from, to))), this);
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    while (this.isEmpty && condition(this.front)) extracted.pushBack(this.popFront());
    if (this.isEmpty || this.isOneNode) return extracted;

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
    if (this.isEmpty || this.isOneNode) return this;

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
    this.head = extract(this, this.head[this.nextName], this.head[this.prevName]);
    return this;
  }

  releaseAsHeadlessList() {
    const list = this.make();
    if (this.isHeadless) {
      list.head = this.head;
      this.head = new ListHeadNode(this);
    } else {
      list.head = extract(this, this.head[this.nextName], this.head[this.prevName]);
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
    if (from instanceof ListPtr) {
      if (to instanceof ListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof ListPtr) to = to.node;
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

  getPtrIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        const nodeIterable = this.getNodeIterable(from, to)[Symbol.iterator]();
        return {
          next: () => {
            const result = nodeIterable.next();
            if (result.done) return result;
            return {value: new ListPtr(this, result.value)};
          }
        };
      }
    };
  }

  getReverseNodeIterable(from, to) {
    if (from instanceof ListPtr) {
      if (to instanceof ListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof ListPtr) to = to.node;
    }
    if (from && !this.isNodeLike(from)) throw new Error('"from" is not a compatible node');
    if (to && !this.isNodeLike(to)) throw new Error('"to" is not a compatible node');

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
            return {value: new ListPtr(this, result.value)};
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

Object.assign(ListHead, {pop, extract, splice, append, isNodeLike, isStandAlone, UnsafeHead, unsafe, Node: ListNode, HeadNode: ListHeadNode});
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
