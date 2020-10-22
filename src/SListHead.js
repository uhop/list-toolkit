class SListHead {
  constructor(head = null, next = 'next') {
    if (head instanceof SListHead) {
      ({nextName: this.nextName, head: this.head} = head);
      return;
    }
    this.nextName = next;
    if (head instanceof SListHead.Unsafe) {
      this.head = head.head;
      return;
    }
    if (head) {
      if (!head[this.nextName]) {
        this.adopt(head);
      }
    } else {
      head = this.makeNode();
    }
    this.head = head;
  }

  get isEmpty() {
    return this.head[this.nextName] === this.head;
  }

  get front() {
    return this.head[this.nextName];
  }

  getBack() {
    return SListHead.getPrev(this, this.head);
  }

  getLength() {
    let n = 0;
    for (let p = this.head[this.nextName]; p !== this.head; ++n, p = p[this.nextName]);
    return n;
  }

  getPtr() {
    return new SListHead.SListPtr(this);
  }

  popFront() {
    if (this.head[this.nextName] !== this.head) {
      return SListHead.pop(this, this.head).node;
    }
  }

  popBack() {
    if (this.head[this.nextName] !== this.head) {
      const last = SListHead.getPrev(this, this.head);
      return SListHead.pop(this, last).node;
    }
  }

  pushFront(node) {
    this.adopt(node);
    SListHead.splice(this, this.head, {prev: node, node});
    return this;
  }

  pushBack(node) {
    this.adopt(node);
    const last = SListHead.getPrev(this, this.head);
    SListHead.splice(this, last, {prev: node, node});
    return this;
  }

  appendFront(list) {
    let prevFrom, nodeTo;
    if (list instanceof SListHead) {
      if (list.head[this.nextName] === list.head) return this;
      prevFrom = list.head;
      nodeTo = SListHead.getPrev(this, list.head);
    } else {
      if (list[this.nextName] === list) return this;
      prevFrom = nodeTo = SListHead.getPrev(this, list);
    }
    SListHead.splice(this, this.head, SListHead.extract(this, prevFrom, nodeTo));
    return this;
  }

  appendBack(list) {
    let prevFrom, nodeTo;
    if (list instanceof SListHead) {
      if (list.head[this.nextName] === list.head) return this;
      prevFrom = list.head;
      nodeTo = SListHead.getPrev(this, list.head);
    } else {
      if (list[this.nextName] === list) return this;
      prevFrom = nodeTo = SListHead.getPrev(this, list);
    }
    const last = SListHead.getPrev(this, this.head);
    SListHead.splice(this, last, SListHead.extract(this, prevFrom, nodeTo));
    return this;
  }

  moveToFront(node) {
    let prev;
    if (node instanceof SListHead.SListPtr) {
      prev = node.prev;
      node = node.node;
      if (this.head[this.nextName] === node) return this;
    } else {
      if (this.head[this.nextName] === node) return this;
      prev = SListHead.getPrev(this, this.head, node);
    }
    SListHead.splice(this, this.head, SListHead.extract(this, prev, node));
    return this;
  }

  moveToBack(node) {
    let prev;
    if (node instanceof SListHead.SListPtr) {
      prev = node.prev;
      node = node.node;
      if (this.head[this.nextName] === node) return this;
    } else {
      if (this.head[this.nextName] === node) return this;
      prev = SListHead.getPrev(this, this.head, node);
    }
    const last = SListHead.getPrev(this, this.head);
    SListHead.splice(this, list, SListHead.extract(this, prev, node));
    return this;
  }

  clear() {
    this.head[this.nextName] = this.head;
    return this;
  }

  remove(from, to = from) {
    const prevFrom = from instanceof SListHead.SListPtr ? from.prev : SListHead.getPrev(this, this.head, from),
      nodeTo = to instanceof SListHead.SListPtr ? to.node : to;
    SListHead.extract(this, prevFrom, nodeTo);
    return this;
  }

  extract(from, to) {
    const prevFrom = from instanceof SListHead.SListPtr ? from.prev : SListHead.getPrev(this, this.head, from),
      nodeTo = to instanceof SListHead.SListPtr ? to.node : to;
    return this.make(SListHead.splice(this, this.makeNode(), SListHead.extract(this, prevFrom, nodeTo)));
  }

  reverse() {
    let prev = this.head,
      current = prev[this.nextName];
    while (current !== this.head) {
      current[this.nextName] = prev;
      prev = current;
      current = prev[this.nextName];
    }
    this.head[this.nextName] = prev;
    return this;
  }

  sort(compareFn) {
    let prev = this.head;
    for (const node of Array.from(this).sort(compareFn)) {
      prev = prev[this.nextName] = node;
    }
    prev[this.nextName] = this.head;
    return this;
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.head[this.nextName];
    return {
      next: () => {
        if (current === this.head) return {done: true};
        const value = current;
        current = current[this.nextName];
        return {value};
      }
    };
  }

  getIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        let current = (from instanceof SListHead.SListPtr && from.node) || from || this.head[this.nextName];
        const stop = to ? ((to instanceof SListHead.SListPtr && to.node) || to)[this.nextName] : this.head;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const value = current;
            current = current[this.nextName];
            return {value};
          }
        };
      }
    };
  }

  getPtrIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        let current =
          from instanceof SListHead.SListPtr ? from.clone() : from ? new SListHead.SListPtr(this, SListHead.getPrev(this, this.head, from)) : this.getPtr();
        const stop = to ? ((to instanceof SListHead.SListPtr && to.node) || to)[this.nextName] : this.head;
        return {
          next: () => {
            if (current.node === stop) return {done: true};
            const value = current.clone();
            current.next();
            return {value};
          }
        };
      }
    };
  }

  // static utilities

  static pop({nextName}, prev) {
    const node = prev[nextName];
    prev[nextName] = node[nextName];
    node[nextName] = node;
    return {node, list: prev};
  }

  static extract({nextName}, prevFrom, nodeTo) {
    const node = prevFrom[nextName];
    if (prevFrom === nodeTo) return {prev: prevFrom, node};
    prevFrom[nextName] = nodeTo[nextName];
    nodeTo[nextName] = node;
    return {prev: nodeTo, node};
  }

  static splice({nextName}, prev1, {prev, node}) {
    prev[nextName] = prev1[nextName];
    prev1[nextName] = node;
    return prev1;
  }

  static getPrev({nextName}, list, node) {
    let prev = list,
      current = prev[nextName];
    while (current !== list) {
      if (node && current === node) return prev;
      prev = current;
      current = prev[nextName];
    }
    if (node) throw new Error('node does not belong to the list');
    return prev;
  }

  // node helpers

  makeNode() {
    const node = {};
    node[this.nextName] = node;
    return node;
  }

  adopt(node) {
    if (node[this.nextName]) {
      if (node[this.nextName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node;
    return node;
  }

  // helpers

  clone() {
    return new SListHead(this);
  }

  make(newHead = null) {
    return new SListHead(newHead, this.nextName);
  }

  makeFrom(values) {
    return SListHead.from(values, this.nextName);
  }

  pushValuesFront(values) {
    for (const value of values) {
      this.pushFront(value);
    }
    return this;
  }

  appendValuesFront(values) {
    return this.appendFront(SListHead.from(values, this.nextName));
  }

  static from(values, next) {
    const list = new SListHead(null, next);
    let prev = list.head;
    for (const value of values) {
      this.adopt(value);
      prev[next] = value;
      prev = value;
    }
    prev[next] = list.head;
    return list;
  }
}

SListHead.prototype.pop = SListHead.prototype.popFront;
SListHead.prototype.push = SListHead.prototype.pushFront;
SListHead.prototype.append = SListHead.prototype.appendBack;

SListHead.Unsafe = class Unsafe {
  constructor(head) {
    this.head = head;
  }
};

SListHead.SListPtr = class SListPtr {
  constructor(list, prev) {
    this.list = list;
    this.prev = prev || list.head;
  }
  get node() {
    return this.prev[this.list.nextName];
  }
  get isHead() {
    return this.prev[this.list.nextName] === this.list.head;
  }
  next() {
    this.prev = this.prev[this.list.nextName];
    return this;
  }
  clone() {
    return new SListHead.SListPtr(this.list, this.prev);
  }
};

export default SListHead;
