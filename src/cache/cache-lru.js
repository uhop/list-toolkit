import ValueList from '../value-list.js';
import {addAliases} from '../meta-utils.js';

/**
 * LRU (Least Recently Used) cache backed by a doubly linked value list.
 * Evicts the least recently used item when capacity is exceeded.
 */
export class CacheLRU {
  /** @param {number} [capacity=10] - Maximum number of entries. */
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.list = new ValueList();
    this.dict = new Map();
  }
  /** Whether the cache has no entries. */
  get isEmpty() {
    return !this.dict.size;
  }
  /** The number of entries in the cache. */
  get size() {
    return this.dict.size;
  }
  /**
   * Check whether a key exists.
   * @param {*} key - Key to look up.
   * @returns {boolean} `true` if the key exists.
   */
  has(key) {
    return this.dict.has(key);
  }
  /**
   * Retrieve the value for a key, marking it as recently used.
   * @param {*} key - Key to look up.
   * @returns {*} The value, or `undefined` if not found.
   */
  find(key) {
    const node = this.use(key);
    return node ? node.value.value : undefined;
  }
  /**
   * Remove an entry by key.
   * @param {*} key - Key to remove.
   * @returns {CacheLRU} `this` for chaining.
   */
  remove(key) {
    const node = this.dict.get(key);
    if (node) {
      this.dict.delete(key);
      this.list.removeNode(node);
    }
    return this;
  }
  /**
   * Add or update an entry. Evicts the LRU item if at capacity.
   * @param {*} key - Key to register.
   * @param {*} value - Value to store.
   * @returns {CacheLRU} `this` for chaining.
   */
  register(key, value) {
    const node = this.use(key);
    if (node) {
      this.update(node, value);
      return this;
    }
    if (this.dict.size >= this.capacity) {
      this.evictAndReplace(key, value);
      return this;
    }
    this.addNew(key, value);
    return this;
  }
  /**
   * Mark a key as recently used and return its node.
   * @param {*} key - Key to look up.
   * @returns {object|undefined} The internal node, or `undefined`.
   */
  use(key) {
    const node = this.dict.get(key);
    if (node) this.list.moveToFront(node);
    return node;
  }
  /**
   * Update the value of an existing node.
   * @param {object} node - Internal node to update.
   * @param {*} value - New value.
   * @returns {CacheLRU} `this` for chaining.
   */
  update(node, value) {
    node.value.value = value;
    return this;
  }
  /**
   * Add a new entry to the cache.
   * @param {*} key - Key.
   * @param {*} value - Value.
   * @returns {object} The newly created node.
   */
  addNew(key, value) {
    this.list.pushFront({key, value});
    const node = this.list.front;
    this.dict.set(key, node);
    return node;
  }
  /**
   * Evict the LRU entry and replace it with a new key/value.
   * @param {*} key - New key.
   * @param {*} value - New value.
   * @returns {object} The reused node.
   */
  evictAndReplace(key, value) {
    const node = this.list.back;
    this.list.moveToFront(node);
    this.dict.delete(node.value.key);
    this.dict.set(key, node);
    node.value = {key, value};
    return node;
  }
  /**
   * Remove all entries.
   * @returns {CacheLRU} `this` for chaining.
   */
  clear() {
    this.dict.clear();
    this.list.clear();
    return this;
  }
  /** Iterate over `{key, value}` entries from most to least recently used. */
  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
  /**
   * Get an iterable over entries in reverse (LRU-first) order.
   * @returns {Iterable} An iterable iterator of `{key, value}` objects.
   */
  getReverseIterator() {
    return this.list.getReverseIterator();
  }
}

addAliases(CacheLRU.prototype, {register: 'add, set', remove: 'delete', find: 'get'});

export default CacheLRU;
