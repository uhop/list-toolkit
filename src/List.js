'use strict';

class ListNode {
  constructor() {
    this.prev = this.next = this;
  }
}

const pop = head => {
  const rest = head.next;
  head.prev.next = head.next;
  head.next.prev = head.prev;
  head.prev = head.next = head;
  return {node: head, list: rest};
};

const extract = (from, to) => {
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

class ListValueNode extends ListNode {
  constructor(value) {
    super();
    this.value = value;
  }

  pop() {
    return pop(this).node.value;
  }

  addBefore(value) {
    splice(this, new ListValueNode(value));
    return this;
  }

  addAfter(value) {
    splice(this.next, new ListValueNode(value));
    return this;
  }

  insertBefore(list) {
    splice(this, pop(list).list);
    return this;
  }

  insertAfter(list) {
    splice(this.next, pop(list).list);
    return this;
  }
}

class List extends ListNode {
  get isEmpty() {
    return this.next === this;
  }

  get front() {
    return this.next;
  }

  get back() {
    return this.prev;
  }

  getLength() {
    let n = 0;
    for (let p = this.next; p !== this; ++n, p = p.next);
    return n;
  }

  popFront() {
    if (this.next !== this) {
      return this.next.pop();
    }
  }

  popBack() {
    if (this.next !== this) {
      return this.prev.pop();
    }
  }

  pushFront(value) {
    splice(this.next, new ListValueNode(value));
    return this;
  }

  pushBack(value) {
    splice(this, new ListValueNode(value));
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
    if (this.next !== node) {
      splice(this.next, extract(node, node));
    }
    return this;
  }

  moveToBack(node) {
    if (this.prev !== node) {
      splice(this, extract(node, node));
    }
    return this;
  }

  clear() {
    this.prev = this.next = this;
    return this;
  }

  remove(from, to = from) {
    extract(from, to);
    return this;
  }

  extract(from, to) {
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
    let prev = this;
    for (const node of Array.from(this).sort(compareFn)) {
      prev.next = node;
      node.prev = prev;
      prev = node;
    }
    this.prev = prev;
    prev.next = this;
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

  getReverseIterable(from, to) {
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

  // helpers

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
    return this.appendFront(List.from(values));
  }

  appendValuesBack(values) {
    return this.appendBack(List.from(values));
  }

  static from(values) {
    const list = new List();
    for (const value of values) {
      list.pushBack(value);
    }
    return list;
  }
}

List.pop = pop;
List.extract = extract;
List.splice = splice;

List.Node = ListNode;
List.ValueNode = ListValueNode;

List.prototype.pop = List.prototype.popFront;
List.prototype.push = List.prototype.pushFront;
List.prototype.append = List.prototype.appendBack;

export default List;
