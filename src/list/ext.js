'use strict';

import {ExtListBase, PtrBase} from './nodes.js';
import {pop, extract, splice, append} from './basics.js';
import {addAliases} from '../meta-utils.js';

export class Ptr extends PtrBase {
  constructor(list, node) {
    super(list, node, ExtList);
    this.node ||= this.list.head;
  }
  clone() {
    return new Ptr(this);
  }
}

export class ExtList extends ExtListBase {
  makePtr(node) {
    node ||= this.head;
    return node ? new Ptr(this, node) : null;
  }

  // Ptr API

  removeCurrent() {
    if (!this.head) return null;
    if (this.head[this.nextName] === this.head) {
      const node = this.head;
      this.head = null;
      return node;
    }
    const result = pop(this, this.head);
    this.head = result.rest;
    return result.extracted;
  }

  removeNodeBefore() {
    return this.head ? this.removeNode(this.head[this.prevName]) : null;
  }

  removeNodeAfter() {
    return this.head ? this.removeNode(this.head[this.nextName]) : null;
  }

  addBefore(value) {
    const node = this.adoptValue(value);
    if (this.head) {
      splice(this, this.head[this.prevName], node);
    } else {
      this.head = node;
    }
    return this.makePtr(node);
  }

  addAfter(value) {
    const node = this.adoptValue(value);
    if (this.head) {
      splice(this, this.head, node);
    } else {
      this.head = node;
    }
    return this.makePtr(node);
  }

  addNodeBefore(node) {
    node = this.adoptNode(node);
    if (this.head) {
      splice(this, this.head[this.prevName], node);
    } else {
      this.head = node;
    }
    return this.makePtr(node);
  }

  addNodeAfter(node) {
    node = this.adoptNode(node);
    if (this.head) {
      splice(this, this.head, node);
    } else {
      this.head = node;
    }
    return this.makePtr(node);
  }

  insertBefore(extList) {
    if (!this.isCompatible(extList)) throw new Error('Incompatible lists');

    const head = extList.head;
    if (head) {
      splice(this, this.head[this.prevName], head);
      extList.head = null;
    }

    return this.makePtr(head);
  }

  insertAfter(extList) {
    if (!this.isCompatible(extList)) throw new Error('Incompatible lists');

    const head = extList.head;
    if (head) {
      splice(this, this.head, head);
      extList.head = null;
    }

    return this.makePtr(head);
  }

  moveBefore(node) {
    node = this.normalizeNode(node);

    if (this.head === node) {
      this.head = this.head[this.nextName];
      return this;
    }

    if (this.head) {
      append(this, this.head[this.prevName], {from: node});
    } else {
      pop(this, node);
      this.head = node;
    }

    return this;
  }

  moveAfter(node) {
    node = this.normalizeNode(node);

    if (this.head === node) {
      this.head = this.head[this.prevName];
      return this;
    }

    if (this.head) {
      append(this, this.head, {from: node});
    } else {
      pop(this, node);
      this.head = node;
    }

    return this;
  }

  // List API

  clear(drop) {
    if (drop) {
      for (const current of this.getNodeIterator()) {
        current[this.nextName] = current[this.prevName] = current; // make stand-alone
      }
    }
    this.head = null;
    return this;
  }

  removeNode(node) {
    if (!this.head) return null;

    node = this.normalizeNode(node);

    if (this.head === node) {
      // remove head
      if (this.head[this.nextName] === this.head) {
        // single node
        this.head = null;
        return node;
      }
      this.head = this.head[this.nextName];
    }

    return pop(this, node).extracted;
  }

  removeRange(range, drop) {
    return this.extractRange(range).clear(drop);
  }

  extractRange(range = {}) {
    range = this.normalizeRange(range);
    const {from = this.head, to = from} = range;

    const extracted = this.make();
    if (!this.head) return extracted;
    if (this.head === from || this.head === to) this.head = to[this.nextName];
    if (this.head === from) this.head = null;
    extracted.head = extract(this, {from, to}).extracted;

    return extracted;
  }

  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    const rest = this.make();
    for (const current of this.getNodeIterator()) {
      current[this.nextName] = current[this.prevName] = current; // make stand-alone
      (condition(current) ? extracted : rest).addBefore(current);
    }
    this.head = rest.head;

    return extracted;
  }

  reverse() {
    if (this.isOneOrEmpty) return this;
    let current = this.head;
    do {
      const next = current[this.nextName];
      current[this.nextName] = current[this.prevName];
      current[this.prevName] = next;
      current = next;
    } while (current !== this.head);
    this.head = this.head[this.nextName];
    return this;
  }

  sort(lessFn) {
    if (this.isOneOrEmpty) return this;

    const left = this.make(),
      right = this.make();

    // split into two sublists
    let isLeft = true;
    for (const current of this.getNodeIterator()) {
      current[this.nextName] = current[this.prevName] = current; // make stand-alone
      if (isLeft) {
        left.addNodeAfter(current);
        left.next();
      } else {
        right.addNodeAfter(current);
        right.next();
      }
      isLeft = !isLeft;
    }
    this.clear();
    // the list is empty now

    // sort sublists
    left.next().sort(lessFn);
    right.next().sort(lessFn);

    // merge sublists
    while (!left.isEmpty && !right.isEmpty) {
      this.addNodeAfter((lessFn(left.head, right.head) ? left : right).removeCurrent());
      this.next();
    }
    if (!left.isEmpty) {
      const last = left.head[left.prevName];
      this.insertAfter(left);
      this.head = last;
    }
    if (!right.isEmpty) {
      const last = right.head[right.prevName];
      this.insertAfter(right);
      this.head = last;
    }

    return this.next();
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.head,
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

  getNodeIterator(range = {}) {
    range = this.normalizeRange(range);
    const {from, to} = range;
    return {
      [Symbol.iterator]: () => {
        let readyToStop = this.isEmpty,
          current = readyToStop ? null : from || this.head;
        const stop = readyToStop ? null : to ? to[this.nextName] : this.head;
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

  getPtrIterator(range) {
    return mapIterator(this.getNodeIterator(range), node => new Ptr(this, node));
  }

  getReverseNodeIterator(range = {}) {
    range = this.normalizeRange(range);
    const {from, to} = range;
    return {
      [Symbol.iterator]: () => {
        let readyToStop = this.isEmpty,
          current = readyToStop ? null : to || this.head[this.prevName];
        const stop = readyToStop ? null : from ? from[this.prevName] : this.head[this.prevName];
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

  getReversePtrIterator(range) {
    return mapIterator(this.getReverseNodeIterator(range), node => new Ptr(this, node));
  }

  // meta helpers

  clone() {
    return new ExtList(this);
  }

  make(head = null) {
    return new ExtList(head, this);
  }

  makeFrom(values) {
    return ExtList.from(values, this);
  }

  static from(values, options) {
    const list = new ExtList(null, options);
    for (const value of values) {
      list.addNodeAfter(value);
      list.next();
    }
    return list.next();
  }
}

ExtList.Ptr = Ptr;

addAliases(ExtList, {
  addAfter: 'add',
  removeNodeBefore: 'removeBefore',
  removeNodeAfter: 'removeAfter',
  getNodeIterator: 'getIterator',
  getReverseNodeIterator: 'getReverseIterator'
});

export default ExtList;
