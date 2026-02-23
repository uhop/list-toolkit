import {HeadNode, PtrBase} from './nodes.js';

/** Pointer for navigating and mutating a hosted singly linked list. */
export class Ptr<T extends object = object> extends PtrBase<T> {
  /** The hosted list this pointer belongs to. */
  list: HeadNode;

  /**
   * @param list - Owning list or another Ptr to copy.
   * @param node - Target node.
   * @param prev - Preceding node.
   */
  constructor(list: HeadNode | Ptr<T>, node?: T | PtrBase<T>, prev?: T);

  /** Whether the pointer is at the head sentinel. */
  get isHead(): boolean;

  /**
   * Create a copy of this pointer.
   * @returns A new Ptr referencing the same list and node.
   */
  clone(): Ptr<T>;

  /**
   * Remove the current node and advance to the next.
   * @returns The removed node, or `null` if at head or single node.
   */
  removeCurrent(): T | null;

  /**
   * Insert a value before the current node.
   * @param value - Value or node to insert.
   * @returns A Ptr to the inserted node.
   */
  addBefore(value: any): Ptr<T>;

  /**
   * Insert an existing node before the current node.
   * @param node - Node to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeBefore(node: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert a value after the current node.
   * @param value - Value or node to insert.
   * @returns A Ptr to the inserted node.
   */
  addAfter(value: any): Ptr<T>;

  /**
   * Insert an existing node after the current node.
   * @param node - Node to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeAfter(node: T | PtrBase<T>): Ptr<T>;

  /**
   * Splice another list's nodes before the current node.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the first inserted node.
   */
  insertBefore(list: HeadNode): Ptr<T>;

  /**
   * Splice another list's nodes after the current node.
   * @param list - Compatible list to consume.
   * @returns A Ptr to the first inserted node.
   */
  insertAfter(list: HeadNode): Ptr<T>;
}

export default Ptr;
