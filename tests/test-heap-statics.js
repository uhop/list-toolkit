import test from 'tape-six';
import MinHeap from 'list-toolkit/heap/min-heap.js';

const less = (a, b) => a < b;

const isHeapOrdered = arr => {
  for (let i = 0; i < arr.length; ++i) {
    const l = (i << 1) + 1,
      r = l + 1;
    if (l < arr.length && less(arr[l], arr[i])) return false;
    if (r < arr.length && less(arr[r], arr[i])) return false;
  }
  return true;
};

test('MinHeap.build heapifies an array in place', t => {
  const arr = [5, 3, 8, 1, 9, 2, 7];
  const result = MinHeap.build(arr, less);
  t.equal(result, arr, 'returns the same array');
  t.ok(isHeapOrdered(arr), 'array is now heap-ordered');
  t.equal(arr[0], 1, 'root is the minimum');
});

test('MinHeap.build on empty / single-element arrays', t => {
  t.deepEqual(MinHeap.build([], less), []);
  t.deepEqual(MinHeap.build([42], less), [42]);
});

test('MinHeap.push extends array and maintains heap property', t => {
  const arr = MinHeap.build([5, 3, 8], less);
  MinHeap.push(arr, 1, less);
  t.equal(arr.length, 4);
  t.equal(arr[0], 1, 'new minimum bubbled to root');
  t.ok(isHeapOrdered(arr));
});

test('MinHeap.pop returns and removes the minimum', t => {
  const arr = MinHeap.build([5, 3, 8, 1, 9, 2, 7], less);
  const popped = MinHeap.pop(arr, less);
  t.equal(popped, 1, 'returns the previous minimum');
  t.equal(arr.length, 6);
  t.ok(isHeapOrdered(arr));
});

test('MinHeap.pop on empty array returns undefined', t => {
  const arr = [];
  t.equal(MinHeap.pop(arr, less), undefined);
  t.equal(arr.length, 0);
});

test('MinHeap.pushPop optimization', t => {
  // when item is <= current min, returns item without touching heap
  const arr = MinHeap.build([5, 3, 8], less);
  t.equal(MinHeap.pushPop(arr, 1, less), 1, 'small item returned directly');
  t.equal(arr.length, 3);
  t.deepEqual(
    [...arr].sort((a, b) => a - b),
    [3, 5, 8]
  );

  // when item > current min, replaces top
  const arr2 = MinHeap.build([5, 3, 8], less);
  t.equal(MinHeap.pushPop(arr2, 4, less), 3, 'old min returned');
  t.equal(arr2.length, 3);
  t.ok(isHeapOrdered(arr2));
});

test('MinHeap.pushPop on empty array', t => {
  // empty array + no current min, item is just returned
  const arr = [];
  t.equal(MinHeap.pushPop(arr, 5, less), 5);
  t.equal(arr.length, 0);
});

test('MinHeap.replaceTop swaps top with item', t => {
  const arr = MinHeap.build([3, 5, 8, 9], less);
  const old = MinHeap.replaceTop(arr, 1, less);
  t.equal(old, 3, 'returns previous min');
  t.equal(arr[0], 1);
  t.ok(isHeapOrdered(arr));
});

test('MinHeap.replaceTop on empty array returns undefined and seeds index 0', t => {
  const arr = [];
  t.equal(MinHeap.replaceTop(arr, 42, less), undefined, 'no element to "replace"');
  t.equal(arr.length, 1);
  t.equal(arr[0], 42, 'item seeded at index 0');
});

test('MinHeap.has finds elements regardless of position', t => {
  const arr = MinHeap.build([3, 5, 8, 1, 9], less);
  t.ok(MinHeap.has(arr, 1));
  t.ok(MinHeap.has(arr, 9));
  t.ok(MinHeap.has(arr, 5));
  t.notOk(MinHeap.has(arr, 100));
  t.notOk(MinHeap.has([], 1));
});

test('MinHeap.findIndex returns -1 for missing', t => {
  const arr = MinHeap.build([3, 5, 8, 1, 9], less);
  t.ok(MinHeap.findIndex(arr, 1) >= 0);
  t.equal(MinHeap.findIndex(arr, 100), -1);
});

test('MinHeap.removeByIndex removes element and re-heapifies', t => {
  const arr = MinHeap.build([1, 3, 8, 5, 9, 4, 7], less);
  const beforeLength = arr.length;
  const idx = MinHeap.findIndex(arr, 5);
  const result = MinHeap.removeByIndex(arr, idx, less);
  t.equal(result, arr, 'returns the same array');
  t.equal(arr.length, beforeLength - 1);
  t.notOk(MinHeap.has(arr, 5));
  t.ok(isHeapOrdered(arr));
});

test('MinHeap.removeByIndex on out-of-range returns array unchanged', t => {
  const arr = MinHeap.build([3, 5, 8], less);
  const before = [...arr];
  t.equal(MinHeap.removeByIndex(arr, -1, less), arr, 'negative index — array returned');
  t.deepEqual(arr, before, 'unchanged on negative index');
  t.equal(MinHeap.removeByIndex(arr, 99, less), arr, 'past-end index — array returned');
  t.deepEqual(arr, before, 'unchanged on past-end index');
});

test('MinHeap.remove removes by value', t => {
  const arr = MinHeap.build([1, 3, 8, 5, 9], less);
  MinHeap.remove(arr, 5, less);
  t.notOk(MinHeap.has(arr, 5));
  t.ok(isHeapOrdered(arr));
});

test('MinHeap.replaceByIndex updates and re-heapifies', t => {
  const arr = MinHeap.build([1, 3, 8, 5, 9], less);
  const idx = MinHeap.findIndex(arr, 8);
  MinHeap.replaceByIndex(arr, idx, 0, less);
  t.equal(arr[0], 0, 'new minimum bubbled to root');
  t.ok(isHeapOrdered(arr));
});

test('MinHeap.replaceByIndex on out-of-range returns array unchanged', t => {
  const arr = MinHeap.build([3, 5, 8], less);
  const before = [...arr];
  t.equal(MinHeap.replaceByIndex(arr, -1, 99, less), arr);
  t.deepEqual(arr, before);
  t.equal(MinHeap.replaceByIndex(arr, 99, 99, less), arr);
  t.deepEqual(arr, before);
});

test('MinHeap.replace replaces by value', t => {
  const arr = MinHeap.build([1, 3, 8, 5, 9], less);
  MinHeap.replace(arr, 8, 0, less);
  t.equal(arr[0], 0);
  t.ok(isHeapOrdered(arr));
});

test('MinHeap.updateByIndex on out-of-range returns array unchanged', t => {
  const arr = MinHeap.build([3, 5, 8], less);
  const before = [...arr];
  t.equal(MinHeap.updateByIndex(arr, -1, true, less), arr);
  t.deepEqual(arr, before);
  t.equal(MinHeap.updateByIndex(arr, 99, false, less), arr);
  t.deepEqual(arr, before);
});

test('MinHeap.sort sorts via heap', t => {
  const arr = [5, 3, 8, 1, 9, 2, 7];
  MinHeap.build(arr, less);
  MinHeap.sort(arr, less);
  // sort produces descending order (because we extract min repeatedly into the back).
  t.deepEqual(arr, [9, 8, 7, 5, 3, 2, 1]);
});

test('MinHeap.sort on small inputs is a no-op', t => {
  t.deepEqual(MinHeap.sort([], less), []);
  t.deepEqual(MinHeap.sort([42], less), [42]);
});

test('MinHeap.from builds a MinHeap instance from an array', t => {
  const heap = MinHeap.from([5, 3, 8, 1, 9], {less});
  t.ok(heap instanceof MinHeap);
  t.equal(heap.length, 5);
  t.equal(heap.top, 1);
  t.ok(isHeapOrdered(heap.array));
});
