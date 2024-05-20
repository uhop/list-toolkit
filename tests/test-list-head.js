'use strict';

import test from 'tape-six';
import ListHead from 'list-toolkit/list-head.js';
import {pushValuesFront, pushValuesBack, appendValuesFront} from 'list-toolkit/list-utils.js';

test('Elementary ListHead operations', t => {
  t.equal(typeof ListHead, 'function');

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
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
  list.appendBack(ListHead.from([b, c]));
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

  const extract = list.extract(a, c);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2]
  );
  t.deepEqual(
    Array.from(extract).map(value => value.x),
    [1, 3]
  );
  extract.clear(true);

  list.clear(true);
  t.ok(list.isEmpty);
  t.deepEqual(Array.from(list), []);

  list.appendFront(list.makeFrom([a, b, c])).remove(a, c, true);
  t.deepEqual(Array.from(list), []);

  new ListHead(a).clear(true);

  list.appendFront(list.makeFrom([a, b, c])).reverse();
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

test('ListHead iterators', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
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
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new ListHead();

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

test('ListHead with custom next/prev', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new ListHead({nextName: Symbol(), prevName: Symbol()});
  pushValuesFront(list, [a, b, c]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [3, 2, 1]
  );

  t.throws(() => list.adopt(a));
});

test("ListHead's Ptr", t => {
  const list = ListHead.from([{x: 1}, {x: 2}, {x: 3}], {nextName: Symbol('next'), prevName: Symbol('prev')});

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
