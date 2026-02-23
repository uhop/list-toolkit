'use strict';

import test from 'tape-six';

import ValueList from 'list-toolkit/value-list.js';
import ValueSList from 'list-toolkit/value-slist.js';
import ExtList from 'list-toolkit/ext-list.js';
import {
  isValidList,
  isValidSList,
  addValuesBefore,
  addValuesAfter,
  insertValuesBefore,
  insertValuesAfter,
  appendValuesBack,
  backPusher,
  frontPusher
} from 'list-toolkit/list-utils.js';

test('isValidList: valid DLL', t => {
  const list = ValueList.from([1, 2, 3]);
  t.ok(isValidList(list));
});

test('isValidList: empty DLL', t => {
  const list = new ValueList();
  t.ok(isValidList(list));
});

test('isValidList: corrupted DLL', t => {
  const list = ValueList.from([1, 2, 3]);
  const front = list.front;
  front[list.nextName] = null;
  t.notOk(isValidList(list));
});

test('isValidSList: valid SLL', t => {
  const list = ValueSList.from([1, 2, 3]);
  t.ok(isValidSList(list));
});

test('isValidSList: empty SLL', t => {
  const list = new ValueSList();
  t.ok(isValidSList(list));
});

test('isValidSList: corrupted SLL', t => {
  const list = ValueSList.from([1, 2, 3]);
  const front = list.front;
  front[list.nextName] = null;
  t.notOk(isValidSList(list));
});

test('appendValuesBack', t => {
  const list = ValueList.from([1, 2]);
  appendValuesBack(list, [3, 4, 5]);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);
});

test('appendValuesBack: with compatible list', t => {
  const list = ValueList.from([1, 2]);
  const other = ValueList.from([3, 4]);
  appendValuesBack(list, other);
  t.deepEqual(Array.from(list), [1, 2, 3, 4]);
});

test('addValuesBefore', t => {
  const list = ValueList.from([1, 2, 3]);
  const ptr = list.frontPtr;
  ptr.next();
  addValuesBefore(ptr, [10, 20]);
  t.deepEqual(Array.from(list), [1, 10, 20, 2, 3]);
});

test('addValuesAfter', t => {
  const list = ValueList.from([1, 2, 3]);
  const ptr = list.frontPtr;
  ptr.next();
  addValuesAfter(ptr, [10, 20]);
  t.deepEqual(Array.from(list), [1, 2, 20, 10, 3]);
});

test('insertValuesBefore', t => {
  const list = ValueList.from([1, 2, 3]);
  const ptr = list.frontPtr;
  ptr.next();
  insertValuesBefore(ptr, [10, 20]);
  t.deepEqual(Array.from(list), [1, 10, 20, 2, 3]);
});

test('insertValuesAfter', t => {
  const list = ValueList.from([1, 2, 3]);
  const ptr = list.frontPtr;
  ptr.next();
  insertValuesAfter(ptr, [10, 20]);
  t.deepEqual(Array.from(list), [1, 2, 10, 20, 3]);
});

test('backPusher', t => {
  const pusher = backPusher(ExtList);
  t.equal(typeof pusher.pushBackNode, 'function');
  t.equal(typeof pusher.releaseList, 'function');

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  pusher.pushBackNode(a);
  pusher.pushBackNode(b);
  pusher.pushBackNode(c);

  const list = pusher.releaseList();
  t.ok(list instanceof ExtList);
  t.deepEqual(
    Array.from(list).map(n => n.x),
    [1, 2, 3]
  );
});

test('frontPusher', t => {
  const pusher = frontPusher(ExtList);
  t.equal(typeof pusher.pushFrontNode, 'function');
  t.equal(typeof pusher.releaseList, 'function');

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  pusher.pushFrontNode(a);
  pusher.pushFrontNode(b);
  pusher.pushFrontNode(c);

  const list = pusher.releaseList();
  t.ok(list instanceof ExtList);
  t.deepEqual(
    Array.from(list).map(n => n.x),
    [1, 3, 2]
  );
});
