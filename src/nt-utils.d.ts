/** Options for null-terminated list utilities. */
export interface NTOptions {
  /** Property name for the next link (default `'next'`). */
  nextName?: string;
}

/** Options for null-terminated DLL utilities. */
export interface NTDllOptions extends NTOptions {
  /** Property name for the previous link (default `'prev'`). */
  prevName?: string;
}

/** A head/tail pair returned by conversion functions. */
export interface NTListResult<T extends object> {
  /** First node. */
  head: T;
  /** Last node. */
  tail: T;
}

/**
 * Check whether a linked structure is a valid null-terminated list.
 * @param head - First node, or `null` for an empty list.
 * @param options - Link property names.
 * @returns `true` if the list is null-terminated (not circular).
 */
export function isNTList<T extends object>(head: T | null, options?: NTOptions): boolean;

/**
 * Find the tail of a null-terminated list by following next links.
 * @param head - First node, or `null`.
 * @param options - Link property names.
 * @returns The tail node, or `null` if empty or circular.
 */
export function getNTListTail<T extends object>(head: T | null, options?: NTOptions): T | null;

/**
 * Find the head of a null-terminated list by following prev links.
 * @param node - Any node in the list, or `null`.
 * @param options - Link property names (uses `prevName`).
 * @returns The head node, or `null` if empty or circular.
 */
export function getNTListHead<T extends object>(node: T | null, options?: { prevName?: string }): T | null;

/**
 * Count the number of nodes in a null-terminated list.
 * @param head - First node, or `null`.
 * @param options - Link property names.
 * @returns The node count.
 */
export function getNTListLength<T extends object>(head: T | null, options?: NTOptions): number;

/**
 * Convert a null-terminated DLL into a circular DLL.
 * @param node - Any node in the null-terminated list, or `null`.
 * @param options - Link property names.
 * @returns Head/tail pair, or `null` if empty.
 */
export function makeListFromNTList<T extends object>(node: T | null, options?: NTDllOptions): NTListResult<T> | null;

/**
 * Convert a null-terminated SLL into a circular SLL.
 * @param head - First node, or `null`.
 * @param options - Link property names.
 * @returns Head/tail pair, or `null` if empty.
 */
export function makeSListFromNTList<T extends object>(head: T | null, options?: NTOptions): NTListResult<T> | null;

/**
 * Convert a circular DLL into a null-terminated DLL.
 * @param head - Head of the circular list, or `null`.
 * @param options - Link property names.
 * @returns Head/tail pair, or `null` if empty.
 */
export function makeNTListFromList<T extends object>(head: T | null, options?: NTDllOptions): NTListResult<T> | null;

/**
 * Convert a circular SLL into a null-terminated SLL (fast: head becomes second node).
 * @param head - Head of the circular list, or `null`.
 * @param options - Link property names.
 * @returns Head/tail pair, or `null` if empty.
 */
export function makeNTListFromSListFast<T extends object>(head: T | null, options?: NTOptions): NTListResult<T> | null;

/**
 * Convert a circular SLL into a null-terminated SLL (traverses to find the tail).
 * @param head - Head of the circular list, or `null`.
 * @param options - Link property names.
 * @returns Head/tail pair, or `null` if empty.
 */
export function makeNTListFromSList<T extends object>(head: T | null, options?: NTOptions): NTListResult<T> | null;
