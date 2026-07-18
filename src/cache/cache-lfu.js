// @ts-self-types="./cache-lfu.d.ts"

import {addAlias} from '../meta-utils.js';
import ValueList from '../value-list.js';
import CacheLRU from './cache-lru.js';

// Exact O(1) LFU (Shah et al.): ascending frequency buckets, each holding its
// entries in recency order; evicts the LRU entry among the least frequent.
// Entries live in the buckets; the inherited this.list stays unused.
export class CacheLFU extends CacheLRU {
  constructor(capacity = 10) {
    super(capacity);
    this.buckets = new ValueList();
  }
  frontBucketNode() {
    const bucketNode = this.buckets.isEmpty ? null : this.buckets.front;
    if (bucketNode && bucketNode.value.freq === 1) return bucketNode;
    this.buckets.pushFront({freq: 1, items: new ValueList()});
    return this.buckets.front;
  }
  use(key) {
    const itemNode = this.dict.get(key);
    if (!itemNode) return itemNode;
    const entry = itemNode.value,
      bucketNode = entry.bucketNode,
      bucket = bucketNode.value,
      counter = ++entry.counter,
      nextBucketNode = bucketNode.next;
    bucket.items.removeNode(itemNode);
    if (nextBucketNode !== this.buckets && nextBucketNode.value.freq === counter) {
      entry.bucketNode = nextBucketNode;
      nextBucketNode.value.items.pushFrontNode(itemNode);
      if (bucket.items.isEmpty) this.buckets.removeNode(bucketNode);
    } else if (bucket.items.isEmpty) {
      bucket.freq = counter;
      bucket.items.pushFrontNode(itemNode);
    } else {
      entry.bucketNode = this.buckets.makePtr(bucketNode).addAfter({freq: counter, items: new ValueList()}).node;
      entry.bucketNode.value.items.pushFrontNode(itemNode);
    }
    return itemNode;
  }
  update(itemNode, value) {
    const entry = itemNode.value,
      bucketNode = entry.bucketNode;
    entry.value = value;
    entry.counter = 1;
    bucketNode.value.items.removeNode(itemNode);
    if (bucketNode.value.items.isEmpty) this.buckets.removeNode(bucketNode);
    entry.bucketNode = this.frontBucketNode();
    entry.bucketNode.value.items.pushFrontNode(itemNode);
    return this;
  }
  addNew(key, value) {
    const bucketNode = this.frontBucketNode(),
      entry = {key, value, counter: 1, bucketNode};
    bucketNode.value.items.pushFront(entry);
    const itemNode = bucketNode.value.items.front;
    this.dict.set(key, itemNode);
    return itemNode;
  }
  evictAndReplace(key, value) {
    const bucketNode = this.buckets.front,
      items = bucketNode.value.items,
      victim = items.back;
    this.dict.delete(victim.value.key);
    items.removeNode(victim);
    if (items.isEmpty) this.buckets.removeNode(bucketNode);
    return this.addNew(key, value);
  }
  remove(key) {
    const itemNode = this.dict.get(key);
    if (itemNode) {
      this.dict.delete(key);
      const bucketNode = itemNode.value.bucketNode;
      bucketNode.value.items.removeNode(itemNode);
      if (bucketNode.value.items.isEmpty) this.buckets.removeNode(bucketNode);
    }
    return this;
  }
  clear() {
    this.dict.clear();
    this.buckets.clear();
    return this;
  }
  resetCounters(initialValue = 1) {
    if (this.buckets.isEmpty) return this;
    const merged = new ValueList();
    while (!this.buckets.isEmpty) {
      // ascending walk + appendFront: former-frequent entries end up front (evicted last)
      merged.appendFront(this.buckets.popFront().items);
    }
    this.buckets.pushFront({freq: initialValue, items: merged});
    const bucketNode = this.buckets.front;
    for (const entry of merged) {
      entry.counter = initialValue;
      entry.bucketNode = bucketNode;
    }
    return this;
  }
  *[Symbol.iterator]() {
    for (const bucket of this.buckets) yield* bucket.items;
  }
  *getReverseIterator() {
    for (const bucket of this.buckets.getReverseIterator()) yield* bucket.items.getReverseIterator();
  }
}

addAlias(CacheLFU.prototype, 'remove', 'delete');

export default CacheLFU;
