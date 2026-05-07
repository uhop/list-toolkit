/**
 * Capitalize the first letter of a string.
 * @param name - Input string.
 * @returns The capitalized string.
 */
export function capitalize(name: string): string;

/**
 * Convert an array of name parts to camelCase.
 * @param names - Name parts.
 * @returns The camelCase string.
 */
export function toCamelCase(names: string[]): string;

/**
 * Split a camelCase string into parts.
 * @param name - camelCase string.
 * @returns Array of name parts.
 */
export function fromCamelCase(name: string): string[];

/**
 * Convert an array of name parts to PascalCase.
 * @param names - Name parts.
 * @returns The PascalCase string.
 */
export function toPascalCase(names: string[]): string;

/**
 * Split a PascalCase string into parts.
 * @param name - PascalCase string.
 * @returns Array of name parts.
 */
export function fromPascalCase(name: string): string[];

/**
 * Convert an array of name parts to ALL_CAPS_SNAKE_CASE.
 * @param names - Name parts.
 * @returns The ALL_CAPS_SNAKE_CASE string.
 */
export function toAllCapsSnakeCase(names: string[]): string;

/**
 * Convert an array of name parts to snake_case.
 * @param names - Name parts.
 * @returns The snake_case string.
 */
export function toSnakeCase(names: string[]): string;

/**
 * Split a snake_case string into parts.
 * @param name - snake_case string.
 * @returns Array of name parts.
 */
export function fromSnakeCase(name: string): string[];

/**
 * Convert an array of name parts to kebab-case.
 * @param names - Name parts.
 * @returns The kebab-case string.
 */
export function toKebabCase(names: string[]): string;

/**
 * Split a kebab-case string into parts.
 * @param name - kebab-case string.
 * @returns Array of name parts.
 */
export function fromKebabCase(name: string): string[];

/** Default property descriptor: configurable and enumerable. */
export const defaultDescriptor: PropertyDescriptor;

/**
 * Create a property descriptor from a getter function.
 * @param getter - Getter function.
 * @param defaultDescriptor - Base descriptor to extend.
 * @returns A property descriptor with `get`.
 */
export function fromGetter(getter: (() => any) | undefined, defaultDescriptor?: PropertyDescriptor): PropertyDescriptor;

/**
 * Create a property descriptor from a setter function.
 * @param setter - Setter function.
 * @param defaultDescriptor - Base descriptor to extend.
 * @returns A property descriptor with `set`.
 */
export function fromSetter(setter: ((v: any) => void) | undefined, defaultDescriptor?: PropertyDescriptor): PropertyDescriptor;

/**
 * Create a property descriptor from getter and setter functions.
 * @param getter - Getter function.
 * @param setter - Setter function.
 * @param defaultDescriptor - Base descriptor to extend.
 * @returns A property descriptor with `get` and/or `set`.
 */
export function fromAccessors(
  getter: (() => any) | undefined,
  setter: ((v: any) => void) | undefined,
  defaultDescriptor?: PropertyDescriptor
): PropertyDescriptor;

/**
 * Define a property descriptor on a target for one or more names.
 * @param target - Object to define properties on.
 * @param names - Comma-separated string, array, or single name/symbol.
 * @param descriptor - Property descriptor to apply.
 * @param force - If `true`, overwrite existing own properties.
 * @returns The target object.
 */
export function addDescriptor(target: object, names: string | PropertyKey[], descriptor: PropertyDescriptor | undefined, force?: boolean): object;

/**
 * Define multiple property descriptors on a target.
 * @param target - Object to define properties on.
 * @param dict - Map of comma-separated names to descriptors.
 * @param force - If `true`, overwrite existing own properties.
 */
export function addDescriptors(target: object, dict: Record<string, PropertyDescriptor>, force?: boolean): void;

/**
 * Define an accessor (getter/setter) on a target.
 * @param target - Object to define the accessor on.
 * @param names - Comma-separated string, array, or single name/symbol.
 * @param getter - Getter function.
 * @param setter - Setter function.
 * @param force - If `true`, overwrite existing own properties.
 * @returns The target object.
 */
export function addAccessor(
  target: object,
  names: string | PropertyKey[],
  getter: (() => any) | undefined,
  setter: ((v: any) => void) | undefined,
  force?: boolean
): object;

/**
 * Define multiple getter-based descriptors on a target.
 * @param target - Object to define getters on.
 * @param dict - Map of comma-separated names to getter functions.
 * @param force - If `true`, overwrite existing own properties.
 */
export function addGetters(target: object, dict: Record<string, () => any>, force?: boolean): void;

/**
 * Copy property descriptors from a source to a target.
 * @param target - Destination object.
 * @param source - Source object.
 * @param names - Names to copy (string, symbol, array, or alias map).
 * @param force - If `true`, overwrite existing own properties.
 * @returns The target object.
 */
export function copyDescriptors(
  target: object,
  source: object,
  names: string | symbol | PropertyKey[] | Record<string, string | PropertyKey[]>,
  force?: boolean
): object;

/**
 * Create an alias for an existing property.
 * @param object - Object owning the property.
 * @param name - Original property name.
 * @param aliases - Comma-separated alias names or array.
 * @param force - If `true`, overwrite existing own properties.
 * @returns The object.
 */
export function addAlias(object: object, name: PropertyKey, aliases: string | PropertyKey[], force?: boolean): object;

/**
 * Create multiple aliases from a dictionary.
 * @param object - Object owning the properties.
 * @param dict - Map of original names to comma-separated alias strings.
 * @param force - If `true`, overwrite existing own properties.
 * @returns The object.
 */
export function addAliases(object: object, dict: Record<string, string>, force?: boolean): object;

/**
 * Ensure an iterator object has a `[Symbol.iterator]` method.
 * @param iterator - Iterator to augment.
 * @returns The augmented iterator.
 */
export function augmentIterator<T>(iterator: Iterator<T>): IterableIterator<T>;

/**
 * Normalize an iterator, using `Iterator.from` when available.
 * @param iterator - Iterator to normalize.
 * @returns An iterable iterator.
 */
export function normalizeIterator<T>(iterator: Iterator<T>): IterableIterator<T>;

/**
 * Map over an iterator, producing a new iterable.
 * @param iterator - Source iterable iterator.
 * @param callbackFn - Mapping function receiving value and index.
 * @returns An iterable of mapped values.
 */
export function mapIterator<T, U>(iterator: Iterable<T>, callbackFn: (value: T, index: number) => U): Iterable<U>;

/**
 * Filter values from an iterable, producing a new iterable.
 * @param iterator - Source iterable.
 * @param callbackFn - Predicate receiving value and index.
 * @returns An iterable of values for which `callbackFn` returns true.
 */
export function filterIterator<T>(iterator: Iterable<T>, callbackFn: (value: T, index: number) => boolean): Iterable<T>;

/**
 * Adapt a less function to a compare function.
 * @param lessFn - Returns `true` if `a` should precede `b`.
 * @returns A function that returns -1, 0, or 1.
 */
export function compareFromLess<T>(lessFn: (a: T, b: T) => boolean): (a: T, b: T) => number;

/**
 * Adapt a compare function to a less function.
 * @param compareFn - Returns negative, zero, or positive.
 * @returns A function that returns true if `a` should precede `b`.
 */
export function lessFromCompare<T>(compareFn: (a: T, b: T) => number): (a: T, b: T) => boolean;

/**
 * Adapt a less function to an equal function.
 * @param lessFn - Returns `true` if `a` should precede `b`.
 * @returns A function that returns true if `a` and `b` are equal.
 */
export function equalFromLess<T>(lessFn: (a: T, b: T) => boolean): (a: T, b: T) => boolean;

/**
 * Reverse a less function.
 * @param lessFn - Less function to reverse.
 * @returns A function with reversed argument order.
 */
export function reverseLess<T>(lessFn: (a: T, b: T) => boolean): (a: T, b: T) => boolean;

/**
 * Reverse a compare function.
 * @param compareFn - Compare function to reverse.
 * @returns A function with reversed argument order.
 */
export function reverseCompare<T>(compareFn: (a: T, b: T) => number): (a: T, b: T) => number;

/** Map of `typeof` results that can have properties set on them. */
export const canHaveProps: Record<string, number>;

/**
 * Copy option keys from a pattern and optional sources onto a target.
 * @param target - Target object (created if falsy).
 * @param pattern - Object defining which keys to copy and their defaults.
 * @param sources - Additional source objects to override values from.
 * @returns The target object.
 */
export function copyOptions<T extends object>(target: T | null | undefined, pattern: T, ...sources: Array<Partial<T> | null | undefined>): T;
