'use strict';

import test from 'tape-six';
import List from 'list-toolkit/list.js';
import {pushValuesFront, pushValuesBack, appendValuesFront} from 'list-toolkit/list-utils.js';

test('Elementary List operations', t => {
  t.equal(typeof List, 'function');

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new List();

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
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 1]
  );

  list.pushBack(c);
  t.equal(list.getLength(), 3);
  t.ok(list.front === b);
  t.ok(list.back === c);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 1, 3]
  );

  t.ok(list.popFront() === b);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [1, 3]
  );

  t.ok(list.popBack() === c);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [1]
  );

  list.appendFront(list.makeFrom([b, c]));
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 3, 1]
  );

  list.popFront();
  list.popFront();
  list.appendBack(List.from([b, c]));
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [1, 2, 3]
  );

  list.moveToFront(b);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 1, 3]
  );

  list.moveToBack(b);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [1, 3, 2]
  );

  const extracted = list.extractRange({from: a, to: c});
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    [1, 3]
  );
  extracted.clear(true);

  list.clear(true);
  t.ok(list.isEmpty);
  t.deepEqual(Array.from(list), []);

  list.appendFront(list.makeFrom([a, b, c]));
  list.removeRange({from: a, to: c}, true);
  t.deepEqual(Array.from(list), []);

  new List(a).clear(true);

  list.appendFront(list.makeFrom([a, b, c]));
  list.reverse();
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [3, 2, 1]
  );

  list.sort((a, b) => a.x - b.x);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [1, 2, 3]
  );
});

test('List iterators', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = List.from([a, b, c]);

  {
    const array = [];
    for (const value of list) array.push(value.x);
    t.deepEqual(array, [1, 2, 3]);
  }

  {
    const array = [];
    for (const value of list.getIterator()) array.push(value.x);
    t.deepEqual(array, [1, 2, 3]);
  }

  {
    const array = [];
    for (const value of list.getIterator({from: b, to: b})) array.push(value.x);
    t.deepEqual(array, [2]);
  }

  {
    const array = [];
    for (const value of list.getReverseIterator()) array.push(value.x);
    t.deepEqual(array, [3, 2, 1]);
  }

  {
    const array = [];
    for (const value of list.getReverseIterator({from: b, to: b})) array.push(value.x);
    t.deepEqual(array, [2]);
  }
});

test('List helpers', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new List();

  {
    const other = list.makeFrom([b, a, c]);
    t.deepEqual(
      Array.from(other).map(value => value.x),
      [2, 1, 3]
    );
    other.clear(true);
  }

  pushValuesFront(list, [a, b]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 1]
  );

  pushValuesBack(list, [c]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 1, 3]
  );
  list.clear(true);

  appendValuesFront(list, [c, b]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [3, 2]
  );
});

test('List with custom next/prev', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new List({nextName: Symbol(), prevName: Symbol()});
  pushValuesFront(list, [a, b, c]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [3, 2, 1]
  );

  t.throws(() => list.adopt(a));
});

test("List's Ptr", t => {
  const list = List.from([{x: 1}, {x: 2}, {x: 3}], {nextName: Symbol('next'), prevName: Symbol('prev')});

  const ptr = list.frontPtr;
  t.equal(ptr.node.x, 1);

  ptr.addBefore({x: 4});
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [4, 1, 2, 3]
  );
  t.equal(ptr.node.x, 1);
  t.equal(list.frontPtr.node.x, 4);

  ptr.addAfter({x: 5});
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [4, 1, 5, 2, 3]
  );
  t.equal(ptr.node.x, 1);

  ptr.insertBefore(list.makeFrom([6, 7].map(value => ({x: value}))));
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [4, 6, 7, 1, 5, 2, 3]
  );
  t.equal(ptr.node.x, 1);

  ptr.insertAfter(list.makeFrom([8, 9].map(value => ({x: value}))));
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [4, 6, 7, 1, 8, 9, 5, 2, 3]
  );
  t.equal(ptr.node.x, 1);

  ptr.prev();
  t.equal(ptr.node.x, 7);
  ptr.next().next();
  t.equal(ptr.node.x, 8);

  t.equal(ptr.remove().x, 8);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [4, 6, 7, 1, 9, 5, 2, 3]
  );
  t.equal(ptr.node.x, 9);

  t.equal(list.frontPtr.remove().x, 4);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [6, 7, 1, 9, 5, 2, 3]
  );

  t.equal(list.backPtr.remove().x, 3);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [6, 7, 1, 9, 5, 2]
  );
});

test('List.releaseCircularList()', t => {
  const list = List.from([{x: 1}, {x: 2}, {x: 3}]);

  t.equal(list.getLength(), 3);

  const circularList = list.releaseCircularList();

  t.ok(list.isEmpty);
  t.ok(!!circularList);

  const array = [];
  let current = circularList;
  do {
    array.push(current.x);
    current = current[list.nextName];
  } while (current !== circularList);

  t.deepEqual(array, [1, 2, 3]);
});
