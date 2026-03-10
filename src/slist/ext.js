import {ExtListBase, PtrBase} from './nodes.js';
import {pop, extract, splice} from './basics.js';
import {addAliases, normalizeIterator} from '../meta-utils.js';

/** Pointer for navigating and mutating an external singly linked list. */
export class Ptr extends PtrBase {
  /**
   * @param {ExtSList|Ptr} list - Owning list or another Ptr to copy.
   * @param {object} [node] - Target node.
   * @param {object} [prev] - Node preceding the target.
   */
  constructor(list, node, prev) {
    super(list, node, prev, ExtSList);
  }
  /**
   * Create a copy of this pointer.
   * @returns {Ptr} A new Ptr referencing the same list and node.
   */
  clone() {
    return new Ptr(this);
  }
}

/** External (headless) node-based singly linked list. */
export class ExtSList extends ExtListBase {
  /** A pointer-based range spanning all nodes, or `null` if empty. */
  get ptrRange() {
    return this.head ? {from: this.makePtr(), to: this.head, list: this.head} : null;
  }

  /**
   * Create a pointer to a node in this list.
   * @param {object} [node] - Target node, or `undefined` for the head.
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
    return new Ptr(this, null, prev || this.head);
  }

  /**
   * Remove the node after the head.
   * @returns {object|null} The removed node, or `null` if empty.
   */
  removeNodeAfter() {
    return this.head ? this.removeNode(this.makePtr()) : null;
  }

  /**
   * Insert a value after the head.
   * @param {*} value - Value or node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addAfter(value) {
    const node = this.adoptValue(value);
    if (this.head) {
      splice(this, this.head, {prevFrom: node});
    } else {
      this.head = node;
    }
    return this.makePtr();
  }

  /**
   * Insert an existing node after the head.
   * @param {object} node - Node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addNodeAfter(node) {
    node = this.adoptNode(node);
    if (this.head) {
      splice(this, this.head, {prevFrom: node});
    } else {
      this.head = node;
    }
    return this.makePtr();
  }

  /**
   * Splice another external list's nodes after the head.
   * @param {ExtListBase} extList - Compatible external list to consume.
   * @returns {Ptr} A Ptr to the first inserted node.
   */
  insertAfter(extList) {
    if (!this.isCompatible(extList)) throw new Error('Incompatible lists');

    const head = extList.head;
    if (head) {
      splice(this, this.head, {prevFrom: head, to: head});
      extList.head = null;
    }

    return this.makePtr();
  }

  /**
   * Move a node to just after the head.
   * @param {Ptr} ptr - Pointer to the node to move.
   * @returns {Ptr|ExtSList} A Ptr to the moved node, or `this`.
   */
  moveAfter(ptr) {
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    ptr.list = this;

    if (!this.head) {
      this.head = pop(this, ptr.prevNode).extracted.to;
      return this;
    }

    if (this.head === ptr.prevNode) return this;

    if (this.head === ptr.prevNode[this.nextName]) {
      if (this.head === this.head[this.nextName]) return this;
      this.head = this.head[this.nextName];
    }

    ptr.prevNode = splice(this, this.head, {prevFrom: pop(this, ptr.prevNode).extracted.to});

    return ptr.clone();
  }

  /**
   * Remove all nodes.
   * @param {boolean} [drop] - If `true`, make each removed node stand-alone.
   * @returns {ExtSList} `this` for chaining.
   */
  clear(drop) {
    if (drop) {
      for (const current of this.getNodeIterator()) {
        current[this.nextName] = current; // make stand-alone
      }
    }
    this.head = null;
    return this;
  }

  /**
   * Remove the node at a pointer position.
   * @param {Ptr} ptr - Pointer whose current node to remove.
   * @returns {object|null} The removed node, or `null` if empty.
   */
  removeNode(ptr) {
    if (!this.head) return null;
    if (!this.isCompatiblePtr(ptr)) throw new Error('Incompatible pointer');
    if (this.head === ptr.prevNode[this.nextName]) {
      if (this.head === this.head[this.nextName]) {
        this.head = null;
        return ptr.prevNode[this.nextName];
      }
      this.head = this.head[this.nextName];
    }
    return pop(this, ptr.prevNode).extracted.to;
  }

  /**
   * Remove a pointer-based range and optionally drop nodes.
   * @param {object} [ptrRange] - Range to remove.
   * @param {boolean} [drop] - If `true`, make each removed node stand-alone.
   * @returns {ExtSList} A new ExtSList containing the removed nodes.
   */
  removeRange(ptrRange, drop) {
    return this.extractRange(ptrRange).clear(drop);
  }

  /**
   * Extract a pointer-based range into a new list.
   * @param {object} [ptrRange={}] - Range to extract (defaults to the whole list).
   * @returns {ExtSList} A new ExtSList containing the extracted nodes.
   */
  extractRange(ptrRange = {}) {
    ptrRange = this.normalizePtrRange(ptrRange.from ? ptrRange : {...ptrRange, from: this.makePtr()});
    ptrRange.to ||= this.head;

    const prevFrom = ptrRange.from.prevNode,
      to = ptrRange.to,
      extracted = this.make();
    if (!this.head) return extracted;
    if (this.head === prevFrom[this.nextName] || this.head === to) this.head = to[this.nextName];
    if (this.head === prevFrom[this.nextName]) this.head = null;
    extracted.head = extract(this, {prevFrom, to}).extracted.prevFrom[this.nextName];

    return extracted;
  }

  /**
   * Extract nodes that satisfy a condition into a new list.
   * @param {Function} condition - Predicate receiving each node.
   * @returns {ExtSList} A new ExtSList containing the extracted nodes.
   */
  extractBy(condition) {
    const extracted = this.make();
    if (this.isEmpty) return extracted;

    const rest = this.make();
    for (const current of this.getNodeIterator()) {
      current[this.nextName] = current; // make stand-alone
      if (condition(current)) {
        extracted.addAfter(current);
        extracted.next();
      } else {
        rest.addAfter(current);
        rest.next();
      }
    }
    extracted.next();
    rest.next();

    this.head = rest.head;

    return extracted;
  }

  /**
   * Reverse the order of all nodes in place.
   * @returns {ExtSList} `this` for chaining.
   */
  reverse() {
    if (this.isOneOrEmpty) return this;

    let prev = this.head,
      current = prev[this.nextName];
    do {
      const next = current[this.nextName];
      current[this.nextName] = prev;
      prev = current;
      current = next;
    } while (current !== this.head);
    this.head[this.nextName] = prev;

    this.head = this.head[this.nextName];

    return this;
  }

  /**
   * Sort nodes in place using merge sort.
   * @param {Function} lessFn - Returns `true` if `a` should precede `b`.
   * @returns {ExtSList} `this` for chaining.
   */
  sort(lessFn) {
    if (this.isOneOrEmpty) return this;

    const leftHead = {},
      rightHead = {};
    leftHead[this.nextName] = leftHead;
    rightHead[this.nextName] = rightHead;

    const left = this.make(leftHead),
      right = this.make(rightHead);

    // split into two sublists
    let isLeft = true;
    for (const current of this.getNodeIterator()) {
      current[this.nextName] = current; // make stand-alone
      if (isLeft) {
        left.addNodeAfter(current);
        left.next();
      } else {
        right.addNodeAfter(current);
        right.next();
      }
      isLeft = !isLeft;
    }
    left.removeNodeAfter(); // remove the head node
    right.removeNodeAfter(); // remove the head node
    this.clear();
    // the list is empty now

    // sort sublists
    left.next().sort(lessFn);
    right.next().sort(lessFn);

    // merge sublists
    const leftIterator = left.getNodeIterator()[Symbol.iterator](),
      rightIterator = right.getNodeIterator()[Symbol.iterator]();
    let leftItem = leftIterator.next(),
      rightItem = rightIterator.next();
    while (!leftItem.done && !rightItem.done) {
      let node;
      if (lessFn(leftItem.value, rightItem.value)) {
        node = leftItem.value;
        leftItem = leftIterator.next();
      } else {
        node = rightItem.value;
        rightItem = rightIterator.next();
      }
      node[this.nextName] = node; // make stand-alone
      this.addNodeAfter(node);
      this.next();
    }
    for (; !leftItem.done; this.next(), leftItem = leftIterator.next()) {
      const node = leftItem.value;
      node[this.nextName] = node; // make stand-alone
      this.addNodeAfter(node);
    }
    for (; !rightItem.done; this.next(), rightItem = rightIterator.next()) {
      const node = rightItem.value;
      node[this.nextName] = node; // make stand-alone
      this.addNodeAfter(node);
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
   * Get an iterable of Ptr objects over a pointer range.
   * @param {object} [ptrRange={}] - Sub-range to iterate.
   * @returns {Iterable} An iterable iterator of Ptrs.
   */
  getPtrIterator(ptrRange = {}) {
    if (!ptrRange.from) ptrRange = Object.assign({from: this.makePtr(this.head)}, ptrRange);
    ptrRange = this.normalizePtrRange(ptrRange);
    const {from: fromPtr, to} = ptrRange;
    return {
      [Symbol.iterator]: () => {
        let current = fromPtr.clone(),
          readyToStop = this.isEmpty;
        const stop = to ? to[this.nextName] : this.head;
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
   * Create a shallow clone of this list.
   * @returns {ExtSList} A new ExtSList pointing to the same head.
   */
  clone() {
    return new ExtSList(this);
  }

  /**
   * Create an empty list with the same options.
   * @param {object|null} [head=null] - Optional initial head node.
   * @returns {ExtSList} A new ExtSList.
   */
  make(head = null) {
    return new ExtSList(head, this);
  }

  /**
   * Create a list from values with the same options.
   * @param {Iterable} values - Iterable of node objects.
   * @returns {ExtSList} A new ExtSList.
   */
  makeFrom(values) {
    return ExtSList.from(values, this);
  }

  /**
   * Build an ExtSList from an iterable of node objects.
   * @param {Iterable} values - Iterable of nodes.
   * @param {object} [options] - Link property names.
   * @returns {ExtSList} A new ExtSList.
   */
  static from(values, options) {
    const list = new ExtSList(null, options);
    for (const value of values) {
      list.addNodeAfter(value);
      list.next();
    }
    return list.next();
  }
}

ExtSList.Ptr = Ptr;

addAliases(ExtSList.prototype, {
  addAfter: 'add',
  removeNodeAfter: 'removeAfter',
  getNodeIterator: 'getIterator'
});

export default ExtSList;
