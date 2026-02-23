import {HeadNode, PtrBase} from './nodes.js';
import {pop, splice} from './basics.js';

/** Pointer for navigating and mutating a hosted doubly linked list. */
export class Ptr extends PtrBase {
  /**
   * @param {HeadNode|Ptr} list - Owning list or another Ptr to copy.
   * @param {object} [node] - Target node.
   */
  constructor(list, node) {
    super(list, node, HeadNode);
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
    if (this.node === this.list) return null;
    const node = this.node;
    this.node = node[this.list.nextName];
    return pop(this.list, node).extracted;
  }
  /**
   * Insert a value before the current node.
   * @param {*} value - Value or node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addBefore(value) {
    const node = this.list.adoptValue(value);
    splice(this.list, this.node[this.list.prevName], node);
    return this.list.makePtr(node);
  }
  /**
   * Insert an existing node before the current node.
   * @param {object} node - Node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addNodeBefore(node) {
    node = this.list.adoptNode(node);
    splice(this.list, this.node[this.list.prevName], node);
    return this.list.makePtr(node);
  }
  /**
   * Insert a value after the current node.
   * @param {*} value - Value or node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addAfter(value) {
    const node = this.list.adoptValue(value);
    splice(this.list, this.node, node);
    return this.list.makePtr(node);
  }
  /**
   * Insert an existing node after the current node.
   * @param {object} node - Node to insert.
   * @returns {Ptr} A Ptr to the inserted node.
   */
  addNodeAfter(node) {
    node = this.list.adoptNode(node);
    splice(this.list, this.node, node);
    return this.list.makePtr(node);
  }
  /**
   * Splice another list's nodes before the current node.
   * @param {HeadNode} list - Compatible list to consume.
   * @returns {Ptr|null} A Ptr to the first inserted node, or `null` if empty.
   */
  insertBefore(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return null;
    const head = pop(list, list).rest;
    splice(this.list, this.node[this.list.prevName], head);
    return this.list.makePtr(head);
  }
  /**
   * Splice another list's nodes after the current node.
   * @param {HeadNode} list - Compatible list to consume.
   * @returns {Ptr|null} A Ptr to the first inserted node, or `null` if empty.
   */
  insertAfter(list) {
    if (!this.list.isCompatible(list)) throw new Error('Incompatible lists');
    if (list.isEmpty) return null;
    const head = pop(list, list).rest;
    splice(this.list, this.node, head);
    return this.list.makePtr(head);
  }
}

export default Ptr;
