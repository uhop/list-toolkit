'use strict';

import test from 'tape-six';
import MinHeap from '../src/MinHeap.js';

test('MinHeap', t => {
  t.equal(typeof MinHeap, 'function');

  const heap = new MinHeap();

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
    const heap = new MinHeap(MinHeap.defaults, [3, 2, 5, 1, 4]);
    const array = heap.releaseSorted();
    t.deepEqual(array, [5, 4, 3, 2, 1]);
  }

  {
    const heap = new MinHeap({less: (a, b) => a > b}, [3, 2, 5, 1, 4]);
    const array = heap.releaseSorted();
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const heap = new MinHeap().push(3).push(2).push(5).push(1).push(4);
    const array = heap.releaseSorted();
    t.deepEqual(array, [5, 4, 3, 2, 1]);
  }

  heap.clear();
  t.ok(heap.isEmpty);

  // pushPop()

  heap.merge([2, 1, 3]);
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
  t.deepEqual(heap.releaseSorted(), [5, 4, 3]);
});
