class ListHead {
  constructor(head = null, next = 'next', prev = 'prev') {
    if (head instanceof ListHead) {
      ({nextName: this.nextName, prevName: this.prevName, head: this.head} = head);
      return;
    }
    this.nextName = next;
    this.prevName = prev;
    if (head instanceof ListHead.Unsafe) {
      this.head = head.head;
      return;
    }
    if (head) {
      switch ((head[this.nextName] ? 2 : 0) + (head[this.prevName] ? 1 : 0)) {
        case 0:
          this.adopt(head);
          break;
        case 3:
          // do nothing
          break;
        default:
          throw new Error(`head is not an empty object nor a list with required properties (${this.nextName}, ${this.prevName})`);
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

  get back() {
    return this.head[this.prevName];
  }

  getLength() {
    let n = 0;
    for (let p = this.head[this.nextName]; p !== this.head; ++n, p = p[this.nextName]);
    return n;
  }

  popFront() {
    if (this.head[this.prevName] !== this.head) {
      return ListHead.pop(this, this.head[this.nextName]).node;
    }
  }

  popBack() {
    if (this.head[this.prevName] !== this.head) {
      return ListHead.pop(this, this.head[this.prevName]).node;
    }
  }

  pushFront(node) {
    this.adopt(node);
    ListHead.splice(this, this.head[this.nextName], node);
    return this;
  }

  pushBack(node) {
    this.adopt(node);
    ListHead.splice(this, this.head, node);
    return this;
  }

  appendFront(list) {
    if (list instanceof ListHead) {
      list = list.head;
    }
    if (list[this.prevName] !== list) {
      ListHead.splice(this, this.head[this.nextName], ListHead.extract(this, list[this.nextName], list[this.prevName]));
    }
    return this;
  }

  appendBack(list) {
    if (list instanceof ListHead) {
      list = list.head;
    }
    if (list[this.prevName] !== list) {
      ListHead.splice(this, this.head, ListHead.extract(this, list[this.nextName], list[this.prevName]));
    }
    return this;
  }

  moveToFront(node) {
    if (this.head[this.nextName] !== node) {
      ListHead.splice(this, this.head[this.nextName], ListHead.extract(this, node, node));
    }
    return this;
  }

  moveToBack(node) {
    if (this.head[this.prevName] !== node) {
      ListHead.splice(this, this.head, ListHead.extract(this, node, node));
    }
    return this;
  }

  clear(drop) {
    if (drop) {
      while (!this.isEmpty) this.popFront();
    } else {
      this.head[this.prevName] = this.head[this.nextName] = this.head;
    }
    return this;
  }

  remove(from, to = from) {
    ListHead.extract(this, from, to);
    return this;
  }

  extract(from, to) {
    return this.make(ListHead.splice(this, this.makeNode(), ListHead.extract(this, from, to)));
  }

  reverse() {
    const list = this.head;
    let next = list[this.nextName];
    list[this.nextName] = list[this.prevName];
    list[this.prevName] = next;
    while (next !== list) {
      const node = next;
      next = node[this.nextName];
      node[this.nextName] = node[this.prevName];
      node[this.prevName] = next;
    }
    return this;
  }

  sort(compareFn) {
    let prev = this.head;
    for (const node of Array.from(this).sort(compareFn)) {
      prev[this.nextName] = node;
      node[this.prevName] = prev;
      prev = node;
    }
    this.head[this.prevName] = prev;
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
        let current = from || this.head[this.nextName];
        const stop = to ? to[this.nextName] : this.head;
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

  getReverseIterable(from, to) {
    return {
      [Symbol.iterator]: () => {
        let current = to || this.head[this.prevName];
        const stop = from ? from[this.prevName] : this.head;
        return {
          next: () => {
            if (current === stop) return {done: true};
            const value = current;
            current = current[this.prevName];
            return {value};
          }
        };
      }
    };
  }

  // static utilities

  static pop({nextName, prevName}, node) {
    const list = node[nextName];
    // the next line stitches the rest of the list excluding the node, and collapse the node into a one-node list
    node[prevName] = node[nextName] = {[nextName]: node[prevName][nextName], [prevName]: node[nextName][prevName]} = node;
    return {node, list};
  }

  static extract({nextName, prevName}, from, to) {
    const prev = from[prevName],
      next = to[nextName];
    prev[nextName] = next;
    next[prevName] = prev;
    from[prevName] = to;
    to[nextName] = from;
    return from;
  }

  static splice({nextName, prevName}, list1, list2) {
    const tail1 = list1[prevName],
      tail2 = list2[prevName];
    tail1[nextName] = list2;
    list2[prevName] = tail1;
    tail2[nextName] = list1;
    list1[prevName] = tail2;
    return list1;
  }

  // node helpers

  makeNode() {
    const node = {};
    node[this.nextName] = node[this.prevName] = node;
    return node;
  }

  adopt(node) {
    if (node[this.nextName] || node[this.prevName]) {
      if (node[this.nextName] === node && node[this.prevName] === node) return node;
      throw new Error('node is already a part of a list, or there is a name clash');
    }
    node[this.nextName] = node[this.prevName] = node;
    return node;
  }

  // helpers

  clone() {
    return new ListHead(this);
  }

  make(newHead = null) {
    return new ListHead(newHead, this.nextName, this.prevName);
  }

  makeFrom(values) {
    return ListHead.from(values, this.nextName, this.prevName);
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
    return this.appendFront(ListHead.from(values, this.nextName, this.prevName));
  }

  appendValuesBack(values) {
    return this.appendBack(ListHead.from(values, this.nextName, this.prevName));
  }

  static from(values, next = 'next', prev = 'prev') {
    const list = new ListHead(null, next, prev);
    for (const value of values) {
      list.pushBack(value);
    }
    return list;
  }
}

ListHead.prototype.pop = ListHead.prototype.popFront;
ListHead.prototype.push = ListHead.prototype.pushFront;
ListHead.prototype.append = ListHead.prototype.appendBack;

ListHead.Unsafe = class {
  constructor(head) {
    this.head = head;
  }
};

export default ListHead;
