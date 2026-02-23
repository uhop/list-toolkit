import test from 'tape-six';
import SplayTree, {SplayTreeNode} from 'list-toolkit/tree/splay-tree.js';

test('SplayTree<T>: default numeric ordering', t => {
  const tree = new SplayTree<number>();
  tree.insert(30).insert(10).insert(20);

  t.equal(tree.length, 3);

  const node: SplayTreeNode<number> | null = tree.find(20);
  t.ok(node);
  t.equal(node!.value, 20);
});

test('SplayTree<T>: iteration yields T in order', t => {
  const tree = SplayTree.from<number>([30, 10, 20, 40, 5]);

  const values: number[] = [];
  for (const v of tree) {
    values.push(v);
  }
  t.deepEqual(values, [5, 10, 20, 30, 40]);
});

test('SplayTree<T>: getReverseIterator yields T descending', t => {
  const tree = SplayTree.from<number>([1, 3, 2]);

  const values: number[] = [];
  for (const v of tree.getReverseIterator()) {
    values.push(v);
  }
  t.deepEqual(values, [3, 2, 1]);
});

test('SplayTree<T>: string values with custom compare', t => {
  const tree = new SplayTree<string>({
    compare: (a: string, b: string) => a.localeCompare(b)
  });
  tree.insert('banana').insert('apple').insert('cherry');

  t.equal(tree.length, 3);

  const values: string[] = Array.from(tree);
  t.deepEqual(values, ['apple', 'banana', 'cherry']);
});

test('SplayTree<T>: getMin/getMax return SplayTreeNode<T>', t => {
  const tree = SplayTree.from<number>([30, 10, 20]);

  const min: SplayTreeNode<number> = tree.getMin();
  t.equal(min.value, 10);

  const max: SplayTreeNode<number> = tree.getMax();
  t.equal(max.value, 30);
});

test('SplayTree<T>: split and join', t => {
  const tree = SplayTree.from<number>([1, 2, 3, 4, 5]);

  const right: SplayTree<number> = tree.splitMaxTree(3);
  t.ok(right.length > 0);

  tree.join(right);
  t.ok(right.isEmpty);
  t.equal(tree.length, 5);
});

test('SplayTree<T>: remove', t => {
  const tree = SplayTree.from<number>([1, 2, 3]);
  tree.remove(2);

  t.equal(tree.length, 2);
  t.equal(tree.find(2), null);
});

test('SplayTree<T>: object values with custom less', t => {
  interface Item {
    key: number;
    label: string;
  }
  const tree = new SplayTree<Item>({less: (a, b) => a.key < b.key});
  tree.insert({key: 3, label: 'c'});
  tree.insert({key: 1, label: 'a'});
  tree.insert({key: 2, label: 'b'});

  const values: Item[] = Array.from(tree);
  t.deepEqual(
    values.map(v => v.label),
    ['a', 'b', 'c']
  );
});
