'use strict';

import test from 'tape-six';
import SList from 'list-toolkit/slist.js';

test('General SList tests', t => {
  const numbers = SList.from([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    odds = new SList(),
    evens = new SList();

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

  const oddsAndEvens = new SList();

  for (const value of odds) oddsAndEvens.pushFront(value);
  for (const value of evens) oddsAndEvens.pushFront(value);
  oddsAndEvens.reverse();

  t.deepEqual(Array.from(oddsAndEvens), [1, 3, 5, 7, 9, 2, 4, 6, 8]);
  t.deepEqual(Array.from(oddsAndEvens.sort((a, b) => a - b)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('Elementary SList operations', t => {
  const list = new SList();
  t.ok(list.isEmpty);

  t.throws(() => SList.getPrevPrev(list, {}));

  list.pushBack(1);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 1);
  t.equal(list.getBack().value, 1);
  t.equal(list.getLength(), 1);
  t.deepEqual(Array.from(list), [1]);
  t.deepEqual(Array.from(list.getIterable()), [1]);

  list.pushFront(2);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 2);
  t.equal(list.getBack().value, 1);
  t.equal(list.getLength(), 2);
  t.deepEqual(Array.from(list), [2, 1]);

  list.pushBack(3);
  t.notOk(list.isEmpty);
  t.equal(list.front.value, 2);
  t.equal(list.getBack().value, 3);
  t.equal(list.getLength(), 3);
  t.deepEqual(Array.from(list), [2, 1, 3]);

  t.equal(list.popFront(), 2);
  t.equal(list.front.value, 1);
  t.equal(list.getBack().value, 3);
  t.equal(list.getLength(), 2);
  t.deepEqual(Array.from(list), [1, 3]);

  t.equal(list.popBack(), 3);
  t.equal(list.front.value, 1);
  t.equal(list.getBack().value, 1);
  t.equal(list.getLength(), 1);
  t.deepEqual(Array.from(list), [1]);

  list.appendFront(SList.from([2, 3]));
  t.equal(list.front.value, 2);
  t.equal(list.getBack().value, 1);
  t.equal(list.getLength(), 3);
  t.deepEqual(Array.from(list), [2, 3, 1]);

  list.appendBack(SList.from([4, 5]));
  t.equal(list.front.value, 2);
  t.equal(list.getBack().value, 5);
  t.equal(list.getLength(), 5);
  t.deepEqual(Array.from(list), [2, 3, 1, 4, 5]);

  const two = list.front,
    five = list.getBack();
  list.moveToFront(five);
  t.deepEqual(Array.from(list), [5, 2, 3, 1, 4]);
  list.moveToBack(two);
  t.deepEqual(Array.from(list), [5, 3, 1, 4, 2]);

  list.clear();
  t.ok(list.isEmpty);
  t.equal(list.getLength(), 0);
  t.deepEqual(Array.from(list), []);
});

test('SList.remove()', t => {
  const list = SList.from([1, 2, 3, 4, 5]);
  list.remove(list.front.next, SList.getPrevPrev(list));
  t.deepEqual(Array.from(list), [1, 5]);
});

test('SList.extract()', t => {
  const list = SList.from([1, 2, 3, 4, 5]),
    extract = list.extract(list.front.next, SList.getPrevPrev(list));
  t.deepEqual(Array.from(list), [1, 5]);
  t.deepEqual(Array.from(extract), [2, 3, 4]);
});

test('SList.reverse()', t => {
  const list = SList.from([1, 2, 3, 4, 5]);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);
  list.reverse();
  t.deepEqual(Array.from(list), [5, 4, 3, 2, 1]);
});

test('SList.sort()', t => {
  const list = SList.from([3, 1, 5, 4, 2]);
  list.sort((a, b) => b - a);
  t.deepEqual(Array.from(list), [5, 4, 3, 2, 1]);
  list.sort((a, b) => a - b);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);
});

test('SList iterators', t => {
  const list = SList.from([1, 2, 3, 4, 5]);

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
    for (const value of list.getIterable(list.front.next, SList.getPrevPrev(list))) array.push(value);
    t.deepEqual(array, [2, 3, 4]);
  }

  {
    const array = [];
    for (const node of list.getNodeIterable()) array.push(node.value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const array = [];
    for (const node of list.getNodeIterable(list.front.next, SList.getPrevPrev(list))) array.push(node.value);
    t.deepEqual(array, [2, 3, 4]);
  }
});

test('SList helpers', t => {
  const list = new SList();

  {
    const other = list.makeFrom([1, 2, 3, 4, 5]);
    t.deepEqual(Array.from(other), [1, 2, 3, 4, 5]);
  }

  list.pushValuesFront([1, 2]);
  t.deepEqual(Array.from(list), [2, 1]);

  list.appendValuesFront([5, 6]);
  t.deepEqual(Array.from(list), [5, 6, 2, 1]);
});

test('SList.SListPtr', t => {
  const list = SList.from([1, 2, 3, 4, 5]);

  {
    const array = [];
    for (const ptr of list.getPtrIterable()) array.push(ptr.node.value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  const getPtrByValue = (list, value) => {
    for (const ptr of list.getPtrIterable()) if (ptr.node.value === value) return ptr;
    return null;
  };

  list.moveToFront(getPtrByValue(list, 4));
  t.deepEqual(Array.from(list), [4, 1, 2, 3, 5]);

  list.moveToBack(getPtrByValue(list, 2));
  t.deepEqual(Array.from(list), [4, 1, 3, 5, 2]);

  list.sort((a, b) => a - b);
  list.remove(getPtrByValue(list, 2), getPtrByValue(list, 4));
  t.deepEqual(Array.from(list), [1, 5]);

  list.pushValuesFront([2, 3, 4]);
  list.sort((a, b) => a - b);
  const extract = list.extract(getPtrByValue(list, 2), getPtrByValue(list, 4));
  t.deepEqual(Array.from(list), [1, 5]);
  t.deepEqual(Array.from(extract), [2, 3, 4]);

  {
    list.pushValuesFront([2, 3, 4]);
    list.sort((a, b) => a - b);
    const array = [];
    for (const value of list.getIterable(getPtrByValue(list, 2), getPtrByValue(list, 4))) array.push(value);
    t.deepEqual(array, [2, 3, 4]);
  }

  {
    const array = [];
    for (const ptr = list.getPtr(); !ptr.isHead; ptr.next()) array.push(ptr.node.value);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }
});
