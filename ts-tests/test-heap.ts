import test from 'tape-six';
import MinHeap from 'list-toolkit/heap.js';
import {LeftistHeap} from 'list-toolkit/heap/leftist-heap.js';
import {SkewHeap} from 'list-toolkit/heap/skew-heap.js';
import type {HeapOptions} from 'list-toolkit/heap/basics.js';

test('MinHeap<T>: default numeric ordering', t => {
  const heap = new MinHeap<number>();
  heap.push(30).push(10).push(20);

  t.equal(heap.length, 3);

  const top: number | undefined = heap.top;
  t.equal(top, 10);

  const popped: number | undefined = heap.pop();
  t.equal(popped, 10);
  t.equal(heap.length, 2);
});

test('MinHeap<T>: custom compare option', t => {
  const opts: HeapOptions<string> = {
    compare: (a: string, b: string) => a.localeCompare(b)
  };
  const heap = new MinHeap<string>(opts);
  heap.push('banana').push('apple').push('cherry');

  t.equal(heap.top, 'apple');
});

test('MinHeap<T>: pushPop and replaceTop return T', t => {
  const heap = MinHeap.from<number>([10, 20, 30]);

  const result: number = heap.pushPop(5);
  t.equal(result, 5);

  const old: number = heap.replaceTop(1);
  t.equal(old, 10);
  t.equal(heap.top, 1);
});

test('MinHeap<T>: static methods with typed arrays', t => {
  const arr: number[] = [30, 10, 20];
  MinHeap.build(arr);

  const popped: number | undefined = MinHeap.pop(arr);
  t.equal(popped, 10);

  MinHeap.push(arr, 5);
  t.equal(arr.length, 3);
});

test('MinHeap<T>: merge typed heaps', t => {
  const h1 = MinHeap.from<number>([1, 3, 5]);
  const h2 = MinHeap.from<number>([2, 4, 6]);

  h1.merge(h2);
  t.equal(h1.length, 6);
  t.equal(h1.top, 1);
});

test('MinHeap<T>: clone returns MinHeap<T>', t => {
  const heap = MinHeap.from<number>([10, 20]);
  const copy: MinHeap<number> = heap.clone();

  t.equal(copy.length, 2);
  t.equal(copy.top, 10);
});

test('MinHeap<T>: releaseSorted returns T[]', t => {
  const heap = MinHeap.from<number>([30, 10, 20]);
  const sorted: number[] = heap.releaseSorted();

  t.deepEqual(sorted, [30, 20, 10]);
  t.ok(heap.isEmpty);
});

test('MinHeap<T>: object values with custom less', t => {
  interface Task {
    priority: number;
    name: string;
  }
  const heap = new MinHeap<Task>({less: (a, b) => a.priority < b.priority});
  heap.push({priority: 3, name: 'low'});
  heap.push({priority: 1, name: 'high'});
  heap.push({priority: 2, name: 'mid'});

  const top: Task | undefined = heap.pop();
  t.equal(top!.name, 'high');
});

test('LeftistHeap<T>: basic operations', t => {
  const heap = new LeftistHeap<number>();
  heap.push(30).push(10).push(20);

  t.equal(heap.length, 3);
  t.equal(heap.top, 10);

  const popped: number | undefined = heap.pop();
  t.equal(popped, 10);
});

test('LeftistHeap<T>: merge consumes other heap', t => {
  const h1 = LeftistHeap.from<number>([1, 3]);
  const h2 = LeftistHeap.from<number>([2, 4]);

  h1.merge(h2);
  t.equal(h1.length, 4);
  t.ok(h2.isEmpty);
});

test('LeftistHeap<T>: clone returns LeftistHeap<T>', t => {
  const heap = LeftistHeap.from<number>([5, 10]);
  const copy: LeftistHeap<number> = heap.clone();

  t.equal(copy.top, 5);
  t.equal(copy.length, 2);
});

test('SkewHeap<T>: basic operations', t => {
  const heap = new SkewHeap<number>();
  heap.push(30).push(10).push(20);

  t.equal(heap.length, 3);
  t.equal(heap.top, 10);

  const popped: number | undefined = heap.pop();
  t.equal(popped, 10);
});

test('SkewHeap<T>: merge and clone', t => {
  const h1 = SkewHeap.from<number>([1, 3]);
  const h2 = SkewHeap.from<number>([2, 4]);

  h1.merge(h2);
  t.equal(h1.length, 4);

  const copy: SkewHeap<number> = h1.clone();
  t.equal(copy.length, 4);
});
