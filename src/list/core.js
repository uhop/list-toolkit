import {ExtListBase, HeadNode} from './nodes.js';
import {pop, splice, append} from './basics.js';
import Ptr from './ptr.js';
import {addAliases, mapIterator, normalizeIterator} from '../meta-utils.js';

/** Hosted node-based doubly linked list with a sentinel head. */
export class List extends HeadNode {
  /** Pointer to the first node. */
  get frontPtr() {
    return new Ptr(this, this.front);
  }

  /** Pointer to the last node. */
  get backPtr() {
    return new Ptr(this, this.back);
  }

  /**
   * Create a pointer to a node in this list.
   * @param {object} [node] - Target node, or `undefined` for the front.
   * @returns {Ptr} A new Ptr.
   */
  makePtr(node) {
    if (node && !this.isNodeLike(node)) throw new Error('"node" is not a compatible node');
    return new Ptr(this, node || this.front);
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
   * Insert a value at the front.
   * @param {*} value - Node or value to insert.
   * @returns {Ptr} A Ptr to the front.
   */
  pushFront(value) {
    const node = this.adoptValue(value);
    splice(this, this, node);
    return this.makePtr(node);
  }

  /**
   * Insert a value at the back.
   * @param {*} value - Node or value to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  pushBack(value) {
    const node = this.adoptValue(value);
    splice(this, this[this.prevName], node);
    return this.makePtr(node);
  }

  /**
   * Remove and return the front node.
   * @returns {object|undefined} The removed node, or `undefined` if empty.
   */
  popFrontNode() {
    if (!this.isEmpty) return pop(this, this[this.nextName]).extracted;
  }

  /**
   * Remove and return the back node.
   * @returns {object|undefined} The removed node, or `undefined` if empty.
   */
  popBackNode() {
    if (!this.isEmpty) return pop(this, this[this.prevName]).extracted;
  }

  /**
   * Insert an existing node at the front.
   * @param {object} nodeOrPtr - Node or pointer to insert.
   * @returns {Ptr} A Ptr to the front.
   */
  pushFrontNode(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    splice(this, this, node);
    return this.makePtr(node);
  }

  /**
   * Insert an existing node at the back.
   * @param {object} nodeOrPtr - Node or pointer to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  pushBackNode(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    splice(this, this[this.prevName], node);
    return this.makePtr(node);
  }

  /**
   * Move all nodes from another list to the front.
   * @param {HeadNode} list - Compatible list to consume.
   * @returns {Ptr} A Ptr to the new front.
   */
  appendFront(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const head = list[this.nextName];
    append(this, this, {from: head, to: list[this.prevName]});

    return this.makePtr();
  }

  /**
   * Move all nodes from another list to the back.
   * @param {HeadNode} list - Compatible list to consume.
   * @returns {Ptr} A Ptr to the first appended node.
   */
  appendBack(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const head = list[this.nextName];
    append(this, this[this.prevName], {from: head, to: list[this.prevName]});

    return this.makePtr(head);
  }

  /**
   * Move a node to the front.
   * @param {object} nodeOrPtr - Node or pointer to move.
   * @returns {Ptr} A Ptr to the front.
   */
  moveToFront(nodeOrPtr) {
    const node = this.normalizeNode(nodeOrPtr);
    if (this[this.nextName] !== node) {
      splice(this, this, pop(this, node).extracted);
    }
    return this.frontPtr;
  }

  /**
   * Move a node to the back.
   * @param {object} nodeOrPtr - Node or pointer to move.
   * @returns {Ptr} A Ptr to the back.
   */
  moveToBack(nodeOrPtr) {
    const node = this.normalizeNode(nodeOrPtr);
    if (this[this.prevName] !== node) {
      splice(this, this[this.prevName], pop(this, node).extracted);
    }
    return this.backPtr;
  }

  /**
   * Remove all nodes.
   * @param {boolean} [drop] - If `true`, make each removed node stand-alone.
   * @returns {List} `this` for chaining.
   */
  clear(drop) {
    if (drop) {
      while (!this.isEmpty) this.popFrontNode();
    } else {
      this[this.nextName] = this[this.prevName] = this;
    }
    return this;
  }

  /**
   * Remove a node from the list.
   * @param {object} nodeOrPtr - Node or pointer to remove.
   * @returns {object} The removed node.
   */
  removeNode(nodeOrPtr) {
    return pop(this, this.normalizeNode(nodeOrPtr)).extracted;
  }

  /**
   * Remove a range and optionally drop nodes.
   * @param {object} [range] - Range to remove.
   * @param {boolean} [drop] - If `true`, make each removed node stand-alone.
   * @returns {List} A new List containing the removed nodes.
   */
  removeRange(range, drop) {
    return this.extractRange(range).clear(drop);
  }

  /**
   * Extract a range into a new list.
   * @param {object} [range={}] - Range to extract (defaults to the whole list).
   * @returns {List} A new List containing the extracted nodes.
   */
  extractRange(range = {}) {
    range = this.normalizeRange(range);
    range.from ||= this.front;
    range.to ||= this.back;
    return append(this, this.make(), range);
  }

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param {Function} condition - Predicate receiving each node.
   * @returns {List} A new List containing the extracted nodes.
   */
  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    while (!this.isEmpty && condition(this.front)) extracted.pushBack(this.popFrontNode());
    if (this.isOneOrEmpty) return extracted;

    for (const ptr of this.getPtrIterator({from: this.front[this.nextName]})) {
      if (condition(ptr.node)) extracted.pushBack(ptr.removeCurrent());
    }

    return extracted;
  }

  /**
   * Reverse the order of all nodes in place.
   * @returns {List} `this` for chaining.
   */
  reverse() {
    let current = this;
    do {
      const next = current[this.nextName];
      current[this.nextName] = current[this.prevName];
      current[this.prevName] = next;
      current = next;
    } while (current !== this);
    return this;
  }

  /**
   * Sort nodes in place using merge sort.
   * @param {Function} lessFn - Returns `true` if `a` should precede `b`.
   * @returns {List} `this` for chaining.
   */
  sort(lessFn) {
    if (this.isOneOrEmpty) return this;

    const left = this.make(),
      right = this.make();

    // split into two sublists
    for (let isLeft = true; !this.isEmpty; isLeft = !isLeft) {
      (isLeft ? left : right).pushBackNode(this.popFrontNode());
    }
    // the list is empty now

    // sort sublists
    left.sort(lessFn);
    right.sort(lessFn);

    // merge sublists
    while (!left.isEmpty && !right.isEmpty) {
      this.pushBackNode((lessFn(left.front, right.front) ? left : right).popFrontNode());
    }
    if (!left.isEmpty) this.appendBack(left);
    if (!right.isEmpty) this.appendBack(right);

    return this;
  }

  /**
   * Detach all nodes as a raw circular list.
   * @returns {object|null} Head of the raw circular list, or `null` if empty.
   */
  releaseRawList() {
    return this.isEmpty ? null : pop(this, this).rest;
  }

  /**
   * Detach all nodes as a null-terminated list.
   * @returns {{head: object, tail: object}|null} Object with `head` and `tail`, or `null` if empty.
   */
  releaseNTList() {
    if (this.isEmpty) return null;
    const head = this[this.nextName],
      tail = this[this.prevName];
    this.clear();
    head[this.prevName] = tail[this.nextName] = null;
    return {head, tail};
  }

  /**
   * Validate that a range is reachable within this list.
   * @param {object} [range={}] - Range to validate.
   * @returns {boolean} `true` if the range is valid.
   */
  validateRange(range = {}) {
    range = this.normalizeRange(range);
    let current = range.from;
    do {
      if (current === this) return false;
      current = current[this.nextName];
    } while (current !== range.to);
    return true;
  }

  /** Iterate over nodes from front to back. */
  [Symbol.iterator]() {
    let current = this[this.nextName],
      readyToStop = this.isEmpty;
    return normalizeIterator({
      next: () => {
        if (readyToStop && current === this) return {done: true};
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
        let current = from || this[this.nextName],
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this;
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
        let current = to || this[this.prevName],
          readyToStop = this.isEmpty;
        const stop = from ? from[this.prevName] : this;
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
   * Create an empty list with the same options.
   * @returns {List} A new empty List.
   */
  make() {
    return new List(this);
  }

  /**
   * Create a list from values with the same options.
   * @param {Iterable} values - Iterable of node objects.
   * @returns {List} A new List.
   */
  makeFrom(values) {
    return List.from(values, this);
  }

  /**
   * Create a list from a range with the same options.
   * @param {object} range - Range to copy.
   * @returns {List} A new List.
   */
  makeFromRange(range) {
    return List.fromRange(range, this);
  }

  /**
   * Build a List from an iterable of node objects.
   * @param {Iterable} values - Iterable of nodes.
   * @param {object} [options] - Link property names.
   * @returns {List} A new List.
   */
  static from(values, options) {
    const list = new List(options);
    for (const value of values) list.pushBack(value);
    return list;
  }

  /**
   * Build a List from a range.
   * @param {object} range - Range to copy.
   * @param {object} [options] - Link property names.
   * @returns {List} A new List.
   */
  static fromRange(range, options) {
    const list = new List(options);
    if (!range) return list;

    range = list.normalizeRange(range);
    if (!range.from || !range.to) throw new Error('"range" should be fully specified');

    return append(list, list, range);
  }

  /**
   * Build a List from an external list, consuming it.
   * @param {ExtListBase} extList - External list to consume.
   * @returns {List} A new List.
   */
  static fromExtList(extList) {
    if (!(extList instanceof ExtListBase)) throw new Error('Not a circular list');

    const list = new List(extList);
    if (extList.isEmpty) return list;

    splice(list, list, extList.head);
    extList.clear();

    return list;
  }
}

List.Ptr = Ptr;

addAliases(List.prototype, {
  popFrontNode: 'popFront, pop',
  popBackNode: 'popBack',
  pushFront: 'push',
  getNodeIterator: 'getIterator',
  getReverseNodeIterator: 'getReverseIterator',
  appendBack: 'append'
});

export {Ptr};
export default List;
