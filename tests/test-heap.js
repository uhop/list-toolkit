'use strict';

import test from 'tape-six';
import Heap from '../src/Heap.js';

test('Heap', t => {
  t.equal(typeof Heap, 'function');

  const heap = new Heap();

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
    t.deepEqual(tops, [5, 4, 3, 2, 1]);
    t.deepEqual(pops, [5, 4, 3, 2, 1]);
  }
  t.equal(heap.top, undefined);
  t.equal(heap.pop(), undefined);

  t.ok(heap.isEmpty);

  {
    const heap = new Heap((a, b) => a < b, [3, 2, 5, 1, 4]);
    const array = heap.releaseSorted();
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  {
    const heap = new Heap().push(3).push(2).push(5).push(1).push(4);
    const array = heap.releaseSorted();
    t.deepEqual(array, [1, 2, 3, 4, 5]);
  }

  heap.clear();
  t.ok(heap.isEmpty);
});
