import SplayTree from '../src/tree/splay-tree.js';

// the pre-2026-07-18 SplayTree without subtree-size augmentation, for comparison

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

class OldSplayTreeNode {
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

class OldSplayTree {
  constructor() {
    this.less = (a, b) => a < b;
    this.root = null;
    this.size = 0;
  }
  getMax() {
    return this.root && this.root.getMax();
  }
  getMin() {
    return this.root && this.root.getMin();
  }
  find(value) {
    for (let z = this.root; z;) {
      if (this.less(z.value, value)) z = z.right;
      else if (this.less(value, z.value)) z = z.left;
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
      z = new OldSplayTreeNode(value);
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
    if (!this.root) return new OldSplayTree();
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

    const newTree = new OldSplayTree();
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
      } else {
        this.size = 0;
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
    const leftMax = this.getMax(),
      rightMin = tree.getMin();
    if (this.less(leftMax.value, rightMin.value)) {
      return this.splay(leftMax).joinMaxTreeUnsafe(tree);
    }
    for (const value of tree) {
      this.insert(value);
    }
    tree.clear();
    return this;
  }
}

const data = Array.from({length: 10_000}, () => Math.random());
const pivots = Array.from({length: 100}, () => Math.random());

const fill = tree => {
  for (const value of data) tree.insert(value);
  return tree;
};

export default {
  'SplayTree insert+remove': n => {
    let tree;
    for (let i = 0; i < n; ++i) {
      tree = fill(new SplayTree());
      for (const value of data) tree.remove(value);
    }
    return tree;
  },

  'old insert+remove': n => {
    let tree;
    for (let i = 0; i < n; ++i) {
      tree = fill(new OldSplayTree());
      for (const value of data) tree.remove(value);
    }
    return tree;
  },

  'SplayTree promote': n => {
    const tree = fill(new SplayTree());
    for (let i = 0; i < n; ++i) {
      for (const value of data) tree.promote(value);
    }
    return tree;
  },

  'old promote': n => {
    const tree = fill(new OldSplayTree());
    for (let i = 0; i < n; ++i) {
      for (const value of data) tree.promote(value);
    }
    return tree;
  },

  'SplayTree split+join': n => {
    const tree = fill(new SplayTree());
    for (let i = 0; i < n; ++i) {
      for (const pivot of pivots) tree.join(tree.splitMaxTree(pivot));
    }
    return tree;
  },

  'old split+join': n => {
    const tree = fill(new OldSplayTree());
    for (let i = 0; i < n; ++i) {
      for (const pivot of pivots) tree.join(tree.splitMaxTree(pivot));
    }
    return tree;
  }
};
