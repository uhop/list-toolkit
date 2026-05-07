// @ts-self-types="./cache-fifo.d.ts"

import CacheLRU from './cache-lru.js';

export class CacheFIFO extends CacheLRU {
  use(key) {
    return this.dict.get(key);
  }
  addNew(key, value) {
    this.list.pushBack({key, value});
    const node = this.list.back;
    this.dict.set(key, node);
    return node;
  }
  evictAndReplace(key, value) {
    const node = this.list.front;
    this.list.moveToBack(node);
    this.dict.delete(node.value.key);
    this.dict.set(key, node);
    node.value = {key, value};
    return node;
  }
}

export default CacheFIFO;
