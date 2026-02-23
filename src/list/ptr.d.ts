import {PtrBase, HeadNode} from './nodes.js';

/** Pointer for navigating and mutating a hosted DLL ({@link List}). */
export class Ptr<T extends object = object> extends PtrBase<T> {
  /** The hosted list this pointer belongs to. */
  list: HeadNode;

  /**
   * @param list - Owning list or another Ptr to copy.
   * @param node - Target node.
   */
  constructor(list: HeadNode | Ptr<T>, node?: T);

  /** Whether the pointer is on the sentinel head node. */
  get isHead(): boolean;

  /**
   * Create a copy of this pointer.
   * @returns A new Ptr referencing the same list and node.
   */
  clone(): Ptr<T>;

  /**
   * Remove the current node and advance to the next.
   * @returns The removed node, or `null` if on the head.
   */
  removeCurrent(): T | null;

  /**
   * Insert a value before the current node.
   * @param value - Value to insert (adopted via the list).
   * @returns A Ptr to the newly inserted node.
   */
  addBefore(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert an already-prepared node before the current node.
   * @param node - Node or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeBefore(node: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert a value after the current node.
   * @param value - Value to insert (adopted via the list).
   * @returns A Ptr to the newly inserted node.
   */
  addAfter(value: T | PtrBase<T>): Ptr<T>;

  /**
   * Insert an already-prepared node after the current node.
   * @param node - Node or pointer to insert.
   * @returns A Ptr to the inserted node.
   */
  addNodeAfter(node: T | PtrBase<T>): Ptr<T>;

  /**
   * Splice another list's nodes before the current node.
   * @param list - Compatible hosted list to consume.
   * @returns A Ptr to the first inserted node, or `null` if the list was empty.
   */
  insertBefore(list: HeadNode): Ptr<T> | null;

  /**
   * Splice another list's nodes after the current node.
   * @param list - Compatible hosted list to consume.
   * @returns A Ptr to the first inserted node, or `null` if the list was empty.
   */
  insertAfter(list: HeadNode): Ptr<T> | null;
}

export default Ptr;
