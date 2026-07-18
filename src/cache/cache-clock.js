// @ts-self-types="./cache-clock.d.ts"

import {addAlias} from '../meta-utils.js';
import {ValueNode} from '../list/nodes.js';
import {pop, splice} from '../list/basics.js';
import CacheLRU from './cache-lru.js';

// CLOCK (second chance): reads only set a reference bit — no list moves;
// the hand sweeps on eviction, sparing entries referenced since its last pass
export class CacheClock extends CacheLRU {
  constructor(capacity = 10) {
    super(capacity);
    this.hand = null;
  }
  use(key) {
    const node = this.dict.get(key);
    if (node) node.value.ref = 1;
    return node;
  }
  addNew(key, value) {
    const node = new ValueNode({key, value, ref: 0});
    if (this.hand) {
      splice(this.list, this.hand.prev, node);
    } else {
      splice(this.list, this.list, node);
      this.hand = node;
    }
    this.dict.set(key, node);
    return node;
  }
  advanceHand() {
    this.hand = this.hand.next;
    if (this.hand === this.list) this.hand = this.hand.next;
    return this.hand;
  }
  evict() {
    if (!this.dict.size) return this;
    for (;;) {
      const candidate = this.hand;
      if (candidate.value.ref) {
        candidate.value.ref = 0;
        this.advanceHand();
      } else {
        this.advanceHand();
        this.dict.delete(candidate.value.key);
        pop(this.list, candidate);
        if (!this.dict.size) this.hand = null;
        return this;
      }
    }
  }
  evictAndReplace(key, value) {
    this.evict();
    return this.addNew(key, value);
  }
  remove(key) {
    const node = this.dict.get(key);
    if (node) {
      this.dict.delete(key);
      if (this.hand === node) {
        this.advanceHand();
        if (this.hand === node) this.hand = null;
      }
      pop(this.list, node);
    }
    return this;
  }
  clear() {
    super.clear();
    this.hand = null;
    return this;
  }
}

addAlias(CacheClock.prototype, 'remove', 'delete');

export default CacheClock;
