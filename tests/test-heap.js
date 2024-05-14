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

  t.equal(heap.top, 5);
  t.equal(heap.pop(), 5);
  t.equal(heap.top, 4);
  t.equal(heap.pop(), 4);
  t.equal(heap.top, 3);
  t.equal(heap.pop(), 3);
  t.equal(heap.top, 2);
  t.equal(heap.pop(), 2);
  t.equal(heap.top, 1);
  t.equal(heap.pop(), 1);
  t.equal(heap.top, undefined);
  t.equal(heap.pop(), undefined);

  t.ok(heap.isEmpty);

  heap.push(3).push(2).push(5).push(1).push(4);
  const array = heap.releaseSorted();
  t.deepEqual(array, [1, 2, 3, 4, 5]);

  heap.clear();
  t.ok(heap.isEmpty);
});
