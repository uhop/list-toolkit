'use strict';

import test from 'tape-six';
import ExtValueSList from 'list-toolkit/ext-value-slist.js';

test('ExtValueSList', t => {
  t.equal(typeof ExtValueSList, 'function');

  const extList = new ExtValueSList();
  t.ok(extList.isEmpty);
  t.ok(extList.isOneOrEmpty);
  t.equal(extList.getLength(), 0);

  extList.attach(ExtValueSList.from([1, 2, 3]).detach());
  t.notOk(extList.isEmpty);
  t.equal(extList.getLength(), 3);
  t.deepEqual(Array.from(extList), [1, 2, 3]);

  extList.next();
  t.deepEqual(Array.from(extList), [2, 3, 1]);

  extList.next();
  t.deepEqual(Array.from(extList), [3, 1, 2]);

  extList.next().next();
  t.deepEqual(Array.from(extList), [2, 3, 1]);

  {
    const node = extList.removeAfter();
    t.deepEqual(Array.from(extList), [2, 1]);
    t.ok(node.value === 3);

    const array = [];
    while (!extList.isEmpty) {
      array.push(extList.removeAfter().value);
    }
    t.ok(extList.isEmpty);
    t.deepEqual(array, [1, 2]);
  }

  extList.addAfter(1);
  t.equal(extList.getLength(), 1);
  t.deepEqual(Array.from(extList), [1]);

  extList.addAfter(2);
  t.equal(extList.getLength(), 2);
  t.deepEqual(Array.from(extList), [1, 2]);

  extList.addAfter(3);
  t.equal(extList.getLength(), 3);
  t.deepEqual(Array.from(extList), [1, 3, 2]);

  extList.clear(true);
  t.ok(extList.isEmpty);

  extList.addAfter(1);
  extList.insertAfter(ExtValueSList.from([3, 2]));
  t.deepEqual(Array.from(extList), [1, 2, 3]);
  extList.clear(true);

  extList.addAfter(1);
  extList.insertAfter(ExtValueSList.from([2, 3]));
  t.deepEqual(Array.from(extList), [1, 3, 2]);

  extList.addAfter(1);
  extList.addAfter(2);
  extList.addAfter(3);
  t.deepEqual(Array.from(extList), [1, 3, 2, 1, 3, 2]);

  extList.removeAfter();
  t.deepEqual(Array.from(extList), [1, 2, 1, 3, 2]);

  extList.addAfter(2);
  extList.removeAfter();
  t.deepEqual(Array.from(extList), [1, 2, 1, 3, 2]);
});

test('ExtValueSList.extractRange() and ExtValueSList.removeRange()', t => {
  const options = {nextName: Symbol()},
    extList = ExtValueSList.from([1, 2, 3], options);

  t.deepEqual(Array.from(extList), [1, 2, 3]);

  const b = extList.makePtr(),
    c = b.clone().next(),
    a = c.clone().next();

  const extracted = extList.extractRange({from: b, to: c});
  t.deepEqual(Array.from(extList), [1]);
  t.deepEqual(Array.from(extracted), [2, 3]);

  extList.addAfter(extracted.removeAfter());
  extList.addAfter(extracted.removeAfter());
  t.deepEqual(Array.from(extList), [1, 2, 3]);
  t.deepEqual(Array.from(extracted), []);

  extList.removeRange({from: a, to: b}, true);
  t.deepEqual(Array.from(extList), [3]);

  extList.addAfter(1);
  extList.addAfter(2);
  t.deepEqual(Array.from(extList), [3, 2, 1]);

  const node = extList.makePtr();
  extList.next().removeRange({from: node.clone().next(), to: node}, true);
  t.deepEqual(Array.from(extList), []);
});

test('ExtValueSList.extractBy()', t => {
  const extList = ExtValueSList.from([1, 2, 3]);

  const extracted = extList.extractBy(node => node.value > 1);
  t.deepEqual(Array.from(extList), [1]);
  t.deepEqual(Array.from(extracted), [2, 3]);

  extList.insertAfter(extracted);
  extracted.attach(extList.extractBy(node => node.value % 2).detach());
  t.deepEqual(Array.from(extList), [2]);
  t.deepEqual(Array.from(extracted), [1, 3]);
});

test('ExtValueSList.reverse() and ExtValueSList.sort()', t => {
  const extList = ExtValueSList.from([1, 2, 3]);

  extList.reverse();
  t.deepEqual(Array.from(extList), [3, 2, 1]);

  extList.sort((a, b) => a.value < b.value);
  t.deepEqual(Array.from(extList), [1, 2, 3]);

  {
    const N = 100;

    const array = new Array(N);
    for (let i = 0; i < N; ++i) array[i] = Math.random();

    const extList = ExtValueSList.from(array);
    extList.sort((a, b) => a.value < b.value);

    t.deepEqual(
      Array.from(extList),
      array.sort((a, b) => a - b)
    );
  }
});

test('ExtValueSList iterators', t => {
  const extList = ExtValueSList.from([1, 2, 3]);

  {
    const array = [];
    for (const value of extList) array.push(value);
    t.deepEqual(array, [1, 2, 3]);
  }

  {
    const array = [];
    const b = extList.makePtr(),
      c = b.clone().next();
    for (const node of extList.getNodeIterator({from: b, to: c})) array.push(node.value);
    t.deepEqual(array, [2, 3]);
  }
});
