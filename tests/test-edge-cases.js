import test from 'tape-six';
import List from 'list-toolkit/list.js';
import SList from 'list-toolkit/slist.js';
import ValueSList from 'list-toolkit/value-slist.js';
import MinHeap from 'list-toolkit/heap/min-heap.js';
import SplayTree from 'list-toolkit/tree/splay-tree.js';
import Queue from 'list-toolkit/queue.js';
import Stack from 'list-toolkit/stack.js';
import {cacheDecorator} from 'list-toolkit/cache.js';

test('SplayTree.getMin / getMax on empty tree return null', t => {
  const tree = new SplayTree();
  t.ok(tree.isEmpty);
  t.equal(tree.getMin(), null, 'getMin returns null on empty');
  t.equal(tree.getMax(), null, 'getMax returns null on empty');
});

test('SplayTree.getMin / getMax on non-empty work', t => {
  const tree = SplayTree.from([5, 1, 9, 3]);
  t.equal(tree.getMin().value, 1);
  t.equal(tree.getMax().value, 9);
});

test('MinHeap instance replaceTop on empty heap returns undefined and seeds', t => {
  const heap = new MinHeap();
  t.ok(heap.isEmpty);
  t.equal(heap.replaceTop(42), undefined, 'no element to replace');
  t.equal(heap.array.length, 1, 'heap now has the seeded value');
  t.equal(heap.array[0], 42);
});

test('List.appendFront / appendBack with empty source returns this list (chainable no-op)', t => {
  const list1 = List.from([{x: 1}]);
  const empty = new List();
  const result1 = list1.appendFront(empty);
  t.equal(result1, list1, 'returns the receiving list when source is empty');

  const result2 = list1.appendBack(empty);
  t.equal(result2, list1, 'same for appendBack');
});

test('List.appendFront / appendBack with non-empty source returns a Ptr', t => {
  const list1 = List.from([{x: 1}, {x: 2}]);
  const list2 = List.from([{x: 3}]);
  const result = list1.appendFront(list2);
  t.notEqual(result, list1, 'returns a Ptr, not the list');
  t.ok(result.node, 'Ptr has a node');
  t.equal(result.node.x, 3, 'Ptr points at the appended front node');
});

test('SList.appendFront / appendBack with empty source returns this list', t => {
  const list1 = SList.from([{id: 1}]);
  const empty = new SList();
  t.equal(list1.appendFront(empty), list1);
  t.equal(list1.appendBack(empty), list1);
});

test('Queue.getReverseIterator works with default (DLL-backed)', t => {
  const q = new Queue();
  q.add(1).add(2).add(3);
  const rev = q.getReverseIterator();
  t.notEqual(rev, undefined, 'DLL backing supports reverse iteration');
  t.deepEqual([...rev], [3, 2, 1]);
});

test('Queue.getReverseIterator returns undefined when underlying is SLL-based', t => {
  const q = new Queue(new ValueSList());
  q.add(1).add(2).add(3);
  t.equal(q.getReverseIterator(), undefined, 'SLL-backed queue cannot reverse-iterate');
});

test('Stack.getReverseIterator works with default (DLL-backed)', t => {
  const s = new Stack();
  s.push(1).push(2).push(3);
  const rev = s.getReverseIterator();
  t.notEqual(rev, undefined);
  t.deepEqual([...rev], [1, 2, 3], 'reverse of LIFO is FIFO order');
});

test('Stack.getReverseIterator returns undefined when underlying is SLL-based', t => {
  const s = new Stack(ValueSList);
  s.push(1).push(2);
  t.equal(s.getReverseIterator(), undefined);
});

test('SList.fromRange — basic move from a source list', t => {
  const source = SList.from([{id: 1}, {id: 2}, {id: 3}, {id: 4}]);
  const head = source[source.nextName],
    second = head[source.nextName],
    third = second[source.nextName];
  const copy = SList.fromRange({from: second, to: third, list: source});
  t.notEqual(copy, source);
  t.deepEqual(
    [...copy].map(n => n.id),
    [2, 3],
    'copy contains the moved range'
  );
  // Source list had its range moved out — only first and fourth remain.
  t.deepEqual(
    [...source].map(n => n.id),
    [1, 4],
    'source has range removed'
  );
});

test('SList.fromRange — null range returns empty list', t => {
  const empty = SList.fromRange(null, {nextName: 'next'});
  t.ok(empty instanceof SList);
  t.ok(empty.isEmpty);
});

test('SList.fromRange — missing range.list throws', t => {
  const source = SList.from([{id: 1}, {id: 2}]);
  const head = source[source.nextName];
  t.throws(() => SList.fromRange({from: head, to: head}));
});

test('SList.fromRange — incomplete range throws', t => {
  const source = SList.from([{id: 1}, {id: 2}]);
  t.throws(() => SList.fromRange({list: source}));
});

test('makeFromRange instance method on SList works (regression: was calling non-existent SList.fromRange)', t => {
  const source = SList.from([{id: 1}, {id: 2}, {id: 3}]);
  const head = source[source.nextName],
    second = head[source.nextName];
  const copy = source.makeFromRange({from: head, to: second, list: source});
  t.deepEqual(
    [...copy].map(n => n.id),
    [1, 2]
  );
});

test('cacheDecorator return value is the wrapped function (with .fn and .cache)', t => {
  const obj = {square: x => x * x};
  const wrapped = cacheDecorator(obj, 'square');
  t.equal(typeof wrapped, 'function', 'returns the wrapped function');
  t.equal(typeof wrapped.fn, 'function', 'has .fn property');
  t.ok(wrapped.cache, 'has .cache property');
  // The wrapper should also be the new value of obj.square.
  t.equal(obj.square, wrapped, 'replaces obj[key] with the wrapper');
  t.equal(obj.square(7), 49, 'still computes correctly');
  t.equal(obj.square(7), 49, 'cached call');
});
