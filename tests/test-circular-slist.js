'use strict';

import test from 'tape-six';
import CircularSList from 'list-toolkit/circular-slist.js';
import SList from 'list-toolkit/slist.js';

test('CircularSList', t => {
  t.equal(typeof CircularSList, 'function');

  const circularList = new CircularSList();
  t.ok(circularList.isEmpty);
  t.ok(circularList.isOneOrEmpty);
  t.equal(circularList.getLength(), 0);

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]);

  circularList.adoptHead(list.releaseCircularList());
  t.ok(list.isEmpty);
  t.notOk(circularList.isEmpty);
  t.equal(circularList.getLength(), 3);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );

  circularList.next();
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [2, 3, 1]
  );

  circularList.next();
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [3, 1, 2]
  );

  circularList.next().next();
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [2, 3, 1]
  );

  {
    const node = circularList.removeAfter();
    t.deepEqual(
      Array.from(circularList).map(value => value.x),
      [2, 1]
    );
    t.ok(node === c);

    const array = [];
    while (!circularList.isEmpty) {
      array.push(circularList.removeAfter());
    }
    t.ok(circularList.isEmpty);
    t.deepEqual(
      array.map(value => value.x),
      [1, 2]
    );
  }

  circularList.addAfter(a);
  t.equal(circularList.getLength(), 1);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1]
  );

  circularList.addAfter(b);
  t.equal(circularList.getLength(), 2);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2]
  );

  circularList.addAfter(c);
  t.equal(circularList.getLength(), 3);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 3, 2]
  );

  circularList.clear(true);
  t.ok(circularList.isEmpty);

  circularList.addAfter(a);
  circularList.insertAfter(new CircularSList(SList.from([c, b]).releaseCircularList()));
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );
  circularList.clear(true);

  circularList.addAfter(a);
  circularList.insertAfter(new CircularSList(SList.from([b, c]).releaseCircularList()));
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 3, 2]
  );

  circularList.moveAfter(c);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );

  circularList.removeNode(a);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 3]
  );

  circularList.removeNode(c);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [3]
  );

  circularList.removeNode(c);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    []
  );

  circularList.addAfter(a);
  circularList.addAfter(c);
  circularList.addAfter(b);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );

  circularList.removeAfter();
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 3]
  );

  circularList.addAfter(b);
  circularList.removeAfter();
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 3]
  );
});

test('CircularSList.extractRange() and CircularSList.removeRange()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const options = {nextName: Symbol(), prevName: Symbol()},
    list = SList.from([a, b, c], options),
    circularList = new CircularSList(list.releaseCircularList(), list);

  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );

  const extracted = circularList.extractRange({from: b, to: c});
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    [2, 3]
  );

  circularList.addAfter(extracted.removeAfter());
  circularList.addAfter(extracted.removeAfter());
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    []
  );

  circularList.removeRange({prevFrom: c, to: b}, true);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [3]
  );

  circularList.addAfter(a);
  circularList.addAfter(b);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [3, 2, 1]
  );

  circularList.removeRange({prevFrom: a, to: a}, true);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    []
  );
});

test('CircularSList.extractBy()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]),
    circularList = new CircularSList(list.releaseCircularList(), list);

  const extracted = circularList.extractBy(value => value.x > 1);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    [2, 3]
  );

  circularList.insertAfter(extracted);
  extracted.head = circularList.extractBy(value => value.x % 2).head;
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [2]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    [1, 3]
  );
});

test('CircularSList.reverse() and CircularSList.sort()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]),
    circularList = new CircularSList(list.releaseCircularList(), list);

  circularList.reverse();
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [3, 2, 1]
  );

  circularList.sort((a, b) => a.x - b.x);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );
});

test('CircularSList iterators', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = SList.from([a, b, c]),
    circularList = new CircularSList(list.releaseCircularList(), list);

  {
    const array = [];
    for (const value of circularList) array.push(value.x);
    t.deepEqual(array, [1, 2, 3]);
  }

  {
    const array = [];
    for (const value of circularList.getNodeIterator({from: b, to: c})) array.push(value.x);
    t.deepEqual(array, [2, 3]);
  }
});
