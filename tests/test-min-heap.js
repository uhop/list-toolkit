'use strict';

import test from 'tape-six';
import MinHeap from 'list-toolkit/min-heap.js';

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

  // has()

  t.notOk(heap.has(3));
  heap.merge([1, 2, 3, 4, 5]);
  t.ok(heap.has(3));
  t.notOk(heap.has(6));

  // clone()

  const heap2 = heap.clone();
  t.equal(heap2.length, 5);
  t.equal(heap2.top, 1);
  t.deepEqual(heap2.releaseSorted(), [5, 4, 3, 2, 1]);
  t.ok(heap !== heap2);
  heap2.clear();

  // remove()

  {
    heap.clear().merge([1, 2, 3, 4, 5]).remove(1);
    t.deepEqual(heap.releaseSorted(), [5, 4, 3, 2]);

    heap.clear().merge([1, 2, 3, 4, 5]).remove(2);
    t.deepEqual(heap.releaseSorted(), [5, 4, 3, 1]);

    heap.clear().merge([1, 2, 3, 4, 5]).remove(3);
    t.deepEqual(heap.releaseSorted(), [5, 4, 2, 1]);

    heap.clear().merge([1, 2, 3, 4, 5]).remove(4);
    t.deepEqual(heap.releaseSorted(), [5, 3, 2, 1]);

    heap.clear().merge([1, 2, 3, 4, 5]).remove(5);
    t.deepEqual(heap.releaseSorted(), [4, 3, 2, 1]);

    heap.clear().merge([1, 2, 3, 4, 5]).remove(6);
    t.deepEqual(heap.releaseSorted(), [5, 4, 3, 2, 1]);

    heap.clear().merge([1, 2, 3, 4, 5]).remove(0);
    t.deepEqual(heap.releaseSorted(), [5, 4, 3, 2, 1]);
  }

  // replace()

  {
    heap.clear().merge([1, 2, 3, 4, 5]).replace(1, 6);
    t.deepEqual(heap.releaseSorted(), [6, 5, 4, 3, 2]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(1, 0);
    t.deepEqual(heap.releaseSorted(), [5, 4, 3, 2, 0]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(2, 6);
    t.deepEqual(heap.releaseSorted(), [6, 5, 4, 3, 1]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(2, 0);
    t.deepEqual(heap.releaseSorted(), [5, 4, 3, 1, 0]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(3, 6);
    t.deepEqual(heap.releaseSorted(), [6, 5, 4, 2, 1]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(3, 0);
    t.deepEqual(heap.releaseSorted(), [5, 4, 2, 1, 0]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(4, 6);
    t.deepEqual(heap.releaseSorted(), [6, 5, 3, 2, 1]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(4, 0);
    t.deepEqual(heap.releaseSorted(), [5, 3, 2, 1, 0]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(5, 6);
    t.deepEqual(heap.releaseSorted(), [6, 4, 3, 2, 1]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(5, 0);
    t.deepEqual(heap.releaseSorted(), [4, 3, 2, 1, 0]);

    heap.clear().merge([1, 2, 3, 4, 5]).replace(6, 0);
    t.deepEqual(heap.releaseSorted(), [5, 4, 3, 2, 1]);
  }
});
