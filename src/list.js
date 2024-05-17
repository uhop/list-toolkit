'use strict';

export class ListNode {
  constructor() {
    this.prev = this.next = this;
  }
}

export class ListValueNode extends ListNode {
  constructor(value) {
    super();
    this.value = value;
  }
}

// useful low-level operations on doubly linked lists

const pop = head => {
  const rest = head.next;
  head.prev.next = head.next;
  head.next.prev = head.prev;
  head.prev = head.next = head;
  return {node: head, list: rest};
};

const extract = (from, to = from) => {
  const prev = from.prev,
    next = to.next;
  prev.next = next;
  next.prev = prev;
  from.prev = to;
  to.next = from;
  return from;
};

const splice = (head1, head2) => {
  const tail1 = head1.prev,
    tail2 = head2.prev;
  tail1.next = head2;
  head2.prev = tail1;
  tail2.next = head1;
  head1.prev = tail2;
  return head1;
};

const append = (target, from, to = from) => {
  // extract
  from.prev.next = to.next;
  to.next.prev = from.prev;

  // splice
  const next = target.next;
  target.next = from;
  from.prev = target;
  to.next = next;
  next.prev = to;

  return target;
};

const isNodeLike = node => node && node.prev && node.next;
const isStandAlone = node => node && node.prev === node && node.next === node;

export class ListPtr {
  constructor(list, node) {
    if (list instanceof ListPtr) {
      this.list = list.list;
      this.node = list.node;
    } else if (node instanceof ListPtr) {
      if (list !== node.list) throw new Error('Node specified by ListPtr must belong to the same list');
      this.list = list;
      this.node = node.node;
    } else {
      this.list = list;
      this.node = node || list.next;
    }
  }
  get isHead() {
    return this.node === this.list;
  }
  next() {
    this.node = this.node.next;
    return this;
  }
  prev() {
    this.node = this.node.prev;
    return this;
  }
  clone() {
    return new ListPtr(this.list, this.node);
  }
  remove() {
    if (this.node === this.list) return null;
    const node = this.node;
    this.node = node.next;
    return pop(node).node;
  }
  addBefore(value) {
    splice(this.node, value instanceof ListValueNode ? value : new ListValueNode(value));
    return this;
  }
  addAfter(value) {
    splice(this.node.next, value instanceof ListValueNode ? value : new ListValueNode(value));
    return this;
  }
  insertBefore(list) {
    splice(this.node, pop(list).list);
    return this;
  }
  insertAfter(list) {
    splice(this.node.next, pop(list).list);
    return this;
  }
}

export class List extends ListNode {
  get isEmpty() {
    return this.next === this;
  }

  get front() {
    return this.next;
  }

  get back() {
    return this.prev;
  }

  get frontPtr() {
    return new ListPtr(this, this.next);
  }

  get backPtr() {
    return new ListPtr(this, this.prev);
  }

  getLength() {
    let n = 0;
    for (let p = this.next; p !== this; ++n, p = p.next);
    return n;
  }

  isNodeLike(node) {
    return isNodeLike(node);
  }

  isValidValueNode(node) {
    return node instanceof ListValueNode && isStandAlone(node);
  }

  makePtr(node) {
    return new ListPtr(this, node || this.next);
  }

  popFront() {
    if (this.next !== this) {
      return pop(this.next).node.value;
    }
  }

  popBack() {
    if (this.prev !== this) {
      return pop(this.prev).node.value;
    }
  }

  popFrontNode() {
    if (this.next !== this) {
      return pop(this.next).node;
    }
  }

  popBackNode() {
    if (this.prev !== this) {
      return pop(this.prev).node;
    }
  }

  pushFront(value) {
    splice(this.next, this.isValidValueNode(value) ? value : new ListValueNode(value));
    return this;
  }

  pushBack(value) {
    splice(this, this.isValidValueNode(value) ? value : new ListValueNode(value));
    return this;
  }

  appendFront(list) {
    if (list.next !== list) {
      splice(this.next, extract(list.next, list.prev));
    }
    return this;
  }

  appendBack(list) {
    if (list.next !== list) {
      splice(this, extract(list.next, list.prev));
    }
    return this;
  }

  moveToFront(node) {
    if (node instanceof ListPtr) node = node.node;
    if (this.next !== node) {
      splice(this.next, pop(node).node);
    }
    return this;
  }

  moveToBack(node) {
    if (node instanceof ListPtr) node = node.node;
    if (this.prev !== node) {
      splice(this, pop(node).node);
    }
    return this;
  }

  clear() {
    this.prev = this.next = this;
    return this;
  }

  remove(from, to = from) {
    if (from instanceof ListPtr) {
      if (to instanceof ListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof ListPtr) to = to.node;
    }
    extract(from, to);
    return this;
  }

  removeNode(node) {
    if (node instanceof ListPtr) node = node.node;
    pop(node);
    return this;
  }

  extract(from, to) {
    if (from instanceof ListPtr) {
      if (to instanceof ListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof ListPtr) to = to.node;
    }
    return splice(new List(), extract(from, to));
  }

  reverse() {
    let next = this.next;
    this.next = this.prev;
    this.prev = next;
    while (next !== this) {
      const node = next;
      next = node.next;
      node.next = node.prev;
      node.prev = next;
    }
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
        const value = current.value;
        current = current.next;
        return {value};
      }
    };
  }

  getIterable(from, to) {
    if (from instanceof ListPtr) {
      if (to instanceof ListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof ListPtr) to = to.node;
    }
    return {
      [Symbol.iterator]: () => {
        let current = from || this.next;
        const stop = to ? to.next : this;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const value = current.value;
            current = current.next;
            return {value};
          }
        };
      }
    };
  }

  getNodeIterable(from, to) {
    if (from instanceof ListPtr) {
      if (to instanceof ListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof ListPtr) to = to.node;
    }
    return {
      [Symbol.iterator]: () => {
        let current = from || this.next;
        const stop = to ? to.next : this;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const value = current;
            current = current.next;
            return {value};
          }
        };
      }
    };
  }

  getPtrIterable(from, to) {
    if (from instanceof ListPtr && to instanceof ListPtr && from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
    return {
      [Symbol.iterator]: () => {
        const current = from instanceof ListPtr ? from.clone() : new ListPtr(this, from || this.next),
          stop = to instanceof ListPtr ? to.node : to ? to.next : this;
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

  getReverseIterable(from, to) {
    if (from instanceof ListPtr) {
      if (to instanceof ListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof ListPtr) to = to.node;
    }
    return {
      [Symbol.iterator]: () => {
        let current = to || this.prev;
        const stop = from ? from.prev : this;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const value = current.value;
            current = current.prev;
            return {value};
          }
        };
      }
    };
  }

  getReverseNodeIterable(from, to) {
    if (from instanceof ListPtr) {
      if (to instanceof ListPtr) {
        if (from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
        to = to.node;
      }
      from = from.node;
    } else {
      if (to instanceof ListPtr) to = to.node;
    }
    return {
      [Symbol.iterator]: () => {
        let current = to || this.prev;
        const stop = from ? from.prev : this;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const value = current;
            current = current.prev;
            return {value};
          }
        };
      }
    };
  }

  getReversePtrIterable(from, to) {
    if (from instanceof ListPtr && to instanceof ListPtr && from.list !== to.list) throw new Error("Range specified by ListPtr's must belong to the same list");
    return {
      [Symbol.iterator]: () => {
        const current = to instanceof ListPtr ? to.clone() : new ListPtr(this, to || this.prev),
          stop = from instanceof ListPtr ? from.node : from ? from.next : this;
        return {
          next: () => {
            if (current.node === stop) return {done: true};
            const value = current.clone();
            current.prev();
            return {value};
          }
        };
      }
    };
  }

  // helpers

  clone() {
    return List.from(this);
  }

  make() {
    return new List();
  }

  makeFrom(values) {
    return List.from(values);
  }

  pushValuesFront(values) {
    for (const value of values) {
      this.pushFront(value);
    }
    return this;
  }

  pushValuesBack(values) {
    for (const value of values) {
      this.pushBack(value);
    }
    return this;
  }

  appendValuesFront(values) {
    return this.appendFront(this.makeFrom(values));
  }

  appendValuesBack(values) {
    return this.appendBack(this.makeFrom(values));
  }

  findNodeBy(condition) {
    for (const current of this.getNodeIterable()) {
      if (condition(current)) return current;
    }
    return null;
  }

  findPtrBy(condition) {
    for (const current of this.getPtrIterable()) {
      if (condition(current.node)) return current;
    }
    return null;
  }

  removeNodeBy(condition) {
    for (const current of this.getNodeIterable()) {
      if (condition(current)) return pop(current).node;
    }
    return null;
  }

  extractBy(condition) {
    const extracted = this.make();
    for (let node = this.next; node !== this; ) {
      if (condition(node)) {
        const current = node;
        node = node.next;
        List.append(extracted, current);
      } else {
        node = node.next;
      }
    }
    return extracted;
  }

  static from(values) {
    const list = new List();
    for (const value of values) list.pushBack(value);
    return list;
  }
}

List.pop = pop;
List.extract = extract;
List.splice = splice;
List.append = append;
List.isNodeLike = isNodeLike;
List.isStandAlone = isStandAlone;

List.Node = ListNode;
List.ValueNode = ListValueNode;

List.prototype.pop = List.prototype.popFront;
List.prototype.push = List.prototype.pushFront;
List.prototype.append = List.prototype.appendBack;

export default List;
