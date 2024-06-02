'use strict';

import CacheLRU from './cache-lru.js';

// Evicts randomly.

export class CacheRandom extends CacheLRU {
  use(key) {
    return this.dict.get(key);
  }
  evictAndReplace(key, value) {
    const node = this.list.front,
      nextName = this.list.nextName,
      n = Math.floor(Math.random() * this.dict.size);
    for (let i = 0; i < n; ++i) node = node[nextName];
    this.dict.delete(node.value.key);
    this.dict.set(key, node);
    node.value = {key, value};
    return node;
  }
}

export default CacheRandom;
