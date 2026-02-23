'use strict';

const {test} = require('tape-six');

const {List} = require('list-toolkit/list.js');
const {ValueList} = require('list-toolkit/value-list.js');
const {SList} = require('list-toolkit/slist.js');
const {Queue} = require('list-toolkit/queue.js');
const {Stack} = require('list-toolkit/stack.js');
const {MinHeap} = require('list-toolkit/heap.js');
const {SplayTree} = require('list-toolkit/tree/splay-tree.js');

test('CJS: List', t => {
  t.equal(typeof List, 'function');

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new List();
  list.pushFront(a);
  list.pushFront(b);
  list.pushBack(c);
  t.deepEqual(
    Array.from(list).map(n => n.x),
    [2, 1, 3]
  );
});

test('CJS: ValueList', t => {
  t.equal(typeof ValueList, 'function');

  const vl = ValueList.from([10, 20, 30]);
  t.deepEqual(Array.from(vl), [10, 20, 30]);
});

test('CJS: SList', t => {
  t.equal(typeof SList, 'function');

  const d = {y: 4},
    e = {y: 5};
  const slist = new SList();
  slist.pushFront(d);
  slist.pushBack(e);
  t.deepEqual(
    Array.from(slist).map(n => n.y),
    [4, 5]
  );
});

test('CJS: Queue', t => {
  t.equal(typeof Queue, 'function');

  const q = new Queue();
  q.push(1);
  q.push(2);
  q.push(3);
  t.equal(q.pop(), 1);
  t.equal(q.pop(), 2);
});

test('CJS: Stack', t => {
  t.equal(typeof Stack, 'function');

  const s = new Stack();
  s.push(1);
  s.push(2);
  s.push(3);
  t.equal(s.size, 3);
  t.equal(s.top, 3);
  t.equal(s.peek(), 3);
});

test('CJS: MinHeap', t => {
  t.equal(typeof MinHeap, 'function');

  const heap = new MinHeap(null, [5, 3, 1, 4, 2]);
  t.equal(heap.pop(), 1);
  t.equal(heap.pop(), 2);
});

test('CJS: SplayTree', t => {
  t.equal(typeof SplayTree, 'function');

  const tree = SplayTree.from([3, 1, 4, 1, 5, 9]);
  t.ok(tree.find(4));
  t.equal(tree.find(7), null);
});
