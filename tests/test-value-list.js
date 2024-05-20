'use strict';

import test from 'tape-six';
import ValueList from 'list-toolkit/value-list.js';
import {pushValuesFront, pushValuesBack, appendValuesFront, findNodeBy, removeNodeBy} from 'list-toolkit/list-utils.js';

test('General ValueList tests', t => {
  const numbers = ValueList.from([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    odds = new ValueList(),
    evens = new ValueList();

  for (const value of numbers.getReverseIterator()) {
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

  const oddsAndEvens = new ValueList();

  for (const value of odds) oddsAndEvens.pushBack(value);
  for (const value of evens) oddsAndEvens.pushBack(value);

  t.deepEqual(Array.from(oddsAndEvens), [1, 3, 5, 7, 9, 2, 4, 6, 8]);
  t.deepEqual(Array.from(oddsAndEvens.sort((a, b) => a.value - b.value)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('Elementary ValueList operations', t => {
  const list = new ValueList();
  t.ok(list.isEmpty);

  list.pushBack(1);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 1);
  t.equal(list.back.value, 1);
  t.equal(list.getLength(), 1);
  t.deepEqual(Array.from(list), [1]);
  t.deepEqual(Array.from(list.getReverseIterator()), [1]);

  list.pushFront(2);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 2);
  t.equal(list.back.value, 1);
  t.equal(list.getLength(), 2);
  t.deepEqual(Array.from(list), [2, 1]);
  t.deepEqual(Array.from(list.getReverseIterator()), [1, 2]);

  list.pushBack(3);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 2);
  t.equal(list.back.value, 3);
  t.equal(list.getLength(), 3);
  t.deepEqual(Array.from(list), [2, 1, 3]);
  t.deepEqual(Array.from(list.getReverseIterator()), [3, 1, 2]);

  t.equal(list.popFront(), 2);
  t.equal(list.front.value, 1);
  t.equal(list.back.value, 3);
  t.equal(list.getLength(), 2);
  t.deepEqual(Array.from(list), [1, 3]);
  t.deepEqual(Array.from(list.getReverseIterator()), [3, 1]);

  t.equal(list.popBack(), 3);
  t.equal(list.front.value, 1);
  t.equal(list.back.value, 1);
  t.equal(list.getLength(), 1);
  t.deepEqual(Array.from(list), [1]);
  t.deepEqual(Array.from(list.getReverseIterator()), [1]);

  list.appendFront(ValueList.from([2, 3]));
  t.equal(list.front.value, 2);
  t.equal(list.back.value, 1);
  t.equal(list.getLength(), 3);
  t.deepEqual(Array.from(list), [2, 3, 1]);
  t.deepEqual(Array.from(list.getReverseIterator()), [1, 3, 2]);

  list.appendBack(ValueList.from([4, 5]));
  t.equal(list.front.value, 2);
  t.equal(list.back.value, 5);
  t.equal(list.getLength(), 5);
  t.deepEqual(Array.from(list), [2, 3, 1, 4, 5]);
  t.deepEqual(Array.from(list.getReverseIterator()), [5, 4, 1, 3, 2]);

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
  t.deepEqual(Array.from(list.getReverseIterator()), []);
});

test('ValueList.removeRange()', t => {
  const list = ValueList.from([1, 2, 3, 4, 5]);
  list.removeRange({from: list.front.next, to: list.back.prev});
  t.deepEqual(Array.from(list), [1, 5]);
});

test('ValueList.extractRange()', t => {
  const list = ValueList.from([1, 2, 3, 4, 5]),
    extracted = list.extractRange({from: list.front.next, to: list.back.prev});
  t.deepEqual(Array.from(list), [1, 5]);
  t.deepEqual(Array.from(extracted), [2, 3, 4]);
});

test('ValueList.reverse()', t => {
  const list = ValueList.from([1, 2, 3, 4, 5]);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);
  list.reverse();
  t.deepEqual(Array.from(list), [5, 4, 3, 2, 1]);
});

test('ValueList.sort()', t => {
  const list = ValueList.from([3, 1, 5, 4, 2]);
  list.sort((a, b) => b.value - a.value);
  t.deepEqual(Array.from(list), [5, 4, 3, 2, 1]);
  list.sort((a, b) => a.value - b.value);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);
});

test('ValueList iterators', t => {
  const list = ValueList.from([1, 2, 3, 4, 5]);

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
    for (const value of list.getIterator({from: list.front.next, to: list.back.prev})) array.push(value);
    t.deepEqual(array, [2, 3, 4]);
  }

  {
    const array = [];
    for (const value of list.getReverseIterator()) array.push(value);
    t.deepEqual(array, [5, 4, 3, 2, 1]);
  }

  {
    const array = [];
    for (const value of list.getReverseIterator({from: list.front.next, to: list.back.prev})) array.push(value);
    t.deepEqual(array, [4, 3, 2]);
  }

  {
    const array = [];
    for (const node of list.getNodeIterator()) array.push(node.value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const array = [];
    for (const node of list.getNodeIterator({from: list.front.next, to: list.back.prev})) array.push(node.value);
    t.deepEqual(array, [2, 3, 4]);
  }

  {
    const array = [];
    for (const node of list.getReverseNodeIterator()) array.push(node.value);
    t.deepEqual(array, [5, 4, 3, 2, 1]);
  }

  {
    const array = [];
    for (const node of list.getReverseNodeIterator({from: list.front.next, to: list.back.prev})) array.push(node.value);
    t.deepEqual(array, [4, 3, 2]);
  }
});

test('ValueList helpers', t => {
  const list = new ValueList();

  {
    const other = list.make();
    t.ok(other instanceof ValueList);
    t.ok(other.isEmpty);
  }

  {
    const other = list.makeFrom([1, 2, 3, 4, 5]);
    t.ok(other instanceof ValueList);
    t.deepEqual(Array.from(other), [1, 2, 3, 4, 5]);
  }

  pushValuesFront(list, [1, 2]);
  t.deepEqual(Array.from(list), [2, 1]);

  pushValuesBack(list, [3, 4]);
  t.deepEqual(Array.from(list), [2, 1, 3, 4]);

  appendValuesFront(list, [5, 6]);
  t.deepEqual(Array.from(list), [5, 6, 2, 1, 3, 4]);

  pushValuesBack(list, [7, 8]);
  t.deepEqual(Array.from(list), [5, 6, 2, 1, 3, 4, 7, 8]);

  {
    const other = list.clone();
    t.ok(other instanceof ValueList);
    t.ok(other !== list);
    t.deepEqual(Array.from(other), Array.from(list));
  }

  {
    const list = ValueList.from([1, 2, 3, 2, 5]),
      node = findNodeBy(list, node => node.value === 2);
    t.deepEqual(Array.from(list), [1, 2, 3, 2, 5]);
    t.equal(node.value, 2);
  }

  {
    const list = ValueList.from([1, 2, 3, 2, 5]),
      node = removeNodeBy(list, node => node.value === 2);
    t.deepEqual(Array.from(list), [1, 3, 2, 5]);
    t.equal(node.value, 2);
  }

  {
    const list = ValueList.from([1, 2, 3, 2, 5]),
      extracted = list.extractBy(node => node.value === 2);
    t.deepEqual(Array.from(list), [1, 3, 5]);
    t.deepEqual(Array.from(extracted), [2, 2]);
  }
});

test("ValueList's Ptr", t => {
  const list = ValueList.from([1, 2, 3]);

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

  ptr.prev();
  t.equal(ptr.node.value, 7);
  ptr.next().next();
  t.equal(ptr.node.value, 8);

  t.equal(ptr.remove().value, 8);
  t.deepEqual(Array.from(list), [4, 6, 7, 1, 9, 5, 2, 3]);
  t.equal(ptr.node.value, 9);

  t.equal(list.frontPtr.remove().value, 4);
  t.deepEqual(Array.from(list), [6, 7, 1, 9, 5, 2, 3]);

  t.equal(list.backPtr.remove().value, 3);
  t.deepEqual(Array.from(list), [6, 7, 1, 9, 5, 2]);
});
