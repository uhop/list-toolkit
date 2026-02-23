import {isRangeLike, normalizeNode, normalizeRange} from '../list-helpers.js';
import {addAlias, copyDescriptors, canHaveProps} from '../meta-utils.js';

/**
 * Check whether a node has valid next and prev links.
 * @param {object} options - Link property names.
 * @param {object} node - Node to check.
 * @returns {boolean} `true` if the node has truthy next and prev links.
 */
export const isNodeLike = ({nextName, prevName}, node) => node && node[prevName] && node[nextName];
/**
 * Check whether a node points to itself (stand-alone).
 * @param {object} options - Link property names.
 * @param {object} node - Node to check.
 * @returns {boolean} `true` if the node's next and prev links point to itself.
 */
export const isStandAlone = ({nextName, prevName}, node) => node && node[prevName] === node && node[nextName] === node;
/**
 * Check whether two option sets share the same link property names.
 * @param {object} options1 - First options.
 * @param {object} options2 - Second options.
 * @returns {boolean} `true` if `nextName` and `prevName` match.
 */
export const isCompatible = (options1, options2) => options1.nextName === options2.nextName && options1.prevName === options2.prevName;

/** Doubly linked list node with circular self-links. */
export class Node {
  /** @param {object} [options] - Link property names. */
  constructor({nextName = 'next', prevName = 'prev'} = {}) {
    this.nextName = nextName;
    this.prevName = prevName;
    this[nextName] = this[prevName] = this;
  }
  /** Whether this node's next link points to itself. */
  get isStandAlone() {
    return this[this.nextName] === this;
  }
}

/** Sentinel head node for hosted doubly linked lists. */
export class HeadNode extends Node {
  /**
   * Check whether a value looks like a compatible node.
   * @param {*} node - Value to check.
   * @returns {boolean} `true` if the value has valid next and prev links.
   */
  isNodeLike(node) {
    if (!node) return false;
    const next = node[this.nextName];
    if (!next || canHaveProps[typeof next] !== 1) return false;
    const prev = node[this.prevName];
    return prev && canHaveProps[typeof prev] === 1;
  }

  /**
   * Check whether another options object shares the same link names.
   * @param {object} options - Options to compare.
   * @returns {boolean} `true` if `nextName` and `prevName` match.
   */
  isCompatibleNames({nextName, prevName}) {
    return this.nextName === nextName && this.prevName === prevName;
  }

  /**
   * Check whether another list is compatible with this one.
   * @param {object} list - List to compare.
   * @returns {boolean} `true` if compatible.
   */
  isCompatible(list) {
    return list === this || (list instanceof HeadNode && this.nextName === list.nextName && this.prevName === list.prevName);
  }

  /**
   * Check whether a pointer belongs to a compatible list.
   * @param {PtrBase} ptr - Pointer to check.
   * @returns {boolean} `true` if compatible.
   */
  isCompatiblePtr(ptr) {
    return (
      ptr instanceof PtrBase &&
      (ptr.list === this || (ptr.list instanceof HeadNode && this.nextName === ptr.list.nextName && this.prevName === ptr.list.prevName))
    );
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

  /** The last node before the head. */
  get back() {
    return this[this.prevName];
  }

  /** A range spanning all nodes, or `null` if empty. */
  get range() {
    return this[this.nextName] === this ? null : {from: this[this.nextName], to: this[this.prevName], list: this};
  }

  /**
   * Count the number of nodes.
   * @returns {number} The node count.
   */
  getLength() {
    let n = 0;
    const nextName = this.nextName;
    for (let p = this[nextName]; p !== this; ++n, p = p[nextName]);
    return n;
  }

  /**
   * Adopt a node or pointer, making it stand-alone if needed.
   * @param {object} nodeOrPtr - Node or pointer to adopt.
   * @returns {object} The adopted node.
   */
  adoptNode(nodeOrPtr) {
    const node = nodeOrPtr instanceof PtrBase ? nodeOrPtr.node : nodeOrPtr;
    if (node[this.nextName] || node[this.prevName]) {
      if (node[this.nextName] === node && node[this.prevName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node[this.prevName] = node;
    if (nodeOrPtr instanceof PtrBase) nodeOrPtr.list = this;
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
}

addAlias(HeadNode.prototype, 'adoptNode', 'adoptValue');

/** Value wrapper node for doubly linked lists. */
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

/** Base class for DLL pointers providing navigation. */
export class PtrBase {
  /**
   * @param {PtrBase|HeadNode|ExtListBase} list - Owning list or another PtrBase to copy.
   * @param {object} [node] - Target node.
   * @param {Function} [ListClass] - Expected list constructor for validation.
   */
  constructor(list, node, ListClass) {
    if (list instanceof PtrBase) {
      this.list = list.list;
      this.node = list.node;
      return;
    }
    if (!(list instanceof ListClass)) throw new Error('"list" is not a compatible list');
    if (node instanceof PtrBase) {
      if (list !== node.list) throw new Error('Node specified by a pointer must belong to the same list');
      this.list = list;
      this.node = node.node;
    } else {
      this.list = list;
      this.node = node;
    }
    if (this.node && !isNodeLike(this.list, this.node)) throw new Error('"node" is not a compatible node');
    if (!this.node) this.node = this.list.front;
  }

  /** The node after the current node. */
  get nextNode() {
    return this.node[this.list.nextName];
  }

  /** The node before the current node. */
  get prevNode() {
    return this.node[this.list.prevName];
  }

  /**
   * Check whether the prevNode link is valid. Always `true` for DLL pointers.
   * @returns {boolean} `true`.
   */
  isPrevNodeValid() {
    return true;
  }

  /**
   * Advance to the next node.
   * @returns {PtrBase} `this` for chaining.
   */
  next() {
    this.node = this.node[this.list.nextName];
    return this;
  }

  /**
   * Move to the previous node.
   * @returns {PtrBase} `this` for chaining.
   */
  prev() {
    this.node = this.node[this.list.prevName];
    return this;
  }
}

/** Base class for external (headless) doubly linked lists. */
export class ExtListBase {
  /**
   * @param {object|ExtListBase|PtrBase|null} [head=null] - Initial head node, ExtListBase, or PtrBase.
   * @param {object} [options] - Link property names.
   */
  constructor(head = null, {nextName = 'next', prevName = 'prev'} = {}) {
    if (head instanceof ExtListBase) {
      this.nextName = head.nextName;
      this.prevName = head.prevName;
      this.attach(head.head);
      return;
    }
    if (head instanceof PtrBase) {
      this.nextName = head.list.nextName;
      this.prevName = head.list.prevName;
      this.attach(head.node);
      return;
    }
    this.nextName = nextName;
    this.prevName = prevName;
    this.attach(head);
  }

  /**
   * Check whether another list is compatible.
   * @param {object} list - List to compare.
   * @returns {boolean} `true` if compatible.
   */
  isCompatible(list) {
    return list === this || (list instanceof ExtListBase && this.nextName === list.nextName && this.prevName === list.prevName);
  }

  /**
   * Check whether a pointer belongs to a compatible list.
   * @param {PtrBase} ptr - Pointer to check.
   * @returns {boolean} `true` if compatible.
   */
  isCompatiblePtr(ptr) {
    return (
      ptr instanceof PtrBase &&
      (ptr.list === this || (ptr.list instanceof ExtListBase && this.nextName === ptr.list.nextName && this.prevName === ptr.list.prevName))
    );
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

  /** The last node, or `undefined` if empty. */
  get back() {
    return this.head?.[this.prevName];
  }

  /** A range spanning all nodes, or `null` if empty. */
  get range() {
    return this.head ? {from: this.head, to: this.head[this.prevName], list: this.head} : null;
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

  /**
   * Move the head to the previous node.
   * @returns {ExtListBase} `this` for chaining.
   */
  prev() {
    if (this.head) this.head = this.head[this.prevName];
    return this;
  }
}

copyDescriptors(ExtListBase.prototype, HeadNode.prototype, [
  'isNodeLike',
  'isCompatibleNames',
  'isCompatibleRange',
  'normalizeNode',
  'normalizeRange',
  'adoptNode',
  'adoptValue'
]);
