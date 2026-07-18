// @ts-self-types="./free-list.d.ts"

// the free list is threaded through the pooled objects' own link property —
// an intrusive SLL of dead nodes, no wrappers, no allocation in the pool itself
export class FreeList {
  constructor(options) {
    this.create = options?.create || null;
    this.reset = options?.reset || null;
    const capacity = options?.capacity;
    this.capacity = capacity === undefined || capacity === null ? Infinity : Math.max(0, Math.floor(capacity));
    this.nextName = options?.nextName || 'next';
    this.prevName = options?.prevName || null;
    this.head = null;
    this.size = 0;
  }
  get isEmpty() {
    return !this.size;
  }
  get isFull() {
    return this.size >= this.capacity;
  }
  acquire() {
    const node = this.head;
    if (!node) return this.create ? this.create() : undefined;
    this.head = node[this.nextName];
    node[this.nextName] = null;
    if (this.prevName) node[this.prevName] = null;
    --this.size;
    return node;
  }
  release(node) {
    if (!node) return this;
    if (this.reset) this.reset(node);
    if (this.size >= this.capacity) return this;
    node[this.nextName] = this.head;
    this.head = node;
    ++this.size;
    return this;
  }
  preallocate(count) {
    if (this.create) {
      for (let i = Math.floor(count); i > 0 && this.size < this.capacity; --i) this.release(this.create());
    }
    return this;
  }
  clear() {
    let node = this.head;
    while (node) {
      const next = node[this.nextName];
      node[this.nextName] = null;
      node = next;
    }
    this.head = null;
    this.size = 0;
    return this;
  }
  [Symbol.iterator]() {
    let node = this.head;
    return {
      next: () => {
        if (!node) return {done: true};
        const value = node;
        node = node[this.nextName];
        return {value};
      }
    };
  }
}

export default FreeList;
