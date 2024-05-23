'use strict';

import test from 'tape-six';
import ExtValueList from 'list-toolkit/ext-value-list.js';
import {isStandAlone} from 'list-toolkit/list/nodes.js';

test('ExtValueList', t => {
  t.equal(typeof ExtValueList, 'function');

  const extList = new ExtValueList();
  t.ok(extList.isEmpty);
  t.ok(extList.isOneOrEmpty);
  t.equal(extList.getLength(), 0);

  extList.attach(ExtValueList.from([1, 2, 3]).detach());
  t.notOk(extList.isEmpty);
  t.equal(extList.getLength(), 3);
  t.deepEqual(Array.from(extList), [1, 2, 3]);

  extList.next();
  t.deepEqual(Array.from(extList), [2, 3, 1]);

  extList.next();
  t.deepEqual(Array.from(extList), [3, 1, 2]);

  extList.prev();
  t.deepEqual(Array.from(extList), [2, 3, 1]);

  {
    const node = extList.remove();
    t.deepEqual(Array.from(extList), [3, 1]);
    t.ok(node.value === 2);

    const array = [];
    while (!extList.isEmpty) {
      array.push(extList.remove().value);
    }
    t.ok(extList.isEmpty);
    t.deepEqual(array, [3, 1]);
  }

  extList.addBefore(1);
  t.equal(extList.getLength(), 1);
  t.deepEqual(Array.from(extList), [1]);

  extList.addBefore(2);
  t.equal(extList.getLength(), 2);
  t.deepEqual(Array.from(extList), [1, 2]);

  extList.addAfter(3);
  t.equal(extList.getLength(), 3);
  t.deepEqual(Array.from(extList), [1, 3, 2]);

  extList.clear(true);
  t.ok(extList.isEmpty);

  extList.addAfter(1);
  extList.insertAfter(ExtValueList.from([3, 2]));
  t.deepEqual(Array.from(extList), [1, 3, 2]);
  extList.clear(true);

  extList.addAfter(1);
  extList.insertBefore(ExtValueList.from([2, 3]));
  t.deepEqual(Array.from(extList), [1, 2, 3]);

  let a = extList.makePtr(),
    b = a.clone().next(),
    c = b.clone().next();

  extList.moveBefore(b);
  t.deepEqual(Array.from(extList), [1, 3, 2]);

  extList.moveAfter(b);
  t.deepEqual(Array.from(extList), [1, 2, 3]);

  extList.removeNode(b);
  t.deepEqual(Array.from(extList), [1, 3]);

  extList.removeNode(a);
  t.deepEqual(Array.from(extList), [3]);

  extList.removeNode(c);
  t.deepEqual(Array.from(extList), []);

  extList.addBefore(a);
  extList.addBefore(b);
  extList.addBefore(c);
  t.deepEqual(Array.from(extList), [1, 2, 3]);

  {
    const removed = extList.removeAfter();
    t.deepEqual(Array.from(extList), [1, 3]);
    t.ok(isStandAlone(extList, removed));
  }

  extList.addBefore(b);
  extList.removeBefore();
  t.deepEqual(Array.from(extList), [1, 3]);
});

test('ExtValueList.extractRange() and ExtValueList.removeRange()', t => {
  const options = {nextName: Symbol(), prevName: Symbol()},
    extList = ExtValueList.from([1, 2, 3], options);

  t.deepEqual(Array.from(extList), [1, 2, 3]);

  const a = extList.makePtr(),
    b = a.clone().next(),
    c = b.clone().next();

  const extracted = extList.extractRange({from: b, to: c});
  t.deepEqual(Array.from(extList), [1]);
  t.deepEqual(Array.from(extracted), [2, 3]);

  extList.addBefore(extracted.remove());
  extList.addBefore(extracted.remove());
  t.deepEqual(Array.from(extList), [1, 2, 3]);
  t.deepEqual(Array.from(extracted), []);

  extList.removeRange({from: a, to: b}, true);
  t.deepEqual(Array.from(extList), [3]);

  extList.addAfter(a);
  extList.addAfter(b);
  t.deepEqual(Array.from(extList), [3, 2, 1]);

  extList.removeRange({from: c, to: a}, true);
  t.deepEqual(Array.from(extList), []);
});

test('ExtValueList.extractBy()', t => {
  const extList = ExtValueList.from([1, 2, 3]);

  const extracted = extList.extractBy(node => node.value > 1);
  t.deepEqual(Array.from(extList), [1]);
  t.deepEqual(Array.from(extracted), [2, 3]);

  extList.insertAfter(extracted);
  extracted.head = extList.extractBy(node => node.value % 2).head;
  t.deepEqual(Array.from(extList), [2]);
  t.deepEqual(Array.from(extracted), [1, 3]);
});

test('ExtValueList.reverse() and ExtValueList.sort()', t => {
  const extList = ExtValueList.from([1, 2, 3]);

  extList.reverse();
  t.deepEqual(Array.from(extList), [3, 2, 1]);

  extList.sort((a, b) => a.value < b.value);
  t.deepEqual(Array.from(extList), [1, 2, 3]);

  {
    const N = 100;

    const array = new Array(N);
    for (let i = 0; i < N; ++i) array[i] = Math.random();

    const extList = ExtValueList.from(array);
    extList.sort((a, b) => a.value < b.value);

    t.deepEqual(
      Array.from(extList),
      array.sort((a, b) => a - b)
    );
  }
});

test('ExtValueList iterators', t => {
  const extList = ExtValueList.from([1, 2, 3]);

  const a = extList.makePtr(),
    b = a.clone().next(),
    c = b.clone().next();

  {
    const array = [];
    for (const value of extList) array.push(value);
    t.deepEqual(array, [1, 2, 3]);
  }

  {
    const array = [];
    for (const value of extList.getIterator({from: b, to: c})) array.push(value);
    t.deepEqual(array, [2, 3]);
  }

  {
    const array = [];
    for (const node of extList.getNodeIterator({from: b, to: c})) array.push(node.value);
    t.deepEqual(array, [2, 3]);
  }

  {
    const array = [];
    for (const node of extList.getReverseNodeIterator()) array.push(node.value);
    t.deepEqual(array, [3, 2, 1]);
  }

  {
    const array = [];
    for (const value of extList.getReverseIterator({from: b, to: c})) array.push(value);
    t.deepEqual(array, [3, 2]);
  }

  {
    const array = [];
    for (const node of extList.getReverseNodeIterator({from: b, to: c})) array.push(node.value);
    t.deepEqual(array, [3, 2]);
  }
});
