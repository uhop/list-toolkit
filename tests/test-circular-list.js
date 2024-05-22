'use strict';

import test from 'tape-six';
import CircularList from 'list-toolkit/circular-list.js';
import List from 'list-toolkit/list.js';
import {isStandAlone} from 'list-toolkit/list/nodes.js';

test('CircularList', t => {
  t.equal(typeof CircularList, 'function');

  const circularList = new CircularList();
  t.ok(circularList.isEmpty);
  t.ok(circularList.isOneOrEmpty);
  t.equal(circularList.getLength(), 0);

  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = List.from([a, b, c]);

  circularList.attach(list.releaseRawCircularList());
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

  circularList.prev();
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [2, 3, 1]
  );

  {
    const node = circularList.remove();
    t.deepEqual(
      Array.from(circularList).map(value => value.x),
      [3, 1]
    );
    t.ok(node === b);

    const array = [];
    while (!circularList.isEmpty) {
      array.push(circularList.remove());
    }
    t.ok(circularList.isEmpty);
    t.deepEqual(
      array.map(value => value.x),
      [3, 1]
    );
  }

  circularList.addBefore(a);
  t.equal(circularList.getLength(), 1);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1]
  );

  circularList.addBefore(b);
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
  circularList.insertAfter(new CircularList(List.from([c, b]).releaseRawCircularList()));
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 3, 2]
  );
  circularList.clear(true);

  circularList.addAfter(a);
  circularList.insertBefore(new CircularList(List.from([b, c]).releaseRawCircularList()));
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );

  circularList.moveBefore(b);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 3, 2]
  );

  circularList.moveAfter(b);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );

  circularList.removeNode(b);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 3]
  );

  circularList.removeNode(a);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [3]
  );

  circularList.removeNode(c);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    []
  );

  circularList.addBefore(a);
  circularList.addBefore(b);
  circularList.addBefore(c);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );

  {
    const removed = circularList.removeAfter();
    t.deepEqual(
      Array.from(circularList).map(value => value.x),
      [1, 3]
    );
    t.ok(isStandAlone(circularList, removed));
  }

  circularList.addBefore(b);
  circularList.removeBefore();
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 3]
  );
});

test('CircularList.extractRange() and CircularList.removeRange()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const options = {nextName: Symbol(), prevName: Symbol()},
    list = List.from([a, b, c], options),
    circularList = new CircularList(list.releaseRawCircularList(), list);

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

  circularList.addBefore(extracted.remove());
  circularList.addBefore(extracted.remove());
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    [1, 2, 3]
  );
  t.deepEqual(
    Array.from(extracted).map(value => value.x),
    []
  );

  circularList.removeRange({from: a, to: b}, true);
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

  circularList.removeRange({from: c, to: a}, true);
  t.deepEqual(
    Array.from(circularList).map(value => value.x),
    []
  );
});

test('CircularList.extractBy()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = List.from([a, b, c]),
    circularList = new CircularList(list.releaseRawCircularList(), list);

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

test('CircularList.reverse() and CircularList.sort()', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = List.from([a, b, c]),
    circularList = new CircularList(list.releaseRawCircularList(), list);

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

test('CircularList iterators', t => {
  const a = {x: 1},
    b = {x: 2},
    c = {x: 3};

  const list = List.from([a, b, c]),
    circularList = new CircularList(list.releaseRawCircularList(), list);

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

  {
    const array = [];
    for (const value of circularList.getReverseNodeIterator()) array.push(value.x);
    t.deepEqual(array, [3, 2, 1]);
  }

  {
    const array = [];
    for (const value of circularList.getReverseNodeIterator({from: b, to: c})) array.push(value.x);
    t.deepEqual(array, [3, 2]);
  }
});
