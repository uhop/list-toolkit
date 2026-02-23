import {isRangeLike, normalizeNode, normalizeRange, normalizePtrRange} from '../list-helpers.js';
import {addAlias, copyDescriptors, canHaveProps} from '../meta-utils.js';

/**
 * Check whether a node has a valid next link.
 * @param {object} options - Link property names.
 * @param {object} node - Node to check.
 * @returns {boolean} `true` if the node has a truthy next link.
 */
export const isNodeLike = ({nextName}, node) => node && node[nextName];

/**
 * Check whether a node points to itself (stand-alone).
 * @param {object} options - Link property names.
 * @param {object} node - Node to check.
 * @returns {boolean} `true` if the node's next link points to itself.
 */
export const isStandAlone = ({nextName}, node) => node && node[nextName] === node;

/**
 * Check whether two option sets share the same next link property name.
 * @param {object} options1 - First options.
 * @param {object} options2 - Second options.
 * @returns {boolean} `true` if `nextName` matches.
 */
export const isCompatible = (options1, options2) => options1.nextName === options2.nextName;

/** Singly linked list node with a circular self-link. */
export class Node {
  /** @param {object} [options] - Link property names. */
  constructor({nextName = 'next'} = {}) {
    this.nextName = nextName;
    this[nextName] = this;
  }
  /** Whether this node's next link points to itself. */
  get isStandAlone() {
    return this[this.nextName] === this;
  }
}

/** Sentinel head node for hosted singly linked lists. */
export class HeadNode extends Node {
  /** @param {object} [options] - Link property names. */
  constructor(options) {
    super(options);
    this.last = this;
  }
  /**
   * Check whether a value looks like a compatible node.
   * @param {*} node - Value to check.
   * @returns {boolean} `true` if the value has a valid next link.
   */
  isNodeLike(node) {
    if (!node) return false;
    const next = node[this.nextName];
    return next && canHaveProps[typeof next] === 1;
  }
  /**
   * Check whether another options object shares the same link name.
   * @param {object} options - Options to compare.
   * @returns {boolean} `true` if `nextName` matches.
   */
  isCompatibleNames({nextName}) {
    return this.nextName === nextName;
  }
  /**
   * Check whether another list is compatible with this one.
   * @param {object} list - List to compare.
   * @returns {boolean} `true` if compatible.
   */
  isCompatible(list) {
    return list === this || (list instanceof HeadNode && this.nextName === list.nextName);
  }
  /**
   * Check whether a pointer belongs to a compatible list.
   * @param {PtrBase} ptr - Pointer to check.
   * @returns {boolean} `true` if compatible.
   */
  isCompatiblePtr(ptr) {
    return ptr instanceof PtrBase && (ptr.list === this || (ptr.list instanceof HeadNode && this.nextName === ptr.list.nextName));
  }
  /**
   * Check whether a range is compatible with this list.
   * @param {object} [range] - Range to validate.
   * @returns {boolean} `true` if compatible.
   */
  isCompatibleRange(range) {
    return isRangeLike(this, range, PtrBase);
  }

  /** Whether the list has no nodes. */
  get isEmpty() {
    return this[this.nextName] === this;
  }

  /** Whether the list has exactly one node. */
  get isOne() {
    return this[this.nextName] !== this && this[this.nextName][this.nextName] === this;
  }

  /** Whether the list has zero or one node. */
  get isOneOrEmpty() {
    return this[this.nextName][this.nextName] === this;
  }

  /** The head sentinel itself. */
  get head() {
    return this;
  }

  /** The first node after the head. */
  get front() {
    return this[this.nextName];
  }

  /** The last node in the list. */
  get back() {
    return this.last;
  }

  /** A range spanning all nodes, or `null` if empty. */
  get range() {
    return this[this.nextName] === this ? null : {from: this[this.nextName], to: this.last, list: this};
  }

  /**
   * Count the number of nodes.
   * @returns {number} The node count.
   */
  getLength() {
    let n = 0;
    for (let p = this[this.nextName]; p !== this; ++n, p = p[this.nextName]);
    return n;
  }

  /**
   * Adopt a node or pointer, making it stand-alone if needed.
   * @param {object} nodeOrPtr - Node or pointer to adopt.
   * @returns {object} The adopted node.
   */
  adoptNode(nodeOrPtr) {
    const isPtr = nodeOrPtr instanceof PtrBase;
    if (isPtr && !this.isCompatiblePtr(nodeOrPtr)) throw new Error('Incompatible pointer');
    const node = isPtr ? nodeOrPtr.node : nodeOrPtr;
    if (node[this.nextName]) {
      if (node[this.nextName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node;
    if (isPtr) {
      nodeOrPtr.list = this;
      nodeOrPtr.prevNode = node;
    }
    return node;
  }

  /**
   * Normalize a node or pointer to a plain node.
   * @param {object|null} nodeOrPtr - Node or pointer.
   * @returns {object|null} The underlying node, or `null`.
   */
  normalizeNode(nodeOrPtr) {
    const node = normalizeNode(this, nodeOrPtr, PtrBase);
    if (nodeOrPtr instanceof PtrBase) nodeOrPtr.list = this;
    return node;
  }

  /**
   * Normalize a range, resolving any pointers to nodes.
   * @param {object} [range] - Range to normalize.
   * @returns {object|null} The normalized range, or `null`.
   */
  normalizeRange(range) {
    return normalizeRange(this, range, PtrBase);
  }

  /**
   * Normalize a pointer-based range.
   * @param {object} [range] - Pointer range to normalize.
   * @returns {object|null} The normalized pointer range, or `null`.
   */
  normalizePtrRange(range) {
    return normalizePtrRange(this, range, PtrBase);
  }

  /**
   * Recalculate the `last` pointer by traversing the list.
   * @returns {HeadNode} `this` for chaining.
   */
  syncLast() {
    this.last = this;
    while (this.last[this.nextName] !== this) this.last = this.last[this.nextName];
    return this;
  }
}

addAlias(HeadNode.prototype, 'adoptNode', 'adoptValue');

/** Value wrapper node for singly linked lists. */
export class ValueNode extends Node {
  /**
   * @param {*} value - Value to wrap.
   * @param {object} [options] - Link property names.
   */
  constructor(value, options) {
    super(options);
    this.value = value;
  }
}

/** Base class for SLL pointers providing navigation. */
export class PtrBase {
  /**
   * @param {PtrBase|HeadNode|ExtListBase} list - Owning list or another PtrBase to copy.
   * @param {object} [node] - Target node.
   * @param {object} [prev] - Node preceding the target.
   * @param {Function} [ListClass] - Expected list constructor for validation.
   */
  constructor(list, node, prev, ListClass) {
    if (list instanceof PtrBase) {
      this.list = list.list;
      this.node = list.node;
      this.prevNode = list.prevNode;
      return;
    }
    if (!(list instanceof ListClass)) throw new Error('"list" is not a compatible list');
    if (node instanceof PtrBase) {
      if (list !== node.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.node = node.node;
      this.prevNode = node.prevNode;
    } else {
      this.list = list;
      this.node = node;
      this.prevNode = prev;
    }
    // check nodes
    if (this.node && !isNodeLike(this.list, this.node)) throw new Error('"node" is not a compatible node');
    if (this.prevNode && !isNodeLike(this.list, this.prevNode)) throw new Error('"prev" is not a compatible node');
    // initialize missing nodes
    if (this.node) {
      if (!this.prevNode) this.prevNode = this.node;
    } else {
      if (!this.prevNode) this.prevNode = this.list.head;
      if (this.prevNode) this.node = this.prevNode[this.list.nextName];
    }
  }
  /** The node after the current node. */
  get nextNode() {
    return this.node[this.list.nextName];
  }
  /**
   * Check whether the prevNode link is valid.
   * @returns {boolean} `true` if prevNode's next points to the current node.
   */
  isPrevNodeValid() {
    if (!this.prevNode) this.prevNode = this.node;
    if (this.prevNode[this.list.nextName] === this.node) return true;
    this.prevNode = this.node;
    if (this.prevNode[this.list.nextName] === this.node) return true;
    this.prevNode = this.prevNode[this.list.nextName];
    if (this.prevNode[this.list.nextName] === this.node) return true;
    this.prevNode = this.list.head;
    if (this.prevNode[this.list.nextName] === this.node) return true;
    this.prevNode = this.node;
    return false;
  }
  /**
   * Advance to the next node.
   * @returns {PtrBase} `this` for chaining.
   */
  next() {
    this.prevNode = this.node;
    this.node = this.node[this.list.nextName];
    return this;
  }
  /**
   * Move to the previous node (requires valid prevNode).
   * @returns {PtrBase} `this` for chaining.
   */
  prev() {
    if (!this.isPrevNodeValid()) throw new Error('Cannot get previous node: "prevNode" is invalid');
    this.node = this.prevNode;
    return this;
  }
  /**
   * Synchronize prevNode by traversing the list if needed.
   * @returns {PtrBase} `this` for chaining.
   */
  syncPrev() {
    if (this.isPrevNodeValid()) return this;
    this.prevNode = this.node;
    do {
      const next = this.prevNode[this.list.nextName];
      if (next === this.node) break;
      this.prevNode = next;
    } while (this.prevNode !== this.node);
    return this;
  }
}

/** Base class for external (headless) singly linked lists. */
export class ExtListBase {
  /**
   * @param {object|ExtListBase|PtrBase|null} [head=null] - Initial head node, ExtListBase, or PtrBase.
   * @param {object} [options] - Link property names.
   */
  constructor(head = null, {nextName = 'next'} = {}) {
    if (head instanceof ExtListBase) {
      this.nextName = head.nextName;
      this.attach(head.head);
      return;
    }
    if (head instanceof PtrBase) {
      this.nextName = head.list.nextName;
      this.attach(head.node);
      return;
    }
    this.nextName = nextName;
    this.attach(head);
  }

  /**
   * Check whether another list is compatible.
   * @param {object} list - List to compare.
   * @returns {boolean} `true` if compatible.
   */
  isCompatible(list) {
    return list === this || (list instanceof ExtListBase && this.nextName === list.nextName);
  }

  /**
   * Check whether a pointer belongs to a compatible list.
   * @param {PtrBase} ptr - Pointer to check.
   * @returns {boolean} `true` if compatible.
   */
  isCompatiblePtr(ptr) {
    return ptr instanceof PtrBase && (ptr.list === this || (ptr.list instanceof ExtListBase && this.nextName === ptr.list.nextName));
  }

  /** Whether the list has no nodes. */
  get isEmpty() {
    return !this.head;
  }

  /** Whether the list has exactly one node. */
  get isOne() {
    return this.head && this.head[this.nextName] === this.head;
  }

  /** Whether the list has zero or one node. */
  get isOneOrEmpty() {
    return !this.head || this.head[this.nextName] === this.head;
  }

  /** The head node, or `null` if empty. */
  get front() {
    return this.head;
  }

  /** A range spanning all nodes, or `null` if empty. */
  get range() {
    return this.head ? {from: this.head[this.nextName], to: this.head, list: this.head} : null;
  }

  /**
   * Count the number of nodes.
   * @returns {number} The node count.
   */
  getLength() {
    if (!this.head) return 0;

    let n = 0,
      current = this.head;
    do {
      current = current[this.nextName];
      ++n;
    } while (current !== this.head);

    return n;
  }

  /**
   * Find the last node by traversing the list.
   * @returns {object|null} The last node, or `null` if empty.
   */
  getBack() {
    if (!this.head) return null;
    for (let current = this.head; ; ) {
      const next = current[this.nextName];
      if (next === this.head) return current;
      current = next;
    }
    // unreachable
  }

  /**
   * Set a new head node.
   * @param {object|PtrBase|null} [head=null] - New head node, pointer, or `null`.
   * @returns {object|null} The previous head node.
   */
  attach(head = null) {
    const oldHead = this.head;
    if (head instanceof PtrBase) {
      if (!this.isCompatible(head.list)) throw new Error('Incompatible lists');
      this.head = head.node;
    } else {
      if (head && !this.isNodeLike(head)) throw new Error('"head" is not a compatible node');
      this.head = head;
    }
    return oldHead;
  }

  /**
   * Remove the head reference without modifying nodes.
   * @returns {object|null} The previous head node.
   */
  detach() {
    const oldHead = this.head;
    this.head = null;
    return oldHead;
  }

  /**
   * Advance the head to the next node.
   * @returns {ExtListBase} `this` for chaining.
   */
  next() {
    if (this.head) this.head = this.head[this.nextName];
    return this;
  }
}

copyDescriptors(ExtListBase.prototype, HeadNode.prototype, [
  'isNodeLike',
  'isCompatibleNames',
  'isCompatibleRange',
  'normalizeNode',
  'normalizeRange',
  'normalizePtrRange',
  'adoptNode',
  'adoptValue'
]);
