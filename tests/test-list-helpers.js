import test from 'tape-six';

import List from 'list-toolkit/list.js';
import {normalizeNode, isRangeLike, normalizeRange, isPtrRangeLike, normalizePtrRange} from 'list-toolkit/list-helpers.js';
import {PtrBase} from 'list-toolkit/list/nodes.js';

test('normalizeNode: with a plain node', t => {
  const list = List.from([{x: 1}, {x: 2}]);
  const node = list.front;
  t.equal(normalizeNode(list, node, PtrBase), node);
});

test('normalizeNode: with a pointer', t => {
  const list = List.from([{x: 1}, {x: 2}]);
  const ptr = list.frontPtr;
  t.equal(normalizeNode(list, ptr, PtrBase), ptr.node);
});

test('normalizeNode: with null', t => {
  const list = new List();
  t.equal(normalizeNode(list, null, PtrBase), null);
});

test('normalizeNode: incompatible pointer throws', t => {
  const list1 = new List({nextName: Symbol(), prevName: Symbol()});
  const list2 = List.from([{x: 1}]);
  const ptr = list2.frontPtr;
  t.throws(() => normalizeNode(list1, ptr, PtrBase));
});

test('normalizeNode: non-node throws', t => {
  const list = new List();
  t.throws(() => normalizeNode(list, 42, PtrBase));
});

test('isRangeLike: null range', t => {
  const list = new List();
  t.ok(isRangeLike(list, null, PtrBase));
});

test('isRangeLike: valid node range', t => {
  const list = List.from([{x: 1}, {x: 2}, {x: 3}]);
  t.ok(isRangeLike(list, {from: list.front, to: list.back}, PtrBase));
});

test('isRangeLike: valid pointer range', t => {
  const list = List.from([{x: 1}, {x: 2}, {x: 3}]);
  const ptrFrom = list.frontPtr;
  const ptrTo = list.backPtr;
  t.ok(isRangeLike(list, {from: ptrFrom, to: ptrTo}, PtrBase));
});

test('isRangeLike: incompatible list in range', t => {
  const list1 = new List({nextName: Symbol(), prevName: Symbol()});
  const list2 = List.from([{x: 1}]);
  t.notOk(isRangeLike(list1, {list: list2}, PtrBase));
});

test('normalizeRange: null range', t => {
  const list = new List();
  t.equal(normalizeRange(list, null, PtrBase), null);
});

test('normalizeRange: resolves pointers to nodes', t => {
  const list = List.from([{x: 1}, {x: 2}, {x: 3}]);
  const ptrFrom = list.frontPtr;
  const ptrTo = list.backPtr;
  const range = normalizeRange(list, {from: ptrFrom, to: ptrTo}, PtrBase);
  t.equal(range.from, ptrFrom.node);
  t.equal(range.to, ptrTo.node);
});

test('normalizeRange: incompatible range throws', t => {
  const list1 = new List({nextName: Symbol(), prevName: Symbol()});
  const list2 = List.from([{x: 1}]);
  t.throws(() => normalizeRange(list1, {list: list2}, PtrBase));
});

test('isPtrRangeLike: null range', t => {
  const list = new List();
  t.ok(isPtrRangeLike(list, null, PtrBase));
});

test('isPtrRangeLike: valid ptr range', t => {
  const list = List.from([{x: 1}, {x: 2}, {x: 3}]);
  const ptrFrom = list.frontPtr;
  const ptrTo = list.backPtr;
  t.ok(isPtrRangeLike(list, {from: ptrFrom, to: ptrTo}, PtrBase));
});

test('isPtrRangeLike: rejects non-ptr from', t => {
  const list = List.from([{x: 1}, {x: 2}]);
  t.notOk(isPtrRangeLike(list, {from: list.front}, PtrBase));
});

test('normalizePtrRange: null range', t => {
  const list = new List();
  t.equal(normalizePtrRange(list, null, PtrBase), null);
});

test('normalizePtrRange: resolves to pointer in range', t => {
  const list = List.from([{x: 1}, {x: 2}, {x: 3}]);
  const ptrFrom = list.frontPtr;
  const ptrTo = list.backPtr;
  const range = normalizePtrRange(list, {from: ptrFrom, to: ptrTo}, PtrBase);
  t.equal(range.from, ptrFrom);
  t.equal(range.to, ptrTo.node);
});

test('normalizePtrRange: incompatible range throws', t => {
  const list1 = new List({nextName: Symbol(), prevName: Symbol()});
  const list2 = List.from([{x: 1}]);
  const ptr = list2.frontPtr;
  t.throws(() => normalizePtrRange(list1, {from: ptr}, PtrBase));
});

test('list.isCompatibleRange: via public API', t => {
  const list = List.from([{x: 1}, {x: 2}, {x: 3}]);
  t.ok(list.isCompatibleRange(null));
  t.ok(list.isCompatibleRange({}));
  t.ok(list.isCompatibleRange({from: list.front, to: list.back}));

  const ptr = list.frontPtr;
  t.ok(list.isCompatibleRange({from: ptr, to: list.back}));

  t.notOk(list.isCompatibleRange({from: {bad: true}}));
});

test('list.normalizeNode: via public API', t => {
  const list = List.from([{x: 1}, {x: 2}]);
  const node = list.front;
  t.equal(list.normalizeNode(node), node);

  const ptr = list.frontPtr;
  t.equal(list.normalizeNode(ptr), ptr.node);

  t.equal(list.normalizeNode(null), null);
});

test('list.normalizeRange: via public API', t => {
  const list = List.from([{x: 1}, {x: 2}, {x: 3}]);
  t.equal(list.normalizeRange(null), null);

  const ptrFrom = list.frontPtr;
  const ptrTo = list.backPtr;
  const range = list.normalizeRange({from: ptrFrom, to: ptrTo});
  t.equal(range.from, ptrFrom.node);
  t.equal(range.to, ptrTo.node);
});
