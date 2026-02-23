import {HeadNode, PtrBase} from './nodes.js';
import {pop, splice} from './basics.js';

/** Pointer for navigating and mutating a hosted singly linked list. */
export class Ptr extends PtrBase {
  /**
   * @param {HeadNode|Ptr} list - Owning list or another Ptr to copy.
   * @param {object} [node] - Target node.
   * @param {object} [prev] - Node preceding the target.
   */
  constructor(list, node, prev) {
    super(list, node, prev, HeadNode);
  }

  /** Whether the pointer is at the head sentinel. */
  get isHead() {
    return this.node === this.list;
  }
  /**
   * Create a copy of this pointer.
   * @returns {Ptr} A new Ptr referencing the same list and node.
   */
  clone() {
    return new Ptr(this);
  }
  /**
   * Remove the current node and advance to the next.
   * @returns {object|null} The removed node, or `null` if at head.
   */
  removeCurrent() {
    if (!this.isPrevNodeValid()) throw new Error('Current node cannot be removed: "prevNode" is invalid');
    if (this.node === this.list || this.node === this.prevNode) return null;
    if (this.list.last === this.node) this.list.last = this.prevNode;
    const node = pop(this.list, this.prevNode).extracted.to;
    this.node = this.prevNode[this.list.nextName];
    return node;
  }
  /**
   * Insert a value before the current node.
   * @param {*} value - Value or node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addBefore(value) {
    if (!this.isPrevNodeValid()) throw new Error('Cannot be added before: "prevNode" is invalid');
    const node = this.list.adoptValue(value),
      prev = splice(this.list, this.prevNode, {prevFrom: node});
    this.prevNode = node;
    if (this.list.last === this.list) this.list.last = node;
    return this.list.makePtr(prev);
  }
  /**
   * Insert an existing node before the current node.
   * @param {object} node - Node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addNodeBefore(node) {
    if (!this.isPrevNodeValid()) throw new Error('Cannot be added before: "prevNode" is invalid');
    node = this.list.adoptNode(node);
    const prev = splice(this.list, this.prevNode, {prevFrom: node});
    this.prevNode = node;
    if (this.list.last === this.list) this.list.last = node;
    return this.list.makePtr(prev);
  }
  /**
   * Insert a value after the current node.
   * @param {*} value - Value or node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addAfter(value) {
    const node = this.list.adoptValue(value),
      prev = splice(this.list, this.node, {prevFrom: node});
    return this.list.makePtr(prev);
  }
  /**
   * Insert an existing node after the current node.
   * @param {object} node - Node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addNodeAfter(node) {
    node = this.list.adoptNode(node);
    const prev = splice(this.list, this.node, {prevFrom: node});
    return this.list.makePtr(prev);
  }
  /**
   * Splice another list's nodes before the current node.
   * @param {HeadNode} list - Compatible list to consume.
   * @returns {Ptr} A Ptr to the first inserted node, or `this` if empty.
   */
  insertBefore(list) {
    if (!this.isPrevNodeValid()) throw new Error('Cannot be inserted before: "prevNode" is invalid');
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const prev = splice(this.list, this.prevNode, {prevFrom: list, to: list.last});
    if (this.list.last === this.list) this.list.last = list.last;
    this.prevNode = list.last;

    list.last = list;

    return this.list.makePtr(prev);
  }
  /**
   * Splice another list's nodes after the current node.
   * @param {HeadNode} list - Compatible list to consume.
   * @returns {Ptr} A Ptr to the first inserted node, or `this` if empty.
   */
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return this;

    const prev = splice(this.list, this.prevNode[this.list.nextName], {prevFrom: list, to: list.last});
    if (this.list.last === this.prevNode) this.list.last = list.last;

    list.last = list;

    return this.list.makePtr(prev);
  }
}

export default Ptr;
