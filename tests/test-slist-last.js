'use strict';

import test from 'tape-six';
import SList from 'list-toolkit/slist.js';

test('Testing last: push/pop/clear', t => {
  const list = new SList();
  t.ok(list.isEmpty);
  t.ok(list.last === list);

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  list.pushFront(b);
  t.ok(list.isOne);
  t.ok(list.last === b);

  list.pushBack(c);
  t.notOk(list.isEmpty);
  t.ok(list.last === c);

  list.pushFront(a);
  t.ok(list.last === c);

  list.removeNode(list.makePtrFromPrev(b));
  t.ok(list.last === b);

  t.ok(list.popFront().x === 1);
  t.ok(list.isOne);
  t.ok(list.last === b);

  list.clear(true);
  t.ok(list.isEmpty);
  t.ok(list.last === list);
});

test('Testing last: appendFront/appendBack', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3},
    d = {x: 4},
    e = {x: 5},
    f = {x: 6};
  const list = new SList(),
    list1 = SList.from([a, b, c]),
    list2 = SList.from([d, e]),
    list3 = SList.from([f]);

  t.ok(list.last === list);
  t.ok(list1.last === c);
  t.ok(list2.last === e);
  t.ok(list3.last === f);

  list.appendFront(list1);
  t.ok(list.last === c);
  t.ok(list1.last === list1);

  list.appendBack(list2);
  t.ok(list.last === e);
  t.ok(list2.last === list2);

  list.clear(true).appendBack(list3);
  t.ok(list.last === f);
  t.ok(list3.last === list3);
});

test('Testing last: moveToFront/moveToBack/removeNode', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]);
  t.equal(list.getLength(), 3);
  t.ok(list.last === c);

  list.moveToBack(list.frontPtr);
  t.equal(list.getLength(), 3);
  t.ok(list.last === a);
  t.ok(list.front === b);

  let ptr = list.frontPtr.next().next();

  list.moveToFront(ptr);
  t.equal(list.getLength(), 3);
  t.ok(list.last === c);
  t.ok(list.front === a);

  ptr = list.frontPtr.next().next();

  list.removeNode(ptr);
  t.equal(list.getLength(), 2);
  t.ok(list.last === b);
  t.ok(list.front === a);

  ptr = list.frontPtr.next().removeCurrent();
  t.equal(list.getLength(), 1);
  t.ok(list.last === a);
  t.ok(list.front === a);
});

test('Testing last: extractRange/removeRange', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]);
  t.equal(list.getLength(), 3);
  t.ok(list.last === c);

  const extracted = list.extractRange({from: list.frontPtr.next(), to: c});

  t.equal(list.getLength(), 1);
  t.ok(list.last === a);
  t.ok(list.front === a);
  t.ok(extracted.last === c);
  t.ok(extracted.front === b);

  extracted.clear(true);

  list.removeRange({from: list.frontPtr, to: list.last}, true);
  t.ok(list.isEmpty);
  t.ok(list.last === list);
});

test('Testing last: reverse', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]);
  t.equal(list.getLength(), 3);
  t.ok(list.last === c);
  t.ok(list.front === a);

  list.reverse();
  t.equal(list.getLength(), 3);
  t.ok(list.last === a);
  t.ok(list.front === c);
});

test('Testing last: sort', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([b, c, a]);
  t.equal(list.getLength(), 3);
  t.ok(list.last === a);
  t.ok(list.front === b);

  list.sort((a, b) => a.x < b.x);
  t.equal(list.getLength(), 3);
  t.ok(list.last === c);
  t.ok(list.front === a);
});
