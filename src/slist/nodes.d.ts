/** Options for configuring SLL link property names. */
export interface SllOptions {
  /** Property name used for the next link. */
  nextName?: string;
}

/** A range of nodes in a singly linked list. */
export interface SllRange<T extends object = object> {
  /** First node of the range (or a Ptr). */
  from?: T | PtrBase<T>;
  /** Last node of the range (or a Ptr). */
  to?: T | PtrBase<T>;
  /** Owning list for validation. */
  list?: HeadNode | ExtListBase<T>;
}

/** A pointer-based range where `from` must be a Ptr. */
export interface SllPtrRange<T extends object = object> {
  /** Pointer to the first node. */
  from: PtrBase<T>;
  /** Last node of the range (or a Ptr). */
  to?: T | PtrBase<T>;
  /** Owning list for validation. */
  list?: HeadNode | ExtListBase<T>;
}

/**
 * Check whether a node has a valid next link.
 * @param options - Link property names.
 * @param node - Node to check.
 * @returns `true` if the node has a truthy next link.
 */
export function isNodeLike<T extends object>(options: SllOptions, node: T): boolean;

/**
 * Check whether a node points to itself (stand-alone).
 * @param options - Link property names.
 * @param node - Node to check.
 * @returns `true` if the node's next link points to itself.
 */
export function isStandAlone<T extends object>(options: SllOptions, node: T): boolean;

/**
 * Check whether two option sets share the same link property name.
 * @param options1 - First options.
 * @param options2 - Second options.
 * @returns `true` if `nextName` matches.
 */
export function isCompatible(options1: SllOptions, options2: SllOptions): boolean;

/** Singly linked list node with a circular self-link. */
export class Node {
  /** Property name for the next link. */
  nextName: string;

  /** @param options - Link property names. */
  constructor(options?: SllOptions);

  /** Whether this node's next link points to itself. */
  get isStandAlone(): boolean;
}

/** Sentinel head node for hosted singly linked lists. */
export class HeadNode extends Node {
  /** Pointer to the last node in the list. */
  last: Node | object;

  /** @param options - Link property names. */
  constructor(options?: SllOptions);

  /**
   * Check whether a value looks like a compatible node.
   * @param node - Value to check.
   * @returns `true` if the value has a valid next link.
   */
  isNodeLike(node: unknown): boolean;

  /**
   * Check whether another options object shares the same link names.
   * @param options - Options to compare.
   * @returns `true` if `nextName` matches.
   */
  isCompatibleNames(options: SllOptions): boolean;

  /**
   * Check whether another list is compatible with this one.
   * @param list - List to compare.
   * @returns `true` if compatible.
   */
  isCompatible(list: HeadNode | ExtListBase): boolean;

  /**
   * Check whether a pointer belongs to a compatible list.
   * @param ptr - Pointer to check.
   * @returns `true` if compatible.
   */
  isCompatiblePtr(ptr: PtrBase): boolean;

  /**
   * Check whether a range is compatible with this list.
   * @param range - Range to validate.
   * @returns `true` if compatible.
   */
  isCompatibleRange<T extends object>(range: SllRange<T>): boolean;

  /** Whether the list has no nodes. */
  get isEmpty(): boolean;

  /** Whether the list has exactly one node. */
  get isOne(): boolean;

  /** Whether the list has zero or one node. */
  get isOneOrEmpty(): boolean;

  /** The head sentinel itself. */
  get head(): this;

  /** The first node after the head. */
  get front(): object;

  /** The last node in the list. */
  get back(): object;

  /** A range spanning all nodes, or `null` if empty. */
  get range(): SllRange | null;

  /**
   * Count the number of nodes.
   * @returns The node count.
   */
  getLength(): number;

  /**
   * Adopt a node or pointer, making it stand-alone if needed.
   * @param nodeOrPtr - Node or pointer to adopt.
   * @returns The adopted node.
   */
  adoptNode<T extends object>(nodeOrPtr: T | PtrBase<T>): T;

  /**
   * Adopt a value into this list. Overridden by value-list subclasses.
   * @param nodeOrPtr - Node, pointer, or value to adopt.
   * @returns The adopted node.
   */
  adoptValue(nodeOrPtr: any): any;

  /**
   * Normalize a node or pointer to a plain node.
   * @param nodeOrPtr - Node or pointer.
   * @returns The underlying node, or `null`.
   */
  normalizeNode<T extends object>(nodeOrPtr: T | PtrBase<T> | null): T | null;

  /**
   * Normalize a range, resolving any pointers to nodes.
   * @param range - Range to normalize.
   * @returns The normalized range, or `null`.
   */
  normalizeRange<T extends object>(range?: SllRange<T> | null): SllRange<T> | null;

  /**
   * Normalize a pointer-based range.
   * @param range - Pointer range to normalize.
   * @returns The normalized pointer range, or `null`.
   */
  normalizePtrRange<T extends object>(range?: SllPtrRange<T> | null): SllPtrRange<T> | null;

  /**
   * Recalculate the `last` pointer by traversing the list.
   * @returns `this` for chaining.
   */
  syncLast(): this;
}

/** Value wrapper node for singly linked lists. */
export class ValueNode<V = unknown> extends Node {
  /** The wrapped value. */
  value: V;

  /**
   * @param value - Value to wrap.
   * @param options - Link property names.
   */
  constructor(value: V, options?: SllOptions);
}

/** Base class for SLL pointers providing navigation. */
export class PtrBase<T extends object = object> {
  /** The list this pointer belongs to. */
  list: HeadNode | ExtListBase<T>;
  /** The current node. */
  node: T;
  /** The node preceding the current node. */
  prevNode: T;

  /**
   * @param list - Owning list or another PtrBase to copy.
   * @param node - Target node.
   * @param prev - Preceding node.
   * @param ListClass - Expected list constructor for validation.
   */
  constructor(list: PtrBase<T> | HeadNode | ExtListBase<T>, node?: T | PtrBase<T>, prev?: T, ListClass?: Function);

  /** The node after the current node. */
  get nextNode(): T;

  /**
   * Check and repair the prevNode link.
   * @returns `true` if prevNode is valid.
   */
  isPrevNodeValid(): boolean;

  /**
   * Advance to the next node.
   * @returns `this` for chaining.
   */
  next(): this;

  /**
   * Move to the previous node.
   * @returns `this` for chaining.
   * @throws If prevNode is invalid.
   */
  prev(): this;

  /**
   * Synchronize prevNode by scanning forward.
   * @returns `this` for chaining.
   */
  syncPrev(): this;
}

/** Base class for external (headless) singly linked lists. */
export class ExtListBase<T extends object = object> {
  /** Current head node, or `null` if empty. */
  head: T | null;
  /** Property name for the next link. */
  nextName: string;

  /**
   * @param head - Initial head node, ExtListBase, or PtrBase.
   * @param options - Link property names.
   */
  constructor(head?: T | ExtListBase<T> | PtrBase<T> | null, options?: SllOptions);

  /**
   * Check whether another list is compatible.
   * @param list - List to compare.
   * @returns `true` if compatible.
   */
  isCompatible(list: ExtListBase | HeadNode): boolean;

  /**
   * Check whether a pointer belongs to a compatible list.
   * @param ptr - Pointer to check.
   * @returns `true` if compatible.
   */
  isCompatiblePtr(ptr: PtrBase): boolean;

  /**
   * Check whether a value looks like a compatible node.
   * @param node - Value to check.
   * @returns `true` if the value has a valid next link.
   */
  isNodeLike(node: unknown): boolean;

  /**
   * Check whether another options object shares the same link names.
   * @param options - Options to compare.
   * @returns `true` if `nextName` matches.
   */
  isCompatibleNames(options: SllOptions): boolean;

  /**
   * Check whether a range is compatible with this list.
   * @param range - Range to validate.
   * @returns `true` if compatible.
   */
  isCompatibleRange<T extends object>(range: SllRange<T>): boolean;

  /**
   * Normalize a node or pointer to a plain node.
   * @param nodeOrPtr - Node or pointer.
   * @returns The underlying node, or `null`.
   */
  normalizeNode<T extends object>(nodeOrPtr: T | PtrBase<T> | null): T | null;

  /**
   * Normalize a range, resolving any pointers to nodes.
   * @param range - Range to normalize.
   * @returns The normalized range, or `null`.
   */
  normalizeRange<T extends object>(range?: SllRange<T> | null): SllRange<T> | null;

  /**
   * Normalize a pointer-based range.
   * @param range - Pointer range to normalize.
   * @returns The normalized pointer range, or `null`.
   */
  normalizePtrRange<T extends object>(range?: SllPtrRange<T> | null): SllPtrRange<T> | null;

  /**
   * Adopt a node or pointer, making it stand-alone if needed.
   * @param nodeOrPtr - Node or pointer to adopt.
   * @returns The adopted node.
   */
  adoptNode<T extends object>(nodeOrPtr: T | PtrBase<T>): T;

  /**
   * Adopt a value into this list. Overridden by value-list subclasses.
   * @param nodeOrPtr - Node, pointer, or value to adopt.
   * @returns The adopted node.
   */
  adoptValue(nodeOrPtr: any): any;

  /** Whether the list has no nodes. */
  get isEmpty(): boolean;

  /** Whether the list has exactly one node. */
  get isOne(): boolean;

  /** Whether the list has zero or one node. */
  get isOneOrEmpty(): boolean;

  /** The head node, or `null` if empty. */
  get front(): T | null;

  /** A range spanning all nodes, or `null` if empty. */
  get range(): SllRange<T> | null;

  /**
   * Count the number of nodes.
   * @returns The node count.
   */
  getLength(): number;

  /**
   * Get the last node by traversal.
   * @returns The last node, or `null` if empty.
   */
  getBack(): T | null;

  /**
   * Set a new head node.
   * @param head - New head node, pointer, or `null`.
   * @returns The previous head node.
   */
  attach(head?: T | PtrBase<T> | null): T | null;

  /**
   * Remove the head reference without modifying nodes.
   * @returns The previous head node.
   */
  detach(): T | null;

  /**
   * Advance the head to the next node.
   * @returns `this` for chaining.
   */
  next(): this;
}
