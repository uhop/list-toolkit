'use strict';

import {copyOptions} from '../meta-utils.js';

const defaultLess = (a, b) => a < b;

const zig = tree => {
  const newTree = tree.left,
    parent = (newTree.parent = tree.parent);
  if (parent) {
    if (parent.left === tree) parent.left = newTree;
    else parent.right = newTree;
  }
  tree.parent = newTree;
  const child = (tree.left = newTree.right);
  if (child) child.parent = tree;
  newTree.right = tree;
  return newTree;
};

const zag = tree => {
  const newTree = tree.right,
    parent = (newTree.parent = tree.parent);
  if (parent) {
    if (parent.left === tree) parent.left = newTree;
    else parent.right = newTree;
  }
  tree.parent = newTree;
  const child = (tree.right = newTree.left);
  if (child) child.parent = tree;
  newTree.left = tree;
  return newTree;
};

const splay = node => {
  while (node.parent) {
    if (!node.parent.parent) {
      node.parent.left === node ? zig(node.parent) : zag(node.parent);
    } else if (node.parent.left === node && node.parent.parent.left === node.parent) {
      zig(node.parent.parent);
      zig(node.parent);
    } else if (node.parent.right === node && node.parent.parent.right === node.parent) {
      zag(node.parent.parent);
      zag(node.parent);
    } else if (node.parent.left === node && node.parent.parent.right === node.parent) {
      zig(node.parent);
      zag(node.parent);
    } else {
      zag(node.parent);
      zig(node.parent);
    }
  }
  return node;
};

const count = tree => (tree ? count(tree.left) + count(tree.right) + 1 : 0);

export class SplayTreeNode {
  constructor(value) {
    this.left = this.right = this.parent = null;
    this.value = value;
  }
  getMin() {
    let z = this;
    while (z.left) z = z.left;
    return z;
  }
  getMax() {
    let z = this;
    while (z.right) z = z.right;
    return z;
  }
}

export class SplayTree {
  constructor(options) {
    copyOptions(this, SplayTree.defaults, options);
    if (typeof this.compare == 'function') {
      this.less = (a, b) => this.compare(a, b) < 0;
      this.find = this.findWithCompare;
      this.insert = this.insertWithCompare;
      this.splitMaxTree = this.splitMaxTreeWithCompare;
    }
    this.root = null;
    this.size = 0;
  }
  get isEmpty() {
    return !this.root;
  }
  get length() {
    return this.size;
  }
  getMin() {
    return this.root.getMin();
  }
  getMax() {
    return this.root.getMax();
  }
  find(value) {
    for (let z = this.root; z; ) {
      if (this.less(z.value, value)) z = z.right;
      else if (this.less(value, z.value)) z = z.left;
      else return z;
    }
    return null;
  }
  findWithCompare(value) {
    for (let z = this.root; z; ) {
      const cmp = this.compare(value, z.value);
      if (cmp < 0) z = z.left;
      else if (cmp > 0) z = z.right;
      else return z;
    }
    return null;
  }
  promote(value) {
    const z = this.find(value);
    if (z) {
      this.root = splay(z);
    }
    return z;
  }
  splay(node) {
    this.root = splay(node);
    return this;
  }
  insert(value) {
    let z = this.root,
      parent = null;
    while (z) {
      parent = z;
      if (this.less(z.value, value)) z = z.right;
      else if (this.less(value, z.value)) z = z.left;
      else break;
    }
    if (!z) {
      z = new SplayTreeNode(value);
      z.parent = parent;
      if (parent) {
        if (this.less(parent.value, value)) parent.right = z;
        else parent.left = z;
      }
      ++this.size;
    }
    this.root = splay(z);
    return this;
  }
  insertWithCompare(value) {
    let z = this.root,
      parent = null;
    while (z) {
      parent = z;
      const cmp = this.compare(value, z.value);
      if (cmp < 0) z = z.left;
      else if (cmp > 0) z = z.right;
      else break;
    }
    if (!z) {
      z = new SplayTreeNode(value);
      z.parent = parent;
      if (parent) {
        if (this.compare(parent.value, value) < 0) parent.right = z;
        else parent.left = z;
      }
      ++this.size;
    }
    this.root = splay(z);
    return this;
  }
  remove(value) {
    const z = this.find(value);
    if (!z) return this;

    splay(z);
    this.root = null;

    let maxNode = null;
    if (z.left) {
      z.left.parent = null;
      maxNode = z.left.getMax();
      this.root = splay(maxNode);
    }
    if (z.right) {
      if (maxNode) maxNode.right = z.right;
      else this.root = z.right;
      z.right.parent = maxNode;
    }

    --this.size;

    return this;
  }
  clear() {
    this.root = null;
    this.size = 0;
    return this;
  }
  splitMaxTree(value) {
    if (!this.root) return new SplayTree(this);
    let z = this.root,
      parent = null,
      right;
    while (z) {
      parent = z;
      if (this.less(z.value, value)) {
        z = z.right;
        right = true;
      } else if (this.less(value, z.value)) {
        z = z.left;
        right = false;
      } else break;
    }
    this.root = splay(z || parent);

    const newTree = new SplayTree(this);
    if (z || right) {
      newTree.root = this.root.right;
      if (newTree.root) {
        newTree.root.parent = null;
        newTree.size = count(newTree.root);
        this.root.right = null;
        this.size -= newTree.size;
      }
    } else {
      newTree.root = this.root;
      newTree.size = this.size;
      this.root = this.root.left;
      if (this.root) {
        this.root.parent = null;
        this.size = count(this.root);
        newTree.root.left = null;
        newTree.size -= this.size;
      }
    }
    return newTree;
  }
  splitMaxTreeWithCompare(value) {
    if (!this.root) return new SplayTree(this);
    let z = this.root,
      parent = null,
      right;
    while (z) {
      parent = z;
      const cmp = this.compare(value, z.value);
      if (cmp < 0) {
        z = z.left;
        right = false;
      } else if (cmp > 0) {
        z = z.right;
        right = true;
      } else break;
    }
    this.root = splay(z || parent);

    const newTree = new SplayTree(this);
    if (z || right) {
      newTree.root = this.root.right;
      if (newTree.root) {
        newTree.root.parent = null;
        newTree.size = count(newTree.root);
        this.root.right = null;
        this.size -= newTree.size;
      }
    } else {
      newTree.root = this.root;
      newTree.size = this.size;
      this.root = this.root.left;
      if (this.root) {
        this.root.parent = null;
        this.size = count(this.root);
        newTree.root.left = null;
        newTree.size -= this.size;
      }
    }
    return newTree;
  }
  joinMaxTreeUnsafe(tree) {
    if (this.root.right) {
      this.splay(this.getMax());
    }

    this.root.right = tree.root;
    tree.root.parent = this.root;
    this.size += tree.size;

    tree.clear();

    return this;
  }
  join(tree) {
    if (!tree.root) return this;
    if (!this.root) {
      this.root = tree.root;
      this.size = tree.size;
      tree.clear();
      return this;
    }

    const leftMax = this.getMax(), rightMin = tree.getMin();
    if (this.less(leftMax.value, rightMin.value)) {
      return this.splay(leftMax).joinMaxTreeUnsafe(tree);
    }

    for (const value of tree) {
      this.insert(value);
    }

    tree.clear();
    return this;
  }
  [Symbol.iterator]() {
    let current = this.root ? this.root.getMin() : null;
    return {
      next: () => {
        if (!current) return {done: true};
        const last = current;
        if (current.right) {
          current = current.right.getMin();
        } else {
          for (;;) {
            const parent = current.parent;
            if (!parent) {
              current = null;
              break;
            }
            if (parent.left === current) {
              current = parent;
              break;
            }
            current = parent;
          }
        }
        return {value: last.value};
      }
    };
  }
  getReverseIterator() {
    return {
      [Symbol.iterator]: () => {
        let current = this.root ? this.root.getMax() : null;
        return {
          next: () => {
            if (!current) return {done: true};
            const last = current;
            if (current.left) {
              current = current.left.getMax();
            } else {
              for (;;) {
                const parent = current.parent;
                if (!parent) {
                  current = null;
                  break;
                }
                if (parent.right === current) {
                  current = parent;
                  break;
                }
                current = parent;
              }
            }
            return {value: last.value};
          }
        };
      }
    };
  }
  static from(values, options) {
    const tree = new SplayTree(options);
    for (const value of values) {
      tree.insert(value);
    }
    return tree;
  }
}

SplayTree.defaults = {less: defaultLess, compare: null};

export default SplayTree;
