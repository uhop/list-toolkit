import {ExtListBase, PtrBase} from './nodes.js';
import {pop, extract, splice, append} from './basics.js';
import {addAliases, mapIterator, normalizeIterator} from '../meta-utils.js';

/** Pointer for navigating and mutating an external doubly linked list. */
export class Ptr extends PtrBase {
  /**
   * @param {ExtList|Ptr} list - Owning list or another Ptr to copy.
   * @param {object} [node] - Target node.
   */
  constructor(list, node) {
    super(list, node, ExtList);
    this.node ||= this.list.head;
  }
  /**
   * Create a copy of this pointer.
   * @returns {Ptr} A new Ptr referencing the same list and node.
   */
  clone() {
    return new Ptr(this);
  }
}

/** External (headless) node-based doubly linked list. */
export class ExtList extends ExtListBase {
  /**
   * Create a pointer to a node in this list.
   * @param {object} [node] - Target node, or `undefined` for the head.
   * @returns {Ptr|null} A new Ptr, or `null` if the list is empty and no node given.
   */
  makePtr(node) {
    if (node && !this.isNodeLike(node)) throw new Error('"node" is not a compatible node');
    node ||= this.head;
    return node ? new Ptr(this, node) : null;
  }

  /**
   * Create a pointer to the node after `prev`.
   * @param {object} [prev] - Preceding node, or `undefined` for the front.
   * @returns {Ptr} A new Ptr.
   */
  makePtrFromPrev(prev) {
    if (prev && !this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');
    return new Ptr(this, prev ? prev[this.nextName] : this.front);
  }

  /**
   * Remove the current head node and advance to the next.
   * @returns {object|null} The removed node, or `null` if empty.
   */
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

  /**
   * Remove the node before the head.
   * @returns {object|null} The removed node, or `null` if empty.
   */
  removeNodeBefore() {
    return this.head ? this.removeNode(this.head[this.prevName]) : null;
  }

  /**
   * Remove the node after the head.
   * @returns {object|null} The removed node, or `null` if empty.
   */
  removeNodeAfter() {
    return this.head ? this.removeNode(this.head[this.nextName]) : null;
  }

  /**
   * Insert a value before the head.
   * @param {*} value - Value or node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addBefore(value) {
    const node = this.adoptValue(value);
    if (this.head) {
      splice(this, this.head[this.prevName], node);
    } else {
      this.head = node;
    }
    return this.makePtr(node);
  }

  /**
   * Insert a value after the head.
   * @param {*} value - Value or node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addAfter(value) {
    const node = this.adoptValue(value);
    if (this.head) {
      splice(this, this.head, node);
    } else {
      this.head = node;
    }
    return this.makePtr(node);
  }

  /**
   * Insert an existing node before the head.
   * @param {object} nodeOrPtr - Node or pointer to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addNodeBefore(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    if (this.head) {
      splice(this, this.head[this.prevName], node);
    } else {
      this.head = node;
    }
    return this.makePtr(node);
  }

  /**
   * Insert an existing node after the head.
   * @param {object} nodeOrPtr - Node or pointer to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addNodeAfter(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    if (this.head) {
      splice(this, this.head, node);
    } else {
      this.head = node;
    }
    return this.makePtr(node);
  }

  /**
   * Splice another external list's nodes before the head.
   * @param {ExtListBase} extList - Compatible external list to consume.
   * @returns {Ptr|null} A Ptr to the first inserted node, or `null` if empty.
   */
  insertBefore(extList) {
    if (!this.isCompatible(extList)) throw new Error('Incompatible lists');

    const head = extList.head;
    if (head) {
      splice(this, this.head[this.prevName], head);
      extList.head = null;
    }

    return this.makePtr(head);
  }

  /**
   * Splice another external list's nodes after the head.
   * @param {ExtListBase} extList - Compatible external list to consume.
   * @returns {Ptr|null} A Ptr to the first inserted node, or `null` if empty.
   */
  insertAfter(extList) {
    if (!this.isCompatible(extList)) throw new Error('Incompatible lists');

    const head = extList.head;
    if (head) {
      splice(this, this.head, head);
      extList.head = null;
    }

    return this.makePtr(head);
  }

  /**
   * Move a node to just before the head.
   * @param {object} nodeOrPtr - Node or pointer to move.
   * @returns {Ptr|ExtList} A Ptr to the moved node, or `this` if already at head.
   */
  moveBefore(nodeOrPtr) {
    const node = this.normalizeNode(nodeOrPtr);

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

    return this.makePtr(node);
  }

  /**
   * Move a node to just after the head.
   * @param {object} nodeOrPtr - Node or pointer to move.
   * @returns {Ptr|ExtList} A Ptr to the moved node, or `this` if already at head.
   */
  moveAfter(nodeOrPtr) {
    const node = this.normalizeNode(nodeOrPtr);

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

    return this.makePtr(node);
  }

  /**
   * Remove all nodes.
   * @param {boolean} [drop] - If `true`, make each removed node stand-alone.
   * @returns {ExtList} `this` for chaining.
   */
  clear(drop) {
    if (drop) {
      for (const current of this.getNodeIterator()) {
        current[this.nextName] = current[this.prevName] = current; // make stand-alone
      }
    }
    this.head = null;
    return this;
  }

  /**
   * Remove a node from the list.
   * @param {object} nodeOrPtr - Node or pointer to remove.
   * @returns {object|null} The removed node, or `null` if empty.
   */
  removeNode(nodeOrPtr) {
    if (!this.head) return null;

    const node = this.normalizeNode(nodeOrPtr);

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

  /**
   * Remove a range and optionally drop nodes.
   * @param {object} [range] - Range to remove.
   * @param {boolean} [drop] - If `true`, make each removed node stand-alone.
   * @returns {ExtList} A new ExtList containing the removed nodes.
   */
  removeRange(range, drop) {
    return this.extractRange(range).clear(drop);
  }

  /**
   * Extract a range into a new list.
   * @param {object} [range={}] - Range to extract (defaults to the whole list).
   * @returns {ExtList} A new ExtList containing the extracted nodes.
   */
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

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param {Function} condition - Predicate receiving each node.
   * @returns {ExtList} A new ExtList containing the extracted nodes.
   */
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

  /**
   * Reverse the order of all nodes in place.
   * @returns {ExtList} `this` for chaining.
   */
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

  /**
   * Sort nodes in place using merge sort.
   * @param {Function} lessFn - Returns `true` if `a` should precede `b`.
   * @returns {ExtList} `this` for chaining.
   */
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

  /** Iterate over nodes starting from the head. */
  [Symbol.iterator]() {
    let current = this.head,
      readyToStop = this.isEmpty;
    return normalizeIterator({
      next: () => {
        if (readyToStop && current === this.head) return {done: true};
        readyToStop = true;
        const value = current;
        current = current[this.nextName];
        return {value};
      }
    });
  }

  /**
   * Get an iterable over nodes in a range.
   * @param {object} [range={}] - Sub-range to iterate.
   * @returns {Iterable} An iterable iterator of nodes.
   */
  getNodeIterator(range = {}) {
    range = this.normalizeRange(range);
    const {from, to} = range;
    return {
      [Symbol.iterator]: () => {
        let readyToStop = this.isEmpty,
          current = readyToStop ? null : from || this.head;
        const stop = readyToStop ? null : to ? to[this.nextName] : this.head;
        return normalizeIterator({
          next: () => {
            if (readyToStop && current === stop) return {done: true};
            readyToStop = true;
            const value = current;
            current = current[this.nextName];
            return {value};
          }
        });
      }
    };
  }

  /**
   * Get an iterable of Ptr objects over a range.
   * @param {object} [range] - Sub-range to iterate.
   * @returns {Iterable} An iterable iterator of Ptrs.
   */
  getPtrIterator(range) {
    return mapIterator(this.getNodeIterator(range), node => new Ptr(this, node));
  }

  /**
   * Get an iterable over nodes in reverse order.
   * @param {object} [range={}] - Sub-range to iterate.
   * @returns {Iterable} An iterable iterator of nodes.
   */
  getReverseNodeIterator(range = {}) {
    range = this.normalizeRange(range);
    const {from, to} = range;
    return {
      [Symbol.iterator]: () => {
        let readyToStop = this.isEmpty,
          current = readyToStop ? null : to || this.head[this.prevName];
        const stop = readyToStop ? null : from ? from[this.prevName] : this.head[this.prevName];
        return normalizeIterator({
          next: () => {
            if (readyToStop && current === stop) return {done: true};
            readyToStop = true;
            const value = current;
            current = current[this.prevName];
            return {value};
          }
        });
      }
    };
  }

  /**
   * Get an iterable of Ptr objects in reverse order.
   * @param {object} [range] - Sub-range to iterate.
   * @returns {Iterable} An iterable iterator of Ptrs.
   */
  getReversePtrIterator(range) {
    return mapIterator(this.getReverseNodeIterator(range), node => new Ptr(this, node));
  }

  /**
   * Create a shallow clone of this list.
   * @returns {ExtList} A new ExtList pointing to the same head.
   */
  clone() {
    return new ExtList(this);
  }

  /**
   * Create an empty list with the same options.
   * @param {object|null} [head=null] - Optional initial head node.
   * @returns {ExtList} A new ExtList.
   */
  make(head = null) {
    return new ExtList(head, this);
  }

  /**
   * Create a list from values with the same options.
   * @param {Iterable} values - Iterable of node objects.
   * @returns {ExtList} A new ExtList.
   */
  makeFrom(values) {
    return ExtList.from(values, this);
  }

  /**
   * Build an ExtList from an iterable of node objects.
   * @param {Iterable} values - Iterable of nodes.
   * @param {object} [options] - Link property names.
   * @returns {ExtList} A new ExtList.
   */
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

addAliases(ExtList.prototype, {
  addAfter: 'add',
  removeNodeBefore: 'removeBefore',
  removeNodeAfter: 'removeAfter',
  getNodeIterator: 'getIterator',
  getReverseNodeIterator: 'getReverseIterator'
});

export default ExtList;
