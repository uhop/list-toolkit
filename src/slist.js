'use strict';

export class SListNode {
  constructor() {
    this.next = this;
  }
}

const pop = prev => {
  const node = prev.next;
  prev.next = node.next;
  node.next = node;
  return {node, list: prev};
};

const extract = (prevFrom, nodeTo) => {
  const node = prevFrom.next;
  if (prevFrom === nodeTo) return {prev: prevFrom, node};
  prevFrom.next = nodeTo.next;
  nodeTo.next = node;
  return {prev: nodeTo, node};
};

const splice = (prev1, {prev, node}) => {
  prev.next = prev1.next;
  prev1.next = node;
  return prev1;
};

const getPrevPrev = (list, node) => {
  let prev = list,
    current = prev.next;
  while (current.next !== list) {
    if (node && current.next === node) return prev;
    prev = current;
    current = prev.next;
  }
  if (node) {
    if (list.next === node) return current;
    throw new Error('node does not belong to the list');
  }
  return prev;
};

const getPrev = (list, node) => {
  return getPrevPrev(list, node).next;
};

export class SListValueNode extends SListNode {
  constructor(value) {
    super();
    this.value = value;
  }

  addAfter(value) {
    const node = new SListValueNode(value);
    splice(this, {prev: node, node});
    return this;
  }

  insertAfter(list) {
    const node = getPrev(pop(list).list);
    splice(this, {prev: node, node});
    return this;
  }
}

export class SList extends SListNode {
  get isEmpty() {
    return this.next === this;
  }

  get front() {
    return this.next;
  }

  getBack() {
    return getPrev(this);
  }

  getLength() {
    let n = 0;
    for (let p = this.next; p !== this; ++n, p = p.next);
    return n;
  }

  getPtr() {
    return new SList.SListPtr(this);
  }

  popFront() {
    if (this.next !== this) {
      return pop(this).node.value;
    }
  }

  popBack() {
    if (this.next !== this) {
      const prevLast = getPrevPrev(this);
      return pop(prevLast).node.value;
    }
  }

  pushFront(value) {
    const node = new SListValueNode(value);
    splice(this, {prev: node, node});
    return this;
  }

  pushBack(value) {
    const node = new SListValueNode(value),
      last = getPrev(this);
    splice(last, {prev: node, node});
    return this;
  }

  appendFront(list) {
    if (list.next === list) return this;
    let prevFrom = list,
      nodeTo = getPrev(list);
    splice(this, extract(prevFrom, nodeTo));
    return this;
  }

  appendBack(list) {
    if (list.next === list) return this;
    let prevFrom = list,
      nodeTo = getPrev(list),
      last = getPrev(this);
    splice(last, extract(prevFrom, nodeTo));
    return this;
  }

  moveToFront(node) {
    let prev;
    if (node instanceof SList.SListPtr) {
      prev = node.prev;
      node = node.node;
      if (this.next === node) return this;
    } else {
      if (this.next === node) return this;
      prev = getPrev(this, node);
    }
    splice(this, extract(prev, node));
    return this;
  }

  moveToBack(node) {
    let prev;
    if (node instanceof SList.SListPtr) {
      prev = node.prev;
      node = node.node;
    } else {
      prev = getPrev(this, node);
    }
    const last = getPrev(this);
    splice(last, extract(prev, node));
    return this;
  }

  clear() {
    this.next = this;
    return this;
  }

  remove(from, to = from) {
    const prevFrom = from instanceof SList.SListPtr ? from.prev : getPrev(this, from),
      nodeTo = to instanceof SList.SListPtr ? to.node : to;
    extract(prevFrom, nodeTo);
    return this;
  }

  extract(from, to) {
    const prevFrom = from instanceof SList.SListPtr ? from.prev : getPrev(this, from),
      nodeTo = to instanceof SList.SListPtr ? to.node : to;
    return splice(new SList(), extract(prevFrom, nodeTo));
  }

  reverse() {
    let prev = this,
      current = prev.next;
    while (current !== this) {
      const next = current.next;
      current.next = prev;
      prev = current;
      current = next;
    }
    this.next = prev;
    return this;
  }

  sort(compareFn) {
    let current = this.next;
    for (const value of Array.from(this).sort(compareFn)) {
      current.value = value;
      current = current.next;
    }
    return this;
  }

  // iterators

  [Symbol.iterator]() {
    let current = this.next;
    return {
      next: () => {
        if (current === this) return {done: true};
        const node = current;
        current = current.next;
        return {value: node.value};
      }
    };
  }

  getIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        let current = (from instanceof SList.SListPtr && from.node) || from || this.next;
        const stop = to ? ((to instanceof SList.SListPtr && to.node) || to).next : this;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const node = current;
            current = current.next;
            return {value: node.value};
          }
        };
      }
    };
  }

  getNodeIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        let current = (from instanceof SList.SListPtr && from.node) || from || this.next;
        const stop = to ? ((to instanceof SList.SListPtr && to.node) || to).next : this;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const node = current;
            current = current.next;
            return {value: node};
          }
        };
      }
    };
  }

  getPtrIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        let current = from instanceof SList.SListPtr ? from.clone() : from ? new SList.SListPtr(this, getPrev(this.head, from)) : this.getPtr();
        const stop = to ? ((to instanceof SList.SListPtr && to.node) || to).next : this;
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

  // helpers

  makeFrom(values) {
    return SList.from(values);
  }

  pushValuesFront(values) {
    for (const value of values) {
      this.pushFront(value);
    }
    return this;
  }

  appendValuesFront(values) {
    return this.appendFront(SList.from(values));
  }

  static from(values) {
    const list = new SList();
    let prev = list;
    for (const value of values) {
      const node = new SListValueNode(value);
      prev.next = node;
      prev = node;
    }
    prev.next = list;
    return list;
  }
}

SList.pop = pop;
SList.extract = extract;
SList.splice = splice;
SList.getPrev = getPrev;
SList.getPrevPrev = getPrevPrev;

SList.Node = SListNode;
SList.ValueNode = SListValueNode;

SList.prototype.pop = SList.prototype.popFront;
SList.prototype.push = SList.prototype.pushFront;
SList.prototype.append = SList.prototype.appendBack;

export class SListPtr {
  constructor(list, prev) {
    this.list = list;
    this.prev = prev || list;
  }
  get node() {
    return this.prev.next;
  }
  get isHead() {
    return this.prev.next === this.list;
  }
  next() {
    this.prev = this.prev.next;
    return this;
  }
  clone() {
    return new SList.SListPtr(this.list, this.prev);
  }
};
SList.SListPtr = SListPtr;

export default SList;
