'use strict';

import test from 'tape-six';
import ExtList from 'list-toolkit/ext-list.js';
import List from 'list-toolkit/list.js';
import {isStandAlone} from 'list-toolkit/list/nodes.js';

test('ExtList', t => {
  t.equal(typeof ExtList, 'function');

  const extList = new ExtList();
  t.ok(extList.isEmpty);
  t.ok(extList.isOneOrEmpty);
  t.equal(extList.getLength(), 0);

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = List.from([a, b, c]);

  extList.attach(list.releaseRawList());
  t.ok(list.isEmpty);
  t.notOk(extList.isEmpty);
  t.equal(extList.getLength(), 3);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );

  extList.next();
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [2, 3, 1]
  );

  extList.next();
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [3, 1, 2]
  );

  extList.prev();
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [2, 3, 1]
  );

  {
    const node = extList.removeCurrent();
    t.deepEqual(
      Array.from(extList).map(value => value.x),
      [3, 1]
    );
    t.ok(node === b);

    const array = [];
    while (!extList.isEmpty) {
      array.push(extList.removeCurrent());
    }
    t.ok(extList.isEmpty);
    t.deepEqual(
      array.map(value => value.x),
      [3, 1]
    );
  }

  extList.addBefore(a);
  t.equal(extList.getLength(), 1);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1]
  );

  extList.addBefore(b);
  t.equal(extList.getLength(), 2);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2]
  );

  extList.addAfter(c);
  t.equal(extList.getLength(), 3);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 3, 2]
  );

  extList.clear(true);
  t.ok(extList.isEmpty);

  extList.addAfter(a);
  extList.insertAfter(new ExtList(List.from([c, b]).releaseRawList()));
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 3, 2]
  );
  extList.clear(true);

  extList.addAfter(a);
  extList.insertBefore(new ExtList(List.from([b, c]).releaseRawList()));
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );

  extList.moveBefore(b);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 3, 2]
  );

  extList.moveAfter(b);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );

  extList.removeNode(b);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 3]
  );

  extList.removeNode(a);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [3]
  );

  extList.removeNode(c);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    []
  );

  extList.addBefore(a);
  extList.addBefore(b);
  extList.addBefore(c);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );

  {
    const removed = extList.removeAfter();
    t.deepEqual(
      Array.from(extList).map(value => value.x),
      [1, 3]
    );
    t.ok(isStandAlone(extList, removed));
  }

  extList.addBefore(b);
  extList.removeBefore();
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 3]
  );
});

test('ExtList.extractRange() and ExtList.removeRange()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const options = {nextName: Symbol(), prevName: Symbol()},
    list = List.from([a, b, c], options),
    extList = new ExtList(list.releaseRawList(), list);

  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );

  const extracted = extList.extractRange({from: b, to: c});
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    [2, 3]
  );

  extList.addBefore(extracted.removeCurrent());
  extList.addBefore(extracted.removeCurrent());
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    []
  );

  extList.removeRange({from: a, to: b}, true);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [3]
  );

  extList.addAfter(a);
  extList.addAfter(b);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [3, 2, 1]
  );

  extList.removeRange({from: c, to: a}, true);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    []
  );
});

test('ExtList.extractBy()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = List.from([a, b, c]),
    extList = new ExtList(list.releaseRawList(), list);

  const extracted = extList.extractBy(value => value.x > 1);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    [2, 3]
  );

  extList.insertAfter(extracted);
  extracted.head = extList.extractBy(value => value.x % 2).head;
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [2]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    [1, 3]
  );
});

test('ExtList.reverse() and ExtList.sort()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = List.from([a, b, c]),
    extList = new ExtList(list.releaseRawList(), list);

  extList.reverse();
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [3, 2, 1]
  );

  extList.sort((a, b) => a.x < b.x);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );

  {
    const N = 100;

    const array = new Array(N);
    for (let i = 0; i < N; ++i) array[i] = Math.random();

    const list = List.from(array.map(value => ({x: value}))),
      extList = new ExtList(list.releaseRawList(), list);
    extList.sort((a, b) => a.x < b.x);

    t.deepEqual(
      Array.from(extList).map(value => value.x),
      array.sort((a, b) => a - b)
    );
  }
});

test('ExtList iterators', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = List.from([a, b, c]),
    extList = new ExtList(list.releaseRawList(), list);

  {
    const array = [];
    for (const value of extList) array.push(value.x);
    t.deepEqual(array, [1, 2, 3]);
  }

  {
    const array = [];
    for (const value of extList.getNodeIterator({from: b, to: c})) array.push(value.x);
    t.deepEqual(array, [2, 3]);
  }

  {
    const array = [];
    for (const value of extList.getReverseNodeIterator()) array.push(value.x);
    t.deepEqual(array, [3, 2, 1]);
  }

  {
    const array = [];
    for (const value of extList.getReverseNodeIterator({from: b, to: c})) array.push(value.x);
    t.deepEqual(array, [3, 2]);
  }
});
