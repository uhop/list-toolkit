'use strict';

import test from 'tape-six';
import LeftistHeap from 'list-toolkit/heap/leftist-heap.js';

test('LeftistHeap', t => {
  t.equal(typeof LeftistHeap, 'function');

  const heap = new LeftistHeap();

  t.ok(heap.isEmpty);
  t.equal(heap.length, 0);
  t.equal(heap.top, undefined);

  heap.push(3).push(2).push(5).push(1).push(4);

  t.notOk(heap.isEmpty);
  t.equal(heap.length, 5);

  {
    const tops = [],
      pops = [];
    while (!heap.isEmpty) {
      tops.push(heap.top);
      pops.push(heap.pop());
    }
    t.deepEqual(tops, [1, 2, 3, 4, 5]);
    t.deepEqual(pops, [1, 2, 3, 4, 5]);
  }
  t.equal(heap.top, undefined);
  t.equal(heap.pop(), undefined);

  t.ok(heap.isEmpty);

  {
    const heap = LeftistHeap.from([3, 2, 5, 1, 4]);
    const array = [];
    while (!heap.isEmpty) array.push(heap.pop());
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const heap = LeftistHeap.from([3, 2, 5, 1, 4], {less: (a, b) => a > b});
    const array = [];
    while (!heap.isEmpty) array.push(heap.pop());
    t.deepEqual(array, [5, 4, 3, 2, 1]);
  }

  {
    const heap = new LeftistHeap().push(3).push(2).push(5).push(1).push(4);
    const array = [];
    while (!heap.isEmpty) array.push(heap.pop());
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const heap = LeftistHeap.from(['b', 'c', 'a', 'b'], {compare: (a, b) => a.localeCompare(b)});
    const array = [];
    while (!heap.isEmpty) array.push(heap.pop());
    t.deepEqual(array, ['a', 'b', 'b', 'c']);
  }

  heap.clear();
  t.ok(heap.isEmpty);

  // pushPop()

  heap.merge(LeftistHeap.from([2, 1, 3], heap));
  t.equal(heap.length, 3);
  t.equal(heap.top, 1);

  t.equal(heap.pushPop(4), 1);
  t.equal(heap.pushPop(3), 2);
  t.equal(heap.pushPop(1), 1);

  t.equal(heap.length, 3);
  t.equal(heap.top, 3);

  // replaceTop();

  t.equal(heap.replaceTop(2), 3);
  t.equal(heap.replaceTop(1), 2);
  t.equal(heap.replaceTop(5), 1);

  t.equal(heap.length, 3);
  t.equal(heap.top, 3);
  {
    const array = [];
    while (!heap.isEmpty) array.push(heap.pop());
    t.deepEqual(array, [3, 4, 5]);
  }

  // clone()

  const heap2 = LeftistHeap.from([3, 2, 5, 1, 4]);
  const heap3 = heap2.clone();
  t.equal(heap3.length, 5);
  t.equal(heap3.top, 1);
  {
    const array = [];
    while (!heap3.isEmpty) array.push(heap3.pop());
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }
  t.ok(heap2 !== heap3);
  heap3.clear();
});
