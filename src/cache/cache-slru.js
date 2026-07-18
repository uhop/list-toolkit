// @ts-self-types="./cache-slru.d.ts"

import {addAlias} from '../meta-utils.js';
import ValueList from '../value-list.js';
import CacheLRU from './cache-lru.js';

// segmented LRU: new entries prove themselves in the probationary segment;
// a hit promotes into the protected segment — one-shot scans never displace it
export class CacheSLRU extends CacheLRU {
  constructor(capacity = 10, protectedCapacity = Math.max(1, Math.floor(capacity * 0.8))) {
    super(capacity);
    this.protectedCapacity = Math.min(Math.max(1, Math.floor(protectedCapacity)), this.capacity);
    this.protectedList = new ValueList();
    this.protectedSize = 0;
  }
  use(key) {
    const node = this.dict.get(key);
    if (!node) return node;
    const entry = node.value;
    if (entry.protected) {
      this.protectedList.moveToFront(node);
      return node;
    }
    this.list.removeNode(node);
    if (this.protectedSize >= this.protectedCapacity) {
      const demoted = this.protectedList.back;
      demoted.value.protected = false;
      this.protectedList.removeNode(demoted);
      this.list.pushFrontNode(demoted);
      --this.protectedSize;
    }
    entry.protected = true;
    this.protectedList.pushFrontNode(node);
    ++this.protectedSize;
    return node;
  }
  addNew(key, value) {
    this.list.pushFront({key, value, protected: false});
    const node = this.list.front;
    this.dict.set(key, node);
    return node;
  }
  evict() {
    if (!this.list.isEmpty) {
      const node = this.list.back;
      this.dict.delete(node.value.key);
      this.list.removeNode(node);
    } else if (!this.protectedList.isEmpty) {
      const node = this.protectedList.back;
      this.dict.delete(node.value.key);
      this.protectedList.removeNode(node);
      --this.protectedSize;
    }
    return this;
  }
  evictAndReplace(key, value) {
    this.evict();
    return this.addNew(key, value);
  }
  remove(key) {
    const node = this.dict.get(key);
    if (node) {
      this.dict.delete(key);
      if (node.value.protected) {
        this.protectedList.removeNode(node);
        --this.protectedSize;
      } else {
        this.list.removeNode(node);
      }
    }
    return this;
  }
  clear() {
    super.clear();
    this.protectedList.clear();
    this.protectedSize = 0;
    return this;
  }
  *[Symbol.iterator]() {
    yield* this.list;
    yield* this.protectedList;
  }
  *getReverseIterator() {
    yield* this.protectedList.getReverseIterator();
    yield* this.list.getReverseIterator();
  }
}

addAlias(CacheSLRU.prototype, 'remove', 'delete');

export default CacheSLRU;
