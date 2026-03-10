import {SllOptions} from './nodes.js';

/** Result of extracting or popping nodes from a circular SLL. */
export interface SllExtractResult<T extends object> {
  /** The extracted sub-range descriptor. */
  extracted: {prevFrom: T; to: T};
  /** The remaining circular list head, or `null` if nothing remains. */
  rest: T | null;
}

/** A splice range descriptor for SLL operations. */
export interface SllSpliceRange<T extends object> {
  /** Node whose next link starts the range. */
  prevFrom: T;
  /** Last node of the range (defaults to `prevFrom[nextName]`). */
  to?: T;
}

/**
 * Extract a range of nodes from a circular SLL.
 * @param options - Link property names.
 * @param range - Range descriptor with `prevFrom` and optional `to`.
 * @returns The extracted sub-list and the remaining list.
 */
export function extract<T extends object>(options: SllOptions, range: SllSpliceRange<T>): SllExtractResult<T>;

/**
 * Pop a single node out of its circular SLL.
 * @param options - Link property names.
 * @param prev - The node preceding the one to pop.
 * @returns The popped node (now stand-alone) and the remaining list.
 */
export function pop<T extends object>(options: SllOptions, prev: T): SllExtractResult<T>;

/**
 * Splice a circular SLL into another list after a target node.
 * @param options - Link property names.
 * @param target - Node after which to insert.
 * @param range - Range descriptor of the circular list to splice in.
 * @returns The target node.
 */
export function splice<T extends object>(options: SllOptions, target: T, range: SllSpliceRange<T>): T;

/**
 * Alias for {@link splice}.
 */
export {splice as append};
