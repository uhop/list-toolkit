'use strict';

import test from 'tape-six';
import ExtSList from 'list-toolkit/ext-slist.js';
import SList from 'list-toolkit/slist.js';

test('ExtSList', t => {
  t.equal(typeof ExtSList, 'function');

  const extList = new ExtSList();
  t.ok(extList.isEmpty);
  t.ok(extList.isOneOrEmpty);
  t.equal(extList.getLength(), 0);

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]);

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

  extList.next().next();
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [2, 3, 1]
  );

  {
    const node = extList.removeAfter();
    t.deepEqual(
      Array.from(extList).map(value => value.x),
      [2, 1]
    );
    t.ok(node === c);

    const array = [];
    while (!extList.isEmpty) {
      array.push(extList.removeAfter());
    }
    t.ok(extList.isEmpty);
    t.deepEqual(
      array.map(value => value.x),
      [1, 2]
    );
  }

  extList.addAfter(a);
  t.equal(extList.getLength(), 1);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1]
  );

  extList.addAfter(b);
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
  extList.insertAfter(new ExtSList(SList.from([c, b]).releaseRawList()));
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );
  extList.clear(true);

  extList.addAfter(a);
  extList.insertAfter(new ExtSList(SList.from([b, c]).releaseRawList()));
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 3, 2]
  );

  extList.moveAfter(extList.makePtr(c));
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );

  extList.removeNode(extList.makePtr(a));
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 3]
  );

  extList.removeNode(extList.makePtr(c));
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [3]
  );

  extList.removeNode(extList.makePtr(c));
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    []
  );

  extList.addAfter(a);
  extList.addAfter(c);
  extList.addAfter(b);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );

  extList.removeAfter();
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 3]
  );

  extList.addAfter(b);
  extList.removeAfter();
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 3]
  );
});

test('ExtSList.extractRange() and ExtSList.removeRange()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const options = {nextName: Symbol()},
    list = SList.from([a, b, c], options),
    extList = new ExtSList(list.releaseRawList(), list);

  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );

  const extracted = extList.extractRange({from: extList.makePtr(a), to: c});
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    [2, 3]
  );

  extList.addAfter(extracted.removeAfter());
  extList.addAfter(extracted.removeAfter());
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    [1, 2, 3]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    []
  );

  extList.removeRange({from: extList.makePtr(c), to: b}, true);
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

  extList.removeRange({from: extList.makePtr(a), to: a}, true);
  t.deepEqual(
    Array.from(extList).map(value => value.x),
    []
  );
});

test('ExtSList.extractBy()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]),
    extList = new ExtSList(list.releaseRawList(), list);

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

test('ExtSList.reverse() and ExtSList.sort()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]),
    extList = new ExtSList(list.releaseRawList(), list);

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

    const list = SList.from(array.map(value => ({x: value}))),
      extList = new ExtSList(list.releaseRawList(), list);
    extList.sort((a, b) => a.x < b.x);

    t.deepEqual(
      Array.from(extList).map(value => value.x),
      array.sort((a, b) => a - b)
    );
  }
});

test('ExtSList iterators', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]),
    extList = new ExtSList(list.releaseRawList(), list);

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
});
