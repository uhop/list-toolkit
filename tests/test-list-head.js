'use strict';

import test from 'tape-six';
import ListHead from '../src/ListHead.js';

test('Elementary ListHead operations', t => {
  t.equal(typeof ListHead, 'function');

  const a = {x: 1}, b = {x: 2}, c = {x: 3};
  const list = new ListHead();

  t.ok(list.isEmpty);

  list.pushFront(a);
  t.notOk(list.isEmpty);
  t.ok(list.front === a);
  t.ok(list.back === a);

  list.pushFront(b);
  t.notOk(list.isEmpty);
  t.ok(b[list.nextName] === a);
  t.ok(a[list.prevName] === b);
  t.equal(list.getLength(), 2);
  t.ok(list.front === b);
  t.ok(list.back === a);
  t.deepEqual(Array.from(list).map(value => value.x), [2, 1]);

  list.pushBack(c);
  t.equal(list.getLength(), 3);
  t.ok(list.front === b);
  t.ok(list.back === c);
  t.deepEqual(Array.from(list).map(value => value.x), [2, 1, 3]);

  t.ok(list.popFront() === b);
  t.deepEqual(Array.from(list).map(value => value.x), [1, 3]);

  t.ok(list.popBack() === c);
  t.deepEqual(Array.from(list).map(value => value.x), [1]);

  list.appendFront(ListHead.from([b, c]));
  t.deepEqual(Array.from(list).map(value => value.x), [2, 3, 1]);

  list.popFront();
  list.popFront();
  list.appendBack(ListHead.from([b, c]));
  t.deepEqual(Array.from(list).map(value => value.x), [1, 2, 3]);

  list.moveToFront(b);
  t.deepEqual(Array.from(list).map(value => value.x), [2, 1, 3]);

  list.moveToBack(b);
  t.deepEqual(Array.from(list).map(value => value.x), [1, 3, 2]);

  const extract = list.extract(a, c);
  t.deepEqual(Array.from(list).map(value => value.x), [2]);
  t.deepEqual(Array.from(extract).map(value => value.x), [1, 3]);
  extract.clear(true);

  list.clear(true);
  t.ok(list.isEmpty);
  t.deepEqual(Array.from(list), []);

  list.appendFront(ListHead.from([a, b, c])).remove(a, c);
  t.deepEqual(Array.from(list), []);

  new ListHead(a).clear(true);

  list.appendFront(ListHead.from([a, b, c])).reverse();
  t.deepEqual(Array.from(list).map(value => value.x), [3, 2, 1]);

  list.sort((a, b) => a.x - b.x);
  t.deepEqual(Array.from(list).map(value => value.x), [1, 2, 3]);
});

test('ListHead iterators', t => {
  const a = {x: 1}, b = {x: 2}, c = {x: 3};
  const list = ListHead.from([a, b, c]);

  {
    const array = [];
    for (const value of list) array.push(value.x);
    t.deepEqual(array, [1, 2, 3]);
  }

  {
    const array = [];
    for (const value of list.getIterable()) array.push(value.x);
    t.deepEqual(array, [1, 2, 3]);
  }

  {
    const array = [];
    for (const value of list.getIterable(b, b)) array.push(value.x);
    t.deepEqual(array, [2]);
  }

  {
    const array = [];
    for (const value of list.getReverseIterable()) array.push(value.x);
    t.deepEqual(array, [3, 2, 1]);
  }

  {
    const array = [];
    for (const value of list.getReverseIterable(b, b)) array.push(value.x);
    t.deepEqual(array, [2]);
  }
});

test('ListHead helpers', t => {
  const a = {x: 1}, b = {x: 2}, c = {x: 3};
  const list = new ListHead();

  {
    const other = list.makeFrom([b, a, c]);
    t.deepEqual(Array.from(other).map(value => value.x), [2, 1, 3]);
    other.clear(true);
  }

  list.pushValuesFront([a, b]);
  t.deepEqual(Array.from(list).map(value => value.x), [2, 1]);

  list.pushValuesBack([c]);
  t.deepEqual(Array.from(list).map(value => value.x), [2, 1, 3]);
  list.clear(true);

  list.appendValuesFront([c, b]);
  t.deepEqual(Array.from(list).map(value => value.x), [3, 2]);

  list.appendValuesBack([a]);
  t.deepEqual(Array.from(list).map(value => value.x), [3, 2, 1]);
});

test('ListHead with custom next/prev', t => {
  const a = {x: 1}, b = {x: 2}, c = {x: 3};
  const list = new ListHead(null, Symbol(), Symbol());
  list.pushValuesFront([a, b, c]);
  t.deepEqual(Array.from(list).map(value => value.x), [3, 2, 1]);

  t.throws(() => list.adopt(a));
});
