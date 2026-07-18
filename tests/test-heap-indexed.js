import test from 'tape-six';
import IndexedHeap from 'list-toolkit/heap/indexed-heap.js';

const byPriority = {less: (a, b) => a.p < b.p};

const isValidHeap = heap => {
  const {array, less, indexName} = heap;
  for (let i = 0; i < array.length; ++i) {
    if (array[i][indexName] !== i) return false;
    if (i && less(array[i], array[(i - 1) >> 1])) return false;
  }
  return true;
};

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

test('IndexedHeap - basics', t => {
  const heap = new IndexedHeap(byPriority);
  t.ok(heap.isEmpty);
  t.equal(heap.length, 0);
  t.equal(heap.top, undefined);
  t.equal(heap.pop(), undefined);

  const a = {p: 3},
    b = {p: 1},
    c = {p: 2};
  heap.push(a).push(b).push(c);
  t.equal(heap.length, 3);
  t.equal(heap.top, b);
  t.equal(heap.peek(), b);
  t.ok(isValidHeap(heap));

  t.equal(heap.pop(), b);
  t.equal(heap.pop(), c);
  t.equal(heap.pop(), a);
  t.ok(heap.isEmpty);
});

test('IndexedHeap - index tracking, has, findIndex', t => {
  const heap = new IndexedHeap(byPriority),
    items = Array.from({length: 10}, (_, i) => ({p: 10 - i}));
  for (const item of items) heap.push(item);
  t.ok(isValidHeap(heap));
  t.ok(items.every(item => heap.has(item)));
  t.ok(items.every(item => heap.findIndex(item) >= 0 && heap.array[heap.findIndex(item)] === item));

  t.notOk(heap.has({p: 5}));
  t.equal(heap.findIndex({p: 5}), -1);
  t.notOk(heap.has(null));

  const top = heap.pop();
  t.equal(top.heapIndex, -1);
  t.notOk(heap.has(top));
  t.ok(isValidHeap(heap));
});

test('IndexedHeap - update (decrease-key and increase-key)', t => {
  const heap = new IndexedHeap(byPriority),
    items = Array.from({length: 8}, (_, i) => ({p: i + 1}));
  for (const item of items) heap.push(item);

  const late = items[7];
  late.p = 0;
  heap.update(late);
  t.equal(heap.top, late);
  t.ok(isValidHeap(heap));

  late.p = 100;
  heap.update(late);
  t.notEqual(heap.top, late);
  t.ok(isValidHeap(heap));

  const early = heap.top;
  early.p = 50;
  heap.update(early, false);
  t.notEqual(heap.top, early);
  t.ok(isValidHeap(heap));

  early.p = -1;
  heap.update(early, true);
  t.equal(heap.top, early);
  t.ok(isValidHeap(heap));

  t.equal(heap.update({p: 0}), heap);
  t.ok(isValidHeap(heap));
});

test('IndexedHeap - updateTop', t => {
  const heap = IndexedHeap.from([{p: 1}, {p: 2}, {p: 3}], byPriority);
  heap.top.p = 10;
  heap.updateTop();
  t.equal(heap.top.p, 2);
  t.ok(isValidHeap(heap));
});

test('IndexedHeap - remove by handle', t => {
  const heap = new IndexedHeap(byPriority),
    items = Array.from({length: 10}, (_, i) => ({p: i}));
  for (const item of items) heap.push(item);

  heap.remove(items[5]);
  t.equal(heap.length, 9);
  t.equal(items[5].heapIndex, -1);
  t.notOk(heap.has(items[5]));
  t.ok(isValidHeap(heap));

  heap.remove(items[0]);
  t.equal(heap.top, items[1]);
  t.ok(isValidHeap(heap));

  heap.remove(items[9]);
  t.equal(heap.length, 7);
  t.ok(isValidHeap(heap));

  heap.remove(items[5]);
  t.equal(heap.length, 7);

  const drained = [];
  while (!heap.isEmpty) drained.push(heap.pop().p);
  t.deepEqual(drained, [1, 2, 3, 4, 6, 7, 8]);
});

test('IndexedHeap - replace, replaceByIndex, replaceTop, pushPop', t => {
  const heap = new IndexedHeap(byPriority),
    items = [{p: 1}, {p: 3}, {p: 5}];
  for (const item of items) heap.push(item);

  const four = {p: 4};
  heap.replace(items[1], four);
  t.equal(items[1].heapIndex, -1);
  t.ok(heap.has(four));
  t.ok(isValidHeap(heap));

  const zero = {p: 0};
  heap.replaceByIndex(heap.findIndex(four), zero);
  t.equal(heap.top, zero);
  t.notOk(heap.has(four));
  t.ok(isValidHeap(heap));

  const previousTop = heap.replaceTop({p: 2});
  t.equal(previousTop, zero);
  t.equal(previousTop.heapIndex, -1);
  t.ok(isValidHeap(heap));

  const small = {p: -5};
  t.equal(heap.pushPop(small), small);
  t.notOk(heap.has(small));
  const big = {p: 100};
  const popped = heap.pushPop(big);
  t.notEqual(popped, big);
  t.ok(heap.has(big));
  t.ok(isValidHeap(heap));
});

test('IndexedHeap - merge drains source heaps', t => {
  const heap1 = IndexedHeap.from([{p: 1}, {p: 5}], byPriority),
    heap2 = IndexedHeap.from([{p: 2}, {p: 4}], byPriority),
    extra = [{p: 3}, {p: 0}];
  heap1.merge(heap2, extra);
  t.ok(heap2.isEmpty);
  t.equal(heap1.length, 6);
  t.ok(isValidHeap(heap1));
  const drained = [];
  while (!heap1.isEmpty) drained.push(heap1.pop().p);
  t.deepEqual(drained, [0, 1, 2, 3, 4, 5]);
});

test('IndexedHeap - same object in multiple heaps via index names', t => {
  const items = Array.from({length: 6}, (_, i) => ({p: i})),
    minHeap = new IndexedHeap({...byPriority, indexName: 'minIndex'}),
    maxHeap = new IndexedHeap({less: (a, b) => a.p > b.p, indexName: 'maxIndex'});
  for (const item of items) {
    minHeap.push(item);
    maxHeap.push(item);
  }
  t.ok(isValidHeap(minHeap));
  t.ok(isValidHeap(maxHeap));
  t.equal(minHeap.top, items[0]);
  t.equal(maxHeap.top, items[5]);

  items[3].p = -10;
  minHeap.update(items[3]);
  maxHeap.update(items[3]);
  t.equal(minHeap.top, items[3]);
  t.ok(isValidHeap(minHeap));
  t.ok(isValidHeap(maxHeap));

  minHeap.remove(items[0]);
  t.ok(maxHeap.has(items[0]));
  t.ok(isValidHeap(maxHeap));
});

test('IndexedHeap - symbol index name', t => {
  const key = Symbol('heap'),
    heap = new IndexedHeap({...byPriority, indexName: key}),
    item = {p: 1};
  heap.push(item).push({p: 2});
  t.equal(item[key], 0);
  t.ok(heap.has(item));
  heap.pop();
  t.equal(item[key], -1);
});

test('IndexedHeap - from, build, releaseSorted, clear', t => {
  const items = [{p: 3}, {p: 1}, {p: 4}, {p: 1.5}, {p: 5}],
    heap = IndexedHeap.from(items, byPriority);
  t.equal(heap.array, items);
  t.ok(isValidHeap(heap));

  for (const item of items) item.p = -item.p;
  heap.build();
  t.ok(isValidHeap(heap));

  const sorted = heap.releaseSorted();
  t.ok(heap.isEmpty);
  t.deepEqual(
    sorted.map(item => item.p),
    [-1, -1.5, -3, -4, -5]
  );
  t.ok(sorted.every(item => item.heapIndex === -1));

  const heap2 = IndexedHeap.from([{p: 1}, {p: 2}], byPriority),
    survivor = heap2.top;
  heap2.clear();
  t.ok(heap2.isEmpty);
  t.notOk(heap2.has(survivor));
});

test('IndexedHeap - deterministic stress', t => {
  const random = makeLcg(),
    heap = new IndexedHeap(byPriority),
    live = [];
  let nextId = 0;
  for (let step = 0; step < 2000; ++step) {
    const op = random();
    if (op < 0.5 || !live.length) {
      const item = {p: Math.floor(random() * 10000), id: nextId++};
      heap.push(item);
      live.push(item);
    } else if (op < 0.7) {
      const item = live.splice(Math.floor(random() * live.length), 1)[0];
      heap.remove(item);
    } else if (op < 0.9) {
      const item = live[Math.floor(random() * live.length)];
      item.p = Math.floor(random() * 10000);
      heap.update(item);
    } else {
      const item = heap.pop();
      live.splice(live.indexOf(item), 1);
    }
  }
  t.equal(heap.length, live.length);
  t.ok(isValidHeap(heap));
  const expected = live
    .slice()
    .sort((a, b) => a.p - b.p)
    .map(item => item.p);
  const drained = [];
  while (!heap.isEmpty) drained.push(heap.pop().p);
  t.deepEqual(drained, expected);
});

test('IndexedHeap: size alias', t => {
  const heap = new IndexedHeap(byPriority);
  t.equal(heap.size, 0);
  heap.push({p: 3}).push({p: 1});
  t.equal(heap.size, 2);
  t.equal(heap.size, heap.length);
});
