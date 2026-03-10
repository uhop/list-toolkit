import test from 'tape-six';
import SplayTree, {SplayTreeNode} from 'list-toolkit/tree/splay-tree.js';
import type {HeapOptions} from 'list-toolkit/heap/basics.js';

test('SplayTree<T>: constructor and basic property types', t => {
  const tree = new SplayTree<number>();
  const _len: number = tree.length;
  const _empty: boolean = tree.isEmpty;
  t.pass('compiles');
});

test('SplayTree<T>: insert/remove return types', t => {
  const tree = new SplayTree<number>();
  const _self: SplayTree<number> = tree.insert(10);
  const _self2: SplayTree<number> = tree.insert(20).insert(30);
  const _self3: SplayTree<number> = tree.remove(20);
  t.pass('compiles');
});

test('SplayTree<T>: find/promote return SplayTreeNode<T> | null', t => {
  const tree = SplayTree.from<number>([10, 20, 30]);
  const found: SplayTreeNode<number> | null = tree.find(20);
  const promoted: SplayTreeNode<number> | null = tree.promote(10);
  t.pass('compiles');
});

test('SplayTree<T>: getMin/getMax return SplayTreeNode<T>', t => {
  const tree = SplayTree.from<number>([10, 20, 30]);
  const min: SplayTreeNode<number> = tree.getMin();
  const max: SplayTreeNode<number> = tree.getMax();
  const _val: number = min.value;
  t.pass('compiles');
});

test('SplayTree<T>: split/join types', t => {
  const tree = SplayTree.from<number>([1, 2, 3, 4, 5]);
  const right: SplayTree<number> = tree.splitMaxTree(3);
  const _self: SplayTree<number> = tree.join(right);
  t.pass('compiles');
});

test('SplayTree<T>: splay/clear types', t => {
  const tree = SplayTree.from<number>([1, 2, 3]);
  const node = tree.find(2);
  if (node) {
    const _self: SplayTree<number> = tree.splay(node);
  }
  const _self2: SplayTree<number> = tree.clear();
  t.pass('compiles');
});

test('SplayTree<T>: iterator types', t => {
  const tree = SplayTree.from<number>([3, 1, 2]);
  const iter: IterableIterator<number> = tree[Symbol.iterator]();
  const revIter: IterableIterator<number> = tree.getReverseIterator();
  t.pass('compiles');
});

test('SplayTree<T>: custom compare option', t => {
  const tree = new SplayTree<string>({compare: (a, b) => a.localeCompare(b)});
  const _self: SplayTree<string> = tree.insert('b').insert('a');
  const found: SplayTreeNode<string> | null = tree.find('a');
  t.pass('compiles');
});

test('SplayTree<T>: custom less option with objects', t => {
  interface Item {
    key: number;
    label: string;
  }
  const tree = new SplayTree<Item>({less: (a, b) => a.key < b.key});
  const _self: SplayTree<Item> = tree.insert({key: 1, label: 'a'});
  const found: SplayTreeNode<Item> | null = tree.find({key: 1, label: ''});
  t.pass('compiles');
});

test('SplayTree<T>: static from type', t => {
  const tree: SplayTree<number> = SplayTree.from<number>([1, 2, 3]);
  t.pass('compiles');
});

test('SplayTreeNode<T>: value type', t => {
  const node = new SplayTreeNode<number>(42);
  const _val: number = node.value;
  t.pass('compiles');
});
