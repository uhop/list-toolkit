'use strict';

import test from 'tape-six';
import SListHead from 'list-toolkit/slist-head.js';

test.skip('Elementary SListHead operations', t => {
  t.equal(typeof SListHead, 'function');

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new SListHead();

  t.ok(list.isEmpty);

  list.pushFront(a);
  t.notOk(list.isEmpty);
  t.ok(list.front === a);
  t.ok(list.getBack() === a);

  list.pushFront(b);
  t.notOk(list.isEmpty);
  t.ok(b[list.nextName] === a);
  t.equal(list.getLength(), 2);
  t.ok(list.front === b);
  t.ok(list.getBack() === a);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 1]
  );

  list.pushBack(c);
  t.equal(list.getLength(), 3);
  t.ok(list.front === b);
  t.ok(list.getBack() === c);
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

  list.appendFront(SListHead.from([b, c]));
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 3, 1]
  );

  list.popFront();
  list.popFront();
  list.appendBack(SListHead.from([b, c]));
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

  list.appendFront(SListHead.from([a, b, c])).remove(a, c);
  t.deepEqual(Array.from(list), []);

  new SListHead(a).clear(true);

  list.appendFront(SListHead.from([a, b, c])).reverse();
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

test('SListHead iterators', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = SListHead.from([a, b, c]);

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
});

test('SListHead helpers', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new SListHead();

  {
    const other = list.makeFrom([b, a, c]);
    t.deepEqual(
      Array.from(other).map(value => value.x),
      [2, 1, 3]
    );
    other.clear(true);
  }

  list.pushValuesFront([a, b]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 1]
  );
  list.clear(true);

  list.appendValuesFront([c, b]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [3, 2]
  );
});

test('SListHead with custom next', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new SListHead(null, {nextName: Symbol()});
  list.pushValuesFront([a, b, c]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [3, 2, 1]
  );

  t.throws(() => list.adopt(a));
});
