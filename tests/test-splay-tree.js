'use strict';

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
  t.deepEqual([...tree], [5, 4, 3, 2, 1]);
  t.deepEqual([...tree.getReverseIterator()], [1, 2, 3, 4, 5]);

  t.equal(tree.root.value, 4);

  const newTree = tree.splitMaxTree(3);
  t.deepEqual([...newTree], [2, 1]);
  t.deepEqual([...tree], [5, 4, 3]);
});
