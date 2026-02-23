/**
 * Normalize a node or pointer to a plain node, validating compatibility.
 * @param list - Owning list for validation.
 * @param node - Node or pointer to normalize.
 * @param PtrBase - Pointer base class for `instanceof` checks.
 * @returns The underlying node, or `null`.
 */
export function normalizeNode(list: object, node: any, PtrBase: Function): object | null;

/**
 * Check whether a range is compatible with a list host.
 * @param listHost - List to validate against.
 * @param range - Range to check.
 * @param PtrBase - Pointer base class for `instanceof` checks.
 * @returns `true` if the range is compatible.
 */
export function isRangeLike(listHost: object, range: any, PtrBase: Function): boolean;

/**
 * Normalize a range, resolving any pointers to plain nodes.
 * @param listHost - List to validate against.
 * @param range - Range to normalize.
 * @param PtrBase - Pointer base class for `instanceof` checks.
 * @returns The normalized range with `from`/`to` as plain nodes, or `null`.
 */
export function normalizeRange(listHost: object, range: any, PtrBase: Function): object | null;

/**
 * Check whether a pointer-based range is compatible with a list host.
 * @param listHost - List to validate against.
 * @param range - Pointer range to check (must have `from` as a PtrBase).
 * @param PtrBase - Pointer base class for `instanceof` checks.
 * @returns `true` if the pointer range is compatible.
 */
export function isPtrRangeLike(listHost: object, range: any, PtrBase: Function): boolean;

/**
 * Normalize a pointer-based range, resolving `to` to a plain node.
 * @param listHost - List to validate against.
 * @param range - Pointer range to normalize.
 * @param PtrBase - Pointer base class for `instanceof` checks.
 * @returns The normalized pointer range, or `null`.
 */
export function normalizePtrRange(listHost: object, range: any, PtrBase: Function): object | null;
