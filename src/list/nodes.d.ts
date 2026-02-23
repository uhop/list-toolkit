/** Options for configuring link property names. */
export interface DllOptions {
  /** Name of the "next" link property. */
  nextName?: string;
  /** Name of the "prev" link property. */
  prevName?: string;
}

/** A range defined by two nodes. */
export interface DllRange<T extends object = object> {
  /** Start node of the range. */
  from?: T;
  /** End node of the range. */
  to?: T;
  /** List that owns the range. */
  list?: HeadNode | ExtListBase<T>;
}

/** A range defined by a pointer and a node. */
export interface DllPtrRange<T extends object = object> {
  /** Start pointer of the range. */
  from?: PtrBase<T>;
  /** End node of the range. */
  to?: T;
  /** List that owns the range. */
  list?: HeadNode | ExtListBase<T>;
}

/**
 * Check whether a node has both link properties set.
 * @param options - Link property names.
 * @param node - Object to test.
 * @returns `true` if the node has both next and prev links.
 */
export function isNodeLike<T extends object>(options: DllOptions, node: T | null | undefined): boolean;

/**
 * Check whether a node links to itself on both sides.
 * @param options - Link property names.
 * @param node - Object to test.
 * @returns `true` if the node is stand-alone (self-linked).
 */
export function isStandAlone<T extends object>(options: DllOptions, node: T | null | undefined): boolean;

/**
 * Check whether two option sets share the same link property names.
 * @param options1 - First set of options.
 * @param options2 - Second set of options.
 * @returns `true` if nextName and prevName match.
 */
export function isCompatible(options1: DllOptions, options2: DllOptions): boolean;

/** A self-linked circular DLL node. */
export class Node {
  /** Name of the "next" link property. */
  readonly nextName: string;
  /** Name of the "prev" link property. */
  readonly prevName: string;

  /** @param options - Link property names. */
  constructor(options?: DllOptions);

  /** Whether this node links to itself. */
  get isStandAlone(): boolean;
}

/** Sentinel node used as the head of a hosted DLL. */
export class HeadNode extends Node {
  /**
   * Test whether a value looks like a compatible node.
   * @param node - Object to test.
   * @returns `true` if the object has valid next and prev links.
   */
  isNodeLike<T extends object>(node: T | null | undefined): boolean;

  /**
   * Test whether an options object shares the same link names.
   * @param options - Options to compare.
   * @returns `true` if names match.
   */
  isCompatibleNames(options: DllOptions): boolean;

  /**
   * Test whether another list is compatible.
   * @param list - List or head node to compare.
   * @returns `true` if compatible.
   */
  isCompatible(list: HeadNode | ExtListBase): boolean;

  /**
   * Test whether a pointer belongs to a compatible list.
   * @param ptr - Pointer to test.
   * @returns `true` if compatible.
   */
  isCompatiblePtr(ptr: PtrBase): boolean;

  /**
   * Test whether a range is compatible with this list.
   * @param range - Range to test.
   * @returns `true` if compatible.
   */
  isCompatibleRange(range: DllRange | null): boolean;

  /** Whether the list is empty (head links to itself). */
  get isEmpty(): boolean;

  /** Whether the list contains exactly one node. */
  get isOne(): boolean;

  /** Whether the list contains zero or one nodes. */
  get isOneOrEmpty(): boolean;

  /** The sentinel head node. */
  get head(): this;

  /** The first node after the head. */
  get front(): object;

  /** The last node before the head. */
  get back(): object;

  /** A range spanning all nodes, or `null` if empty. */
  get range(): DllRange | null;

  /**
   * Count the number of nodes in the list.
   * @returns Node count.
   */
  getLength(): number;

  /**
   * Adopt a node or pointer into this list, making it stand-alone if needed.
   * @param nodeOrPtr - Node or pointer to adopt.
   * @returns The adopted node.
   * @throws If the node is already part of another list.
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
   * @returns Normalized range with plain node references.
   */
  normalizeRange<T extends object>(range: DllRange<T>): DllRange<T>;
}

/** A node that wraps an arbitrary value. */
export class ValueNode<V = unknown> extends Node {
  /** The wrapped value. */
  value: V;

  /**
   * @param value - Value to wrap.
   * @param options - Link property names.
   */
  constructor(value: V, options?: DllOptions);
}

/** Base class for DLL pointers. */
export class PtrBase<T extends object = object> {
  /** The list this pointer belongs to. */
  list: HeadNode | ExtListBase<T>;
  /** The node this pointer references. */
  node: T;

  /**
   * @param list - Owning list, or another pointer to copy.
   * @param node - Target node or pointer.
   * @param ListClass - Expected list constructor for validation.
   */
  constructor(list: HeadNode | ExtListBase<T> | PtrBase<T>, node?: T | PtrBase<T>, ListClass?: Function);

  /** The node after the current node. */
  get nextNode(): T;

  /** The node before the current node. */
  get prevNode(): T;

  /**
   * Whether the previous node is valid for iteration.
   * @returns Always `true` for DLL pointers.
   */
  isPrevNodeValid(): boolean;

  /**
   * Advance the pointer to the next node.
   * @returns `this` for chaining.
   */
  next(): this;

  /**
   * Move the pointer to the previous node.
   * @returns `this` for chaining.
   */
  prev(): this;
}

/** Base class for external (headless) DLL wrappers. */
export class ExtListBase<T extends object = object> {
  /** Name of the "next" link property. */
  readonly nextName: string;
  /** Name of the "prev" link property. */
  readonly prevName: string;
  /** Current head node, or `null` if empty. */
  head: T | null;

  /**
   * @param head - Initial head node, pointer, or another ExtListBase to copy.
   * @param options - Link property names.
   */
  constructor(head?: T | PtrBase<T> | ExtListBase<T> | null, options?: DllOptions);

  /**
   * Test whether another list is compatible.
   * @param list - List to compare.
   * @returns `true` if compatible.
   */
  isCompatible(list: HeadNode | ExtListBase): boolean;

  /**
   * Test whether a pointer belongs to a compatible list.
   * @param ptr - Pointer to test.
   * @returns `true` if compatible.
   */
  isCompatiblePtr(ptr: PtrBase): boolean;

  // Copied from HeadNode via copyDescriptors:

  /**
   * Test whether a value looks like a compatible node.
   * @param node - Object to test.
   * @returns `true` if the object has valid next and prev links.
   */
  isNodeLike(node: object | null | undefined): boolean;

  /**
   * Test whether an options object shares the same link names.
   * @param options - Options to compare.
   * @returns `true` if names match.
   */
  isCompatibleNames(options: DllOptions): boolean;

  /**
   * Test whether a range is compatible with this list.
   * @param range - Range to test.
   * @returns `true` if compatible.
   */
  isCompatibleRange(range: DllRange<T> | null): boolean;

  /**
   * Normalize a node or pointer to a plain node.
   * @param nodeOrPtr - Node or pointer.
   * @returns The underlying node, or `null`.
   */
  normalizeNode(nodeOrPtr: T | PtrBase<T> | null): T | null;

  /**
   * Normalize a range, resolving any pointers to nodes.
   * @param range - Range to normalize.
   * @returns Normalized range with plain node references.
   */
  normalizeRange(range: DllRange<T>): DllRange<T>;

  /**
   * Adopt a node or pointer into this list.
   * @param nodeOrPtr - Node or pointer to adopt.
   * @returns The adopted node.
   */
  adoptNode(nodeOrPtr: T | PtrBase<T>): T;

  /** Alias for {@link adoptNode}. */
  adoptValue(nodeOrPtr: T | PtrBase<T>): T;

  /** Whether the list is empty. */
  get isEmpty(): boolean;

  /** Whether the list contains exactly one node. */
  get isOne(): boolean;

  /** Whether the list contains zero or one nodes. */
  get isOneOrEmpty(): boolean;

  /** The head node, or `undefined` if empty. */
  get front(): T | undefined;

  /** The node before the head, or `undefined` if empty. */
  get back(): T | undefined;

  /** A range spanning all nodes, or `null` if empty. */
  get range(): DllRange<T> | null;

  /**
   * Count the number of nodes.
   * @returns Node count.
   */
  getLength(): number;

  /**
   * Set a new head node.
   * @param head - New head node or pointer, or `null` to detach.
   * @returns The previous head node, or `null`.
   */
  attach(head?: T | PtrBase<T> | null): T | null;

  /**
   * Detach the head, leaving the list empty.
   * @returns The previous head node, or `null`.
   */
  detach(): T | null;

  /**
   * Advance the head to the next node.
   * @returns `this` for chaining.
   */
  next(): this;

  /**
   * Move the head to the previous node.
   * @returns `this` for chaining.
   */
  prev(): this;
}
