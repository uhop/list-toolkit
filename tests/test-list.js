'use strict';

import test from 'tape-six';
import List from 'list-toolkit/list.js';

test('General List tests', t => {
  const numbers = List.from([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    odds = new List(),
    evens = new List();

  for (const value of numbers.getReverseIterable()) {
    if (value & 1) {
      odds.pushFront(value);
    } else {
      evens.pushBack(value);
    }
  }

  numbers.reverse();
  evens.reverse();

  t.deepEqual(Array.from(numbers), [9, 8, 7, 6, 5, 4, 3, 2, 1]);
  t.deepEqual(Array.from(odds), [1, 3, 5, 7, 9]);
  t.deepEqual(Array.from(evens), [2, 4, 6, 8]);

  const oddsAndEvens = new List();

  for (const value of odds) oddsAndEvens.pushBack(value);
  for (const value of evens) oddsAndEvens.pushBack(value);

  t.deepEqual(Array.from(oddsAndEvens), [1, 3, 5, 7, 9, 2, 4, 6, 8]);
  t.deepEqual(Array.from(oddsAndEvens.sort((a, b) => a - b)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('Elementary List operations', t => {
  const list = new List();
  t.ok(list.isEmpty);

  list.pushBack(1);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 1);
  t.equal(list.back.value, 1);
  t.equal(list.getLength(), 1);
  t.deepEqual(Array.from(list), [1]);
  t.deepEqual(Array.from(list.getReverseIterable()), [1]);

  list.pushFront(2);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 2);
  t.equal(list.back.value, 1);
  t.equal(list.getLength(), 2);
  t.deepEqual(Array.from(list), [2, 1]);
  t.deepEqual(Array.from(list.getReverseIterable()), [1, 2]);

  list.pushBack(3);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 2);
  t.equal(list.back.value, 3);
  t.equal(list.getLength(), 3);
  t.deepEqual(Array.from(list), [2, 1, 3]);
  t.deepEqual(Array.from(list.getReverseIterable()), [3, 1, 2]);

  t.equal(list.popFront(), 2);
  t.equal(list.front.value, 1);
  t.equal(list.back.value, 3);
  t.equal(list.getLength(), 2);
  t.deepEqual(Array.from(list), [1, 3]);
  t.deepEqual(Array.from(list.getReverseIterable()), [3, 1]);

  t.equal(list.popBack(), 3);
  t.equal(list.front.value, 1);
  t.equal(list.back.value, 1);
  t.equal(list.getLength(), 1);
  t.deepEqual(Array.from(list), [1]);
  t.deepEqual(Array.from(list.getReverseIterable()), [1]);

  list.appendFront(List.from([2, 3]));
  t.equal(list.front.value, 2);
  t.equal(list.back.value, 1);
  t.equal(list.getLength(), 3);
  t.deepEqual(Array.from(list), [2, 3, 1]);
  t.deepEqual(Array.from(list.getReverseIterable()), [1, 3, 2]);

  list.appendBack(List.from([4, 5]));
  t.equal(list.front.value, 2);
  t.equal(list.back.value, 5);
  t.equal(list.getLength(), 5);
  t.deepEqual(Array.from(list), [2, 3, 1, 4, 5]);
  t.deepEqual(Array.from(list.getReverseIterable()), [5, 4, 1, 3, 2]);

  const two = list.front,
    five = list.back;
  list.moveToFront(five);
  t.deepEqual(Array.from(list), [5, 2, 3, 1, 4]);
  list.moveToBack(two);
  t.deepEqual(Array.from(list), [5, 3, 1, 4, 2]);

  list.clear();
  t.ok(list.isEmpty);
  t.equal(list.getLength(), 0);
  t.deepEqual(Array.from(list), []);
  t.deepEqual(Array.from(list.getReverseIterable()), []);
});

test('List.remove()', t => {
  const list = List.from([1, 2, 3, 4, 5]);
  list.remove(list.front.next, list.back.prev);
  t.deepEqual(Array.from(list), [1, 5]);
});

test('List.extract()', t => {
  const list = List.from([1, 2, 3, 4, 5]),
    extract = list.extract(list.front.next, list.back.prev);
  t.deepEqual(Array.from(list), [1, 5]);
  t.deepEqual(Array.from(extract), [2, 3, 4]);
});

test('List.reverse()', t => {
  const list = List.from([1, 2, 3, 4, 5]);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);
  list.reverse();
  t.deepEqual(Array.from(list), [5, 4, 3, 2, 1]);
});

test('List.sort()', t => {
  const list = List.from([3, 1, 5, 4, 2]);
  list.sort((a, b) => b - a);
  t.deepEqual(Array.from(list), [5, 4, 3, 2, 1]);
  list.sort((a, b) => a - b);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);
});

test('List iterators', t => {
  const list = List.from([1, 2, 3, 4, 5]);

  {
    const array = [];
    for (const value of list) array.push(value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const array = [];
    for (const value of list.getIterable()) array.push(value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const array = [];
    for (const value of list.getIterable(list.front.next, list.back.prev)) array.push(value);
    t.deepEqual(array, [2, 3, 4]);
  }

  {
    const array = [];
    for (const value of list.getReverseIterable()) array.push(value);
    t.deepEqual(array, [5, 4, 3, 2, 1]);
  }

  {
    const array = [];
    for (const value of list.getReverseIterable(list.front.next, list.back.prev)) array.push(value);
    t.deepEqual(array, [4, 3, 2]);
  }

  {
    const array = [];
    for (const node of list.getNodeIterable()) array.push(node.value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const array = [];
    for (const node of list.getNodeIterable(list.front.next, list.back.prev)) array.push(node.value);
    t.deepEqual(array, [2, 3, 4]);
  }

  {
    const array = [];
    for (const node of list.getReverseNodeIterable()) array.push(node.value);
    t.deepEqual(array, [5, 4, 3, 2, 1]);
  }

  {
    const array = [];
    for (const node of list.getReverseNodeIterable(list.front.next, list.back.prev)) array.push(node.value);
    t.deepEqual(array, [4, 3, 2]);
  }
});

test('List helpers', t => {
  const list = new List();

  {
    const other = list.makeFrom([1, 2, 3, 4, 5]);
    t.deepEqual(Array.from(other), [1, 2, 3, 4, 5]);
  }

  list.pushValuesFront([1, 2]);
  t.deepEqual(Array.from(list), [2, 1]);

  list.pushValuesBack([3, 4]);
  t.deepEqual(Array.from(list), [2, 1, 3, 4]);

  list.appendValuesFront([5, 6]);
  t.deepEqual(Array.from(list), [5, 6, 2, 1, 3, 4]);

  list.appendValuesBack([7, 8]);
  t.deepEqual(Array.from(list), [5, 6, 2, 1, 3, 4, 7, 8]);
});
