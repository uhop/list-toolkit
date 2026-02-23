import {DllOptions, DllRange} from './nodes.js';

/** Result of extracting or popping nodes from a circular list. */
export interface ExtractResult<T extends object> {
  /** The extracted node (or first node of the extracted range). */
  extracted: T;
  /** The remaining circular list head, or `null` if nothing remains. */
  rest: T | null;
}

/**
 * Extract a range of nodes from a circular list.
 * @param options - Link property names.
 * @param range - Range to extract (`from` and optionally `to`).
 * @returns The extracted circular sub-list and the remaining list.
 */
export function extract<T extends object>(options: DllOptions, range: DllRange<T>): ExtractResult<T>;

/**
 * Pop a single node out of its circular list.
 * @param options - Link property names.
 * @param node - Node to remove.
 * @returns The popped node (now stand-alone) and the remaining list.
 */
export function pop<T extends object>(options: DllOptions, node: T): ExtractResult<T>;

/**
 * Splice a circular list into another list after a target node.
 * @param options - Link property names.
 * @param target - Node after which to insert.
 * @param circularList - Head of the circular list to splice in.
 * @returns The target node.
 */
export function splice<T extends object>(options: DllOptions, target: T, circularList: T): T;

/**
 * Extract a range and splice it after a target node in one operation.
 * @param options - Link property names.
 * @param target - Node after which to insert.
 * @param range - Range to extract and append (`from` and optionally `to`).
 * @returns The target node.
 */
export function append<T extends object>(options: DllOptions, target: T, range: DllRange<T>): T;
