import {addAliases, normalizeIterator} from '../meta-utils.js';
import {ExtListBase, HeadNode} from './nodes.js';
import {append} from './basics.js';
import Ptr from './ptr.js';

/** Hosted node-based singly linked list with a sentinel head. */
export class SList extends HeadNode {
  /** Pointer to the first node. */
  get frontPtr() {
    return new Ptr(this);
  }

  /** A pointer-based range spanning all nodes, or `null` if empty. */
  get ptrRange() {
    return this.isEmpty ? null : {from: new Ptr(this), to: this.last};
  }

  /**
   * Create a pointer to a node in this list.
   * @param {object} [node] - Target node, or `undefined` for the front.
   * @returns {Ptr} A new Ptr.
   */
  makePtr(node) {
    if (node && !this.isNodeLike(node)) throw new Error('"node" is not a compatible node');
    return new Ptr(this, node);
  }

  /**
   * Create a pointer to the node after `prev`.
   * @param {object} [prev] - Preceding node, or `undefined` for the head.
   * @returns {Ptr} A new Ptr.
   */
  makePtrFromPrev(prev) {
    if (prev && !this.isNodeLike(prev)) throw new Error('"prev" is not a compatible node');
    return new Ptr(this, null, prev || this);
  }

  /**
   * Remove and return the front node.
   * @returns {object|undefined} The removed node, or `undefined` if empty.
   */
  popFrontNode() {
    if (this[this.nextName] === this) return undefined;
    const node = this[this.nextName];
    this[this.nextName] = node[this.nextName];
    if (this[this.nextName] === this) this.last = this;
    return (node[this.nextName] = node);
  }

  /**
   * Insert a value at the front.
   * @param {*} value - Node or value to insert.
   * @returns {Ptr} A Ptr to the front.
   */
  pushFront(value) {
    const node = this.adoptValue(value);
    node[this.nextName] = this[this.nextName];
    this[this.nextName] = node;
    if (node[this.nextName] === this) this.last = node;
    return this.makePtr();
  }

  /**
   * Insert a value at the back.
   * @param {*} value - Node or value to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  pushBack(value) {
    const node = this.adoptValue(value);
    node[this.nextName] = this;
    const last = this.last;
    this.last = last[this.nextName] = node;
    return this.makePtrFromPrev(last);
  }

  /**
   * Insert an existing node at the front.
   * @param {object} nodeOrPtr - Node or pointer to insert.
   * @returns {Ptr} A Ptr to the front.
   */
  pushFrontNode(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    node[this.nextName] = this[this.nextName];
    this[this.nextName] = node;
    if (node[this.nextName] === this) this.last = node;
    return this.makePtr();
  }

  /**
   * Insert an existing node at the back.
   * @param {object} nodeOrPtr - Node or pointer to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  pushBackNode(nodeOrPtr) {
    const node = this.adoptNode(nodeOrPtr);
    node[this.nextName] = this;
    const last = this.last;
    this.last = last[this.nextName] = node;
    return this.makePtrFromPrev(last);
  }

  /**
   * Move all nodes from another list to the front.
   * @param {HeadNode} list - Compatible list to consume.
   * @returns {Ptr} A Ptr to the new front.
   */
  appendFront(list) {
    if (!this.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    list.last[this.nextName] = this[this.nextName];
    this[this.nextName] = list[this.nextName];
    if (list.last[this.nextName] === this) this.last = list.last;

    list[this.nextName] = list.last = list; // clear the list
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

    this.last[this.nextName] = list[this.nextName];
    list.last[this.nextName] = this;

    const last = this.last;
    this.last = list.last;

    list[this.nextName] = list.last = list; // clear the list
    return this.makePtrFromPrev(last);
  }

  /**
   * Move a node (identified by pointer) to the front.
   * @param {Ptr} ptr - Pointer to the node to move.
   * @returns {Ptr|SList} A Ptr to the front, or `this` if at head.
   */
  moveToFront(ptr) {
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    ptr.list = this;
    if (ptr.isHead) return this;
    const node = ptr.removeCurrent();
    ptr.prevNode = this;
    return this.pushFrontNode(node);
  }

  /**
   * Move a node (identified by pointer) to the back.
   * @param {Ptr} ptr - Pointer to the node to move.
   * @returns {Ptr|SList} A Ptr to the back, or `this` if at head.
   */
  moveToBack(ptr) {
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    ptr.list = this;
    if (ptr.isHead) return this;
    const node = ptr.removeCurrent();
    ptr.prevNode = this.last;
    return this.pushBackNode(node);
  }

  /**
   * Remove all nodes.
   * @param {boolean} [drop] - If `true`, make each removed node stand-alone.
   * @returns {SList} `this` for chaining.
   */
  clear(drop) {
    if (drop) {
      let current = this;
      do {
        const next = current[this.nextName];
        current[this.nextName] = current;
        current = next;
      } while (current !== this);
    } else {
      this[this.nextName] = this;
    }
    this.last = this;
    return this;
  }

  /**
   * Remove the node at a pointer position.
   * @param {Ptr} ptr - Pointer whose current node to remove.
   * @returns {object|null} The removed node, or `null` if at head.
   */
  removeNode(ptr) {
    if (!ptr.isPrevNodeValid()) throw new Error('Cannot remove node: "prevNode" is invalid');
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    const node = ptr.prevNode[this.nextName];
    if (node === this || node === ptr.prevNode) return null;
    if (this.last === node) this.last = ptr.prevNode;
    ptr.prevNode[this.nextName] = node[this.nextName];
    ptr.list = this;
    node[this.nextName] = node;
    return node;
  }

  /**
   * Remove a pointer-based range and optionally drop nodes.
   * @param {object} [ptrRange] - Range to remove.
   * @param {boolean} [drop] - If `true`, make each removed node stand-alone.
   * @returns {SList} A new SList containing the removed nodes.
   */
  removeRange(ptrRange, drop) {
    return this.extractRange(ptrRange).clear(drop);
  }

  /**
   * Extract a pointer-based range into a new list.
   * @param {object} [ptrRange={}] - Range to extract (defaults to the whole list).
   * @returns {SList} A new SList containing the extracted nodes.
   */
  extractRange(ptrRange = {}) {
    const originalTo = ptrRange.to;
    ptrRange = this.normalizePtrRange(ptrRange.from ? ptrRange : {...ptrRange, from: this.frontPtr});
    if (!ptrRange.from.isPrevNodeValid()) throw new Error('Cannot extract range: "prevNode" is invalid');
    ptrRange.to ||= this.last;

    const extracted = this.make();
    append(this, extracted, {prevFrom: ptrRange.from.prevNode, to: ptrRange.to});
    extracted.last = ptrRange.to;
    ptrRange.from.list = extracted;
    if (originalTo instanceof Ptr) originalTo.list = extracted;

    if (ptrRange.to === this.last) this.last = ptrRange.from.prevNode;

    return extracted;
  }

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param {Function} condition - Predicate receiving each node.
   * @returns {SList} A new SList containing the extracted nodes.
   */
  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    for (const ptr = this.frontPtr; !ptr.isHead; ) {
      if (condition(ptr.node)) {
        extracted.pushBackNode(ptr.removeCurrent());
      } else {
        ptr.next();
      }
    }
    return extracted;
  }

  /**
   * Reverse the order of all nodes in place.
   * @returns {SList} `this` for chaining.
   */
  reverse() {
    if (this.isOneOrEmpty) return this;
    this.last = this[this.nextName];
    let prev = this,
      current = prev[this.nextName];
    do {
      const next = current[this.nextName];
      current[this.nextName] = prev;
      prev = current;
      current = next;
    } while (current !== this);
    this[this.nextName] = prev;
    return this;
  }

  /**
   * Sort nodes in place using merge sort.
   * @param {Function} lessFn - Returns `true` if `a` should precede `b`.
   * @returns {SList} `this` for chaining.
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
   * Detach all nodes as a pointer range.
   * @returns {object|null} A pointer range, or `null` if empty.
   */
  releaseAsPtrRange() {
    if (this.isEmpty) return null;
    const head = this[this.nextName],
      tail = this.last;
    this.clear();
    tail[this.nextName] = head;
    return {from: new Ptr(this, null, tail), to: tail};
  }

  /**
   * Detach all nodes as a raw circular list.
   * @returns {object|null} Head of the raw circular list, or `null` if empty.
   */
  releaseRawList() {
    if (this.isEmpty) return null;
    const head = this[this.nextName],
      tail = this.last;
    this.clear();
    tail[this.nextName] = head;
    return head;
  }

  /**
   * Detach all nodes as a null-terminated list.
   * @returns {{head: object, tail: object}|null} Object with `head` and `tail`, or `null` if empty.
   */
  releaseNTList() {
    if (this.isEmpty) return null;
    const head = this[this.nextName],
      tail = this.last;
    this.clear();
    tail[this.nextName] = null;
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
   * Get an iterable of Ptr objects over a pointer range.
   * @param {object} [ptrRange={}] - Sub-range to iterate.
   * @returns {Iterable} An iterable iterator of Ptrs.
   */
  getPtrIterator(ptrRange = {}) {
    if (!ptrRange.from) ptrRange = Object.assign({from: this.frontPtr}, ptrRange);
    ptrRange = this.normalizePtrRange(ptrRange);
    const {from: fromPtr, to} = ptrRange;
    return {
      [Symbol.iterator]: () => {
        let current = fromPtr.clone(),
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this;
        return normalizeIterator({
          next: () => {
            if (readyToStop && current.node === stop) return {done: true};
            readyToStop = true;
            const value = current.clone();
            current = current.next();
            return {value};
          }
        });
      }
    };
  }

  /**
   * Create an empty list with the same options.
   * @returns {SList} A new empty SList.
   */
  make() {
    return new SList(this);
  }

  /**
   * Create a list from values with the same options.
   * @param {Iterable} values - Iterable of node objects.
   * @returns {SList} A new SList.
   */
  makeFrom(values) {
    return SList.from(values, this);
  }

  /**
   * Create a list from a range with the same options.
   * @param {object} range - Range to copy.
   * @returns {SList} A new SList.
   */
  makeFromRange(range) {
    return SList.fromRange(range, this);
  }

  /**
   * Build an SList from an iterable of node objects.
   * @param {Iterable} values - Iterable of nodes.
   * @param {object} [options] - Link property names.
   * @returns {SList} A new SList.
   */
  static from(values, options) {
    const list = new SList(options);
    for (const value of values) list.pushBack(value);
    return list;
  }

  /**
   * Build an SList from a pointer range.
   * @param {object} ptrRange - Pointer range to copy.
   * @param {object} [options] - Link property names.
   * @returns {SList} A new SList.
   */
  static fromPtrRange(ptrRange, options) {
    const list = new SList(options);
    ptrRange = list.normalizePtrRange(ptrRange);
    if (ptrRange) append(list, list, ptrRange);
    return list;
  }

  /**
   * Build an SList from an external list, consuming it.
   * @param {ExtListBase} extList - External list to consume.
   * @returns {SList} A new SList.
   */
  static fromExtList(extList) {
    if (!(extList instanceof ExtListBase)) throw new Error('Not a circular list');

    const list = new SList(extList);
    if (extList.isEmpty) return list;

    const range = extList.range;
    if (range) {
      append(list, list, range);
      extList.clear();
    }

    return list;
  }
}

SList.Ptr = Ptr;

addAliases(SList.prototype, {
  popFrontNode: 'popFront, pop',
  pushFront: 'push',
  appendBack: 'append',
  getNodeIterator: 'getIterator'
});

export {Ptr};
export default SList;
