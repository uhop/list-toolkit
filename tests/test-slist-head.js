'use strict';

import test from 'tape-six';
import SListHead from 'list-toolkit/slist-head.js';
import {pushValuesFront, appendValuesFront} from 'list-toolkit/list-utils.js';

test('Elementary SListHead operations', t => {
  t.equal(typeof SListHead, 'function');

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};
  const list = new SListHead();

  t.ok(list.isEmpty);

  list.pushFront(a);
  t.notOk(list.isEmpty);
  t.ok(list.front === a);

  list.pushFront(b);
  t.notOk(list.isEmpty);
  t.ok(b[list.nextName] === a);
  t.equal(list.getLength(), 2);
  t.ok(list.front === b);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 1]
  );

  t.ok(list.popFront() === b);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [1]
  );

  pushValuesFront(list, [b, c]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [3, 2, 1]
  );

  list.moveToFront(list.frontPtr.next());
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 3, 1]
  );

  const extract = list.extract(list.frontPtr.next(), a);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2]
  );
  t.deepEqual(
    Array.from(extract).map(value => value.x),
    [3, 1]
  );
  extract.clear(true);

  list.clear(true);
  t.ok(list.isEmpty);
  t.deepEqual(Array.from(list), []);

  appendValuesFront(list, [a, b, c]).remove(list.frontPtr, c, true);
  t.deepEqual(Array.from(list).map(node => node.x), []);

  new SListHead(a).clear(true);

  appendValuesFront(list, [a, b, c]).reverse();
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

  pushValuesFront(list, [a, b]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [2, 1]
  );
  list.clear(true);

  appendValuesFront(list, [c, b]);
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
  pushValuesFront(list, [a, b, c]);
  t.deepEqual(
    Array.from(list).map(value => value.x),
    [3, 2, 1]
  );

  t.throws(() => list.adopt(a));
});
