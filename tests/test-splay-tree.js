import test from 'tape-six';
import SplayTree from 'list-toolkit/tree/splay-tree.js';

test('SplayTree', t => {
  t.equal(typeof SplayTree, 'function');

  const tree = new SplayTree();
  t.ok(tree.isEmpty);
  t.equal(tree.length, 0);

  tree.insert(3).insert(2).insert(5).insert(1).insert(4);
  t.notOk(tree.isEmpty);
  t.equal(tree.length, 5);

  t.equal(tree.getMin().value, 1);
  t.equal(tree.getMax().value, 5);
  t.equal(tree.find(3).value, 3);

  t.equal(tree.promote(3).value, 3);
  t.equal(tree.root.value, 3);
  t.equal(tree.getMin().value, 1);
  t.equal(tree.getMax().value, 5);
  t.equal(tree.find(3).value, 3);

  t.deepEqual([...tree], [1, 2, 3, 4, 5]);
  t.deepEqual([...tree.getReverseIterator()], [5, 4, 3, 2, 1]);

  tree.remove(3);
  t.equal(tree.length, 4);
  t.equal(tree.find(3), null);
  t.equal(tree.getMin().value, 1);
  t.equal(tree.getMax().value, 5);
  t.deepEqual([...tree], [1, 2, 4, 5]);
  t.deepEqual([...tree.getReverseIterator()], [5, 4, 2, 1]);

  const newTree = tree.splitMaxTree(3);
  t.deepEqual([...newTree], [4, 5]);
  t.deepEqual([...tree], [1, 2]);
});

test('SplayTree: from()', t => {
  const tree = SplayTree.from([3, 2, 5, 1, 4]);
  t.deepEqual([...tree], [1, 2, 3, 4, 5]);
  t.deepEqual([...tree.getReverseIterator()], [5, 4, 3, 2, 1]);

  t.equal(tree.root.value, 4);
  t.equal(tree.getMin().value, 1);
  t.equal(tree.getMax().value, 5);
});

test('SplayTree: compare()', t => {
  const tree = new SplayTree({compare: (a, b) => a - b});
  t.ok(tree.isEmpty);
  t.equal(tree.length, 0);

  tree.insert(3).insert(2).insert(5).insert(1).insert(4);
  t.notOk(tree.isEmpty);
  t.equal(tree.length, 5);

  t.equal(tree.getMin().value, 1);
  t.equal(tree.getMax().value, 5);
  t.equal(tree.find(3).value, 3);

  t.equal(tree.promote(3).value, 3);
  t.equal(tree.root.value, 3);
  t.equal(tree.getMin().value, 1);
  t.equal(tree.getMax().value, 5);
  t.equal(tree.find(3).value, 3);

  t.deepEqual([...tree], [1, 2, 3, 4, 5]);
  t.deepEqual([...tree.getReverseIterator()], [5, 4, 3, 2, 1]);

  tree.remove(3);
  t.equal(tree.length, 4);
  t.equal(tree.find(3), null);
  t.equal(tree.getMin().value, 1);
  t.equal(tree.getMax().value, 5);
  t.deepEqual([...tree], [1, 2, 4, 5]);
  t.deepEqual([...tree.getReverseIterator()], [5, 4, 2, 1]);

  const newTree = tree.splitMaxTree(3);
  t.deepEqual([...newTree], [4, 5]);
  t.deepEqual([...tree], [1, 2]);
});

test('SplayTree: splitMaxTree()', t => {
  const tree = SplayTree.from([3, 2, 5, 1, 4], {compare: (a, b) => b - a});
  t.equal(tree.length, 5);
  t.deepEqual([...tree], [5, 4, 3, 2, 1]);
  t.deepEqual([...tree.getReverseIterator()], [1, 2, 3, 4, 5]);

  t.equal(tree.root.value, 4);

  const newTree = tree.splitMaxTree(3);
  t.equal(newTree.length, 2);
  t.equal(tree.length, 3);
  t.deepEqual([...newTree], [2, 1]);
  t.deepEqual([...tree], [5, 4, 3]);
});

test('SplayTree: staples', t => {
  const tree = SplayTree.from([30, 20, 50, 10, 40]);

  t.ok(tree.has(30));
  t.notOk(tree.has(35));

  t.equal(tree.floor(35).value, 30);
  t.equal(tree.floor(30).value, 30);
  t.equal(tree.floor(100).value, 50);
  t.equal(tree.floor(5), null);

  t.equal(tree.ceil(35).value, 40);
  t.equal(tree.ceil(40).value, 40);
  t.equal(tree.ceil(5).value, 10);
  t.equal(tree.ceil(100), null);

  const empty = new SplayTree();
  t.notOk(empty.has(1));
  t.equal(empty.floor(1), null);
  t.equal(empty.ceil(1), null);
});

test('SplayTree: order statistics', t => {
  const tree = SplayTree.from([30, 20, 50, 10, 40]);

  t.equal(tree.at(0).value, 10);
  t.equal(tree.at(2).value, 30);
  t.equal(tree.at(4).value, 50);
  t.equal(tree.at(-1).value, 50);
  t.equal(tree.at(-5).value, 10);
  t.equal(tree.at(5), null);
  t.equal(tree.at(-6), null);

  t.equal(tree.indexOf(10), 0);
  t.equal(tree.indexOf(30), 2);
  t.equal(tree.indexOf(50), 4);
  t.equal(tree.indexOf(35), -1);

  const withCompare = SplayTree.from([30, 20, 50, 10, 40], {compare: (a, b) => a - b});
  t.equal(withCompare.indexOf(40), 3);
  t.equal(withCompare.indexOf(35), -1);
  t.equal(withCompare.at(3).value, 40);
});

test('SplayTree: range iteration', t => {
  const tree = SplayTree.from([30, 20, 50, 10, 40]);

  t.deepEqual([...tree.getIterator()], [10, 20, 30, 40, 50]);
  t.deepEqual([...tree.getIterator({from: 20})], [20, 30, 40, 50]);
  t.deepEqual([...tree.getIterator({to: 30})], [10, 20, 30]);
  t.deepEqual([...tree.getIterator({from: 15, to: 45})], [20, 30, 40]);
  t.deepEqual([...tree.getIterator({from: 20, to: 20})], [20]);
  t.deepEqual([...tree.getIterator({from: 45, to: 15})], []);
  t.deepEqual(
    [...tree.getNodeIterator({from: 15, to: 45})].map(node => node.value),
    [20, 30, 40]
  );
  t.deepEqual([...new SplayTree().getIterator()], []);
});

test('SplayTree: duplicates are ignored', t => {
  const tree = SplayTree.from([3, 1, 3, 2, 1]);
  t.equal(tree.length, 3);
  t.deepEqual([...tree], [1, 2, 3]);

  tree.insert(2);
  t.equal(tree.length, 3);
  t.equal(tree.root.value, 2);
});

const collectSizeMismatches = tree => {
  const mismatches = [],
    walk = node => {
      if (!node) return 0;
      const total = walk(node.left) + walk(node.right) + 1;
      if (node.size !== total) mismatches.push({value: node.value, size: node.size, total});
      return total;
    },
    total = walk(tree.root);
  if (total !== tree.size) mismatches.push({treeSize: tree.size, total});
  return mismatches;
};

test('SplayTree: subtree sizes', t => {
  let seed = 42;
  const random = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x80000000;

  const tree = new SplayTree(),
    present = new Set();
  for (let i = 0; i < 500; ++i) {
    const value = Math.floor(random() * 200);
    if (random() < 0.6) {
      tree.insert(value);
      present.add(value);
    } else {
      tree.remove(value);
      present.delete(value);
    }
    if (random() < 0.1) tree.promote(Math.floor(random() * 200));
  }

  t.equal(tree.size, present.size);
  t.deepEqual(collectSizeMismatches(tree), []);

  const sorted = [...present].sort((a, b) => a - b),
    statMismatches = [];
  sorted.forEach((value, index) => {
    if (tree.indexOf(value) !== index) statMismatches.push({value, index, indexOf: tree.indexOf(value)});
    if (tree.at(index).value !== value) statMismatches.push({value, index, at: tree.at(index).value});
  });
  t.deepEqual(statMismatches, []);
  t.deepEqual([...tree], sorted);
});

test('SplayTree: splitMaxTree() sizes', t => {
  let tree = SplayTree.from([5, 6]),
    newTree = tree.splitMaxTree(1);
  t.equal(tree.length, 0);
  t.equal(tree.root, null);
  t.ok(tree.isEmpty);
  t.equal(newTree.length, 2);
  t.deepEqual([...newTree], [5, 6]);

  tree = SplayTree.from([5, 6], {compare: (a, b) => a - b});
  newTree = tree.splitMaxTree(1);
  t.equal(tree.length, 0);
  t.equal(tree.root, null);
  t.equal(newTree.length, 2);
  t.deepEqual([...newTree], [5, 6]);

  tree = SplayTree.from([1, 2, 3, 4, 5]);
  newTree = tree.splitMaxTree(10);
  t.equal(tree.length, 5);
  t.ok(newTree.isEmpty);
  t.equal(newTree.length, 0);

  newTree = tree.splitMaxTree(3);
  t.equal(tree.length, 3);
  t.equal(tree.root.size, 3);
  t.equal(newTree.length, 2);
  t.equal(newTree.root.size, 2);
  t.deepEqual(collectSizeMismatches(tree), []);
  t.deepEqual(collectSizeMismatches(newTree), []);

  tree.join(newTree);
  t.equal(tree.length, 5);
  t.equal(tree.root.size, 5);
  t.deepEqual(collectSizeMismatches(tree), []);
  t.deepEqual([...tree], [1, 2, 3, 4, 5]);
});

test('SplayTree: join()', t => {
  const tree = SplayTree.from([3, 2, 5, 1, 4]);
  t.equal(tree.length, 5);
  t.deepEqual([...tree], [1, 2, 3, 4, 5]);
  t.deepEqual([...tree.getReverseIterator()], [5, 4, 3, 2, 1]);

  let newTree = tree.splitMaxTree(3);
  t.equal(newTree.length, 2);
  t.equal(tree.length, 3);
  t.deepEqual([...newTree], [4, 5]);
  t.deepEqual([...tree], [1, 2, 3]);

  tree.joinMaxTreeUnsafe(newTree);
  t.equal(tree.length, 5);
  t.deepEqual([...tree], [1, 2, 3, 4, 5]);
  t.ok(newTree.isEmpty);
  t.equal(newTree.root, null);

  newTree = tree.splitMaxTree(3);
  tree.join(newTree);
  t.equal(tree.length, 5);
  t.deepEqual([...tree], [1, 2, 3, 4, 5]);
  t.ok(newTree.isEmpty);
  t.equal(newTree.root, null);
});
