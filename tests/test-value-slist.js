'use strict';

import test from 'tape-six';
import ValueSList from 'list-toolkit/value-slist.js';
import {pushValuesFront, findPtrBy, removeNodeBy} from 'list-toolkit/list-utils.js';

test('General ValueSList tests', t => {
  const numbers = ValueSList.from([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    odds = new ValueSList(),
    evens = new ValueSList();

  for (const value of numbers) {
    if (value & 1) {
      odds.pushFront(value);
    } else {
      evens.pushFront(value);
    }
  }

  numbers.reverse();
  odds.reverse();
  evens.reverse();

  t.deepEqual(Array.from(numbers), [9, 8, 7, 6, 5, 4, 3, 2, 1]);
  t.deepEqual(Array.from(odds), [1, 3, 5, 7, 9]);
  t.deepEqual(Array.from(evens), [2, 4, 6, 8]);

  const oddsAndEvens = new ValueSList();

  for (const value of odds) oddsAndEvens.pushFront(value);
  for (const value of evens) oddsAndEvens.pushFront(value);
  oddsAndEvens.reverse();

  t.deepEqual(Array.from(oddsAndEvens), [1, 3, 5, 7, 9, 2, 4, 6, 8]);
  t.deepEqual(Array.from(oddsAndEvens.sort((a, b) => a.value < b.value)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('Elementary ValueSList operations', t => {
  const list = new ValueSList();
  t.ok(list.isEmpty);

  list.pushFront(2);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 2);
  t.equal(list.getLength(), 1);
  t.deepEqual(Array.from(list), [2]);

  t.equal(list.popFront(), 2);
  t.equal(list.getLength(), 0);
  t.deepEqual(Array.from(list), []);

  list.clear();
  t.ok(list.isEmpty);
  t.equal(list.getLength(), 0);
  t.deepEqual(Array.from(list), []);
});

test('ValueSList.moveToFront()', t => {
  const list = ValueSList.from([1, 2, 3, 4, 5]);
  const ptr = list.frontPtr;
  ptr.next();
  list.moveToFront(ptr);
  t.deepEqual(Array.from(list), [2, 1, 3, 4, 5]);
});

test('ValueSList.removeXXX()', t => {
  const list = ValueSList.from([1, 2, 3, 4, 5]);
  const ptr = list.frontPtr;
  ptr.next();
  list.removeRange({from: ptr, to: ptr});
  t.deepEqual(Array.from(list), [1, 3, 4, 5]);
  ptr.removeCurrent();
  t.deepEqual(Array.from(list), [1, 4, 5]);
});

test('ValueSList.extract()', t => {
  const list = ValueSList.from([1, 2, 3, 4, 5]);
  const ptr = list.frontPtr;
  ptr.next();
  const extracted = list.extractRange({from: ptr, to: ptr.node.next.next});
  t.deepEqual(Array.from(list), [1, 5]);
  t.deepEqual(Array.from(extracted), [2, 3, 4]);
});

test('ValueSList.reverse()', t => {
  const list = ValueSList.from([1, 2, 3, 4, 5]);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);
  list.reverse();
  t.deepEqual(Array.from(list), [5, 4, 3, 2, 1]);
});

test('ValueSList.sort()', t => {
  const list = ValueSList.from([3, 1, 5, 4, 2]);
  list.sort((a, b) => b.value < a.value);
  t.deepEqual(Array.from(list), [5, 4, 3, 2, 1]);
  list.sort((a, b) => a.value < b.value);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);

  {
    const N = 100;

    const array = new Array(N);
    for (let i = 0; i < N; ++i) array[i] = Math.random();

    const list = ValueSList.from(array);
    list.sort((a, b) => a.value < b.value);

    t.deepEqual(
      Array.from(list),
      array.sort((a, b) => a - b)
    );
  }
});

test('ValueSList iterators', t => {
  const list = ValueSList.from([1, 2, 3, 4, 5]);

  {
    const array = [];
    for (const value of list) array.push(value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const array = [];
    for (const value of list.getIterator()) array.push(value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const array = [];
    for (const value of list.getIterator({from: list.front.next, to: list.front.next.next.next})) array.push(value);
    t.deepEqual(array, [2, 3, 4]);
  }

  {
    const array = [];
    for (const node of list.getNodeIterator()) array.push(node.value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const array = [];
    for (const node of list.getNodeIterator({from: list.front.next, to: list.front.next.next.next})) array.push(node.value);
    t.deepEqual(array, [2, 3, 4]);
  }
});

test('ValueSList helpers', t => {
  const list = new ValueSList();

  {
    const other = list.make();
    t.ok(other instanceof ValueSList);
    t.ok(other.isEmpty);
  }

  {
    const other = list.makeFrom([1, 2, 3, 4, 5]);
    t.deepEqual(Array.from(other), [1, 2, 3, 4, 5]);
  }

  pushValuesFront(list, [1, 2]);
  t.deepEqual(Array.from(list), [2, 1]);

  {
    const other = list.clone();
    t.ok(other instanceof ValueSList);
    t.ok(other !== list);
    t.deepEqual(Array.from(other), Array.from(list));
  }

  {
    const list = ValueSList.from([1, 2, 3, 2, 5]),
      ptr = findPtrBy(list, node => node.value === 2);
    t.deepEqual(Array.from(list), [1, 2, 3, 2, 5]);
    t.equal(ptr.node.value, 2);
  }

  {
    const list = ValueSList.from([1, 2, 3, 2, 5]),
      node = removeNodeBy(list, node => node.value === 2);
    t.deepEqual(Array.from(list), [1, 3, 2, 5]);
    t.equal(node.value, 2);
  }

  {
    const list = ValueSList.from([1, 2, 3, 2, 5]),
      extracted = list.extractBy(node => node.value === 2);
    t.deepEqual(Array.from(list), [1, 3, 5]);
    t.deepEqual(Array.from(extracted), [2, 2]);
  }
});

test('ValueSList.SListPtr', t => {
  const list = ValueSList.from([1, 2, 3, 4, 5]);

  {
    const array = [];
    for (const ptr of list.getPtrIterator()) array.push(ptr.node.value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  const getPtrByValue = (list, value) => findPtrBy(list, node => node.value === value);

  list.moveToFront(getPtrByValue(list, 4));
  t.deepEqual(Array.from(list), [4, 1, 2, 3, 5]);

  list.sort((a, b) => a.value < b.value);
  list.removeRange({from: getPtrByValue(list, 2), to: getPtrByValue(list, 4)});
  t.deepEqual(Array.from(list), [1, 5]);

  pushValuesFront(list, [2, 3, 4]);
  list.sort((a, b) => a.value < b.value);
  const extract = list.extractRange({from: getPtrByValue(list, 2), to: getPtrByValue(list, 4)});
  t.deepEqual(Array.from(list), [1, 5]);
  t.deepEqual(Array.from(extract), [2, 3, 4]);

  {
    pushValuesFront(list, [2, 3, 4]);
    list.sort((a, b) => a.value < b.value);
    const array = [];
    for (const value of list.getIterator({from: getPtrByValue(list, 2), to: getPtrByValue(list, 4)})) array.push(value);
    t.deepEqual(array, [2, 3, 4]);
  }

  {
    const array = [];
    for (const ptr = list.frontPtr; !ptr.isHead; ptr.next()) array.push(ptr.node.value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }
});

test("ValueSList's Ptr", t => {
  const list = ValueSList.from([1, 2, 3]);

  const ptr = list.frontPtr;
  t.equal(ptr.node.value, 1);

  ptr.addBefore(4);
  t.deepEqual(Array.from(list), [4, 1, 2, 3]);
  t.equal(ptr.node.value, 1);
  t.equal(list.frontPtr.node.value, 4);

  ptr.addAfter(5);
  t.deepEqual(Array.from(list), [4, 1, 5, 2, 3]);
  t.equal(ptr.node.value, 1);

  ptr.insertBefore(list.makeFrom([6, 7]));
  t.deepEqual(Array.from(list), [4, 6, 7, 1, 5, 2, 3]);
  t.equal(ptr.node.value, 1);

  ptr.insertAfter(list.makeFrom([8, 9]));
  t.deepEqual(Array.from(list), [4, 6, 7, 1, 8, 9, 5, 2, 3]);
  t.equal(ptr.node.value, 1);

  ptr.next();
  t.equal(ptr.node.value, 8);

  t.equal(ptr.removeCurrent().value, 8);
  t.deepEqual(Array.from(list), [4, 6, 7, 1, 9, 5, 2, 3]);
  t.equal(ptr.node.value, 9);

  t.equal(list.frontPtr.removeCurrent().value, 4);
  t.deepEqual(Array.from(list), [6, 7, 1, 9, 5, 2, 3]);
});
