import test from 'tape-six';
import MinHeap from 'list-toolkit/heap.js';
import {LeftistHeap} from 'list-toolkit/heap/leftist-heap.js';
import {SkewHeap} from 'list-toolkit/heap/skew-heap.js';
import type {HeapOptions, HeapBase} from 'list-toolkit/heap/basics.js';

test('MinHeap<T>: constructor and basic property types', t => {
  const heap = new MinHeap<number>();
  const _len: number = heap.length;
  const _empty: boolean = heap.isEmpty;
  const _top: number | undefined = heap.top;
  const _peek: number | undefined = heap.peek();
  t.pass('compiles');
});

test('MinHeap<T>: push/pop/pushPop/replaceTop return types', t => {
  const heap = new MinHeap<number>();
  const _self: MinHeap<number> = heap.push(10);
  const popped: number | undefined = heap.pop();
  heap.push(1).push(2).push(3);
  const pp: number = heap.pushPop(5);
  const rt: number = heap.replaceTop(0);
  t.pass('compiles');
});

test('MinHeap<T>: HeapOptions typing', t => {
  const opts1: HeapOptions<string> = {less: (a, b) => a < b};
  const opts2: HeapOptions<string> = {compare: (a, b) => a.localeCompare(b)};
  const opts3: HeapOptions<number> = {less: (a, b) => a < b, equal: (a, b) => a === b};
  const heap = new MinHeap<string>(opts2);
  t.pass('compiles');
});

test('MinHeap<T>: has/findIndex/remove/replace types', t => {
  const heap = MinHeap.from<number>([1, 2, 3]);
  const _has: boolean = heap.has(2);
  const _idx: number = heap.findIndex(2);
  const _self: MinHeap<number> = heap.remove(2);
  const _self2: MinHeap<number> = heap.removeByIndex(0);
  const _self3: MinHeap<number> = heap.replace(1, 10);
  const _self4: MinHeap<number> = heap.replaceByIndex(0, 20);
  t.pass('compiles');
});

test('MinHeap<T>: update types', t => {
  const heap = MinHeap.from<number>([1, 2, 3]);
  const _self: MinHeap<number> = heap.updateTop();
  const _self2: MinHeap<number> = heap.updateByIndex(0, true);
  const _self3: MinHeap<number> = heap.updateByIndex(0, false);
  t.pass('compiles');
});

test('MinHeap<T>: clear/releaseSorted/merge/clone types', t => {
  const heap = MinHeap.from<number>([3, 1, 2]);
  const _self: MinHeap<number> = heap.clear();
  const heap2 = MinHeap.from<number>([4, 5]);
  const sorted: number[] = heap2.releaseSorted();
  const heap3 = MinHeap.from<number>([1]);
  const heap4 = MinHeap.from<number>([2]);
  const _merged: MinHeap<number> = heap3.merge(heap4);
  const cloned: MinHeap<number> = heap3.clone();
  const made: HeapBase<number> = heap3.make([6, 7]);
  t.pass('compiles');
});

test('MinHeap<T>: static methods types', t => {
  const arr: number[] = [3, 1, 2];
  MinHeap.build(arr);
  const popped: number | undefined = MinHeap.pop(arr);
  MinHeap.push(arr, 5);
  const fromStatic: MinHeap<number> = MinHeap.from<number>([1, 2]);
  t.pass('compiles');
});

test('MinHeap<T>: object values with custom less', t => {
  interface Task {
    priority: number;
    name: string;
  }
  const opts: HeapOptions<Task> = {less: (a, b) => a.priority < b.priority};
  const heap = new MinHeap<Task>(opts);
  const _self: MinHeap<Task> = heap.push({priority: 1, name: 'a'});
  const task: Task | undefined = heap.pop();
  t.pass('compiles');
});

test('LeftistHeap<T>: basic types', t => {
  const heap = new LeftistHeap<number>();
  const _self: LeftistHeap<number> = heap.push(10);
  const popped: number | undefined = heap.pop();
  const _top: number | undefined = heap.top;
  const _len: number = heap.length;
  const _empty: boolean = heap.isEmpty;
  t.pass('compiles');
});

test('LeftistHeap<T>: merge/clone/from types', t => {
  const h1 = LeftistHeap.from<number>([1, 3]);
  const h2 = LeftistHeap.from<number>([2, 4]);
  const _self: LeftistHeap<number> = h1.merge(h2);
  const cloned: LeftistHeap<number> = h1.clone();
  const fromStatic: LeftistHeap<number> = LeftistHeap.from<number>([5]);
  t.pass('compiles');
});

test('SkewHeap<T>: basic types', t => {
  const heap = new SkewHeap<number>();
  const _self: SkewHeap<number> = heap.push(10);
  const popped: number | undefined = heap.pop();
  const _top: number | undefined = heap.top;
  const _len: number = heap.length;
  const _empty: boolean = heap.isEmpty;
  t.pass('compiles');
});

test('SkewHeap<T>: merge/clone/from types', t => {
  const h1 = SkewHeap.from<number>([1, 3]);
  const h2 = SkewHeap.from<number>([2, 4]);
  const _self: SkewHeap<number> = h1.merge(h2);
  const cloned: SkewHeap<number> = h1.clone();
  const fromStatic: SkewHeap<number> = SkewHeap.from<number>([5]);
  t.pass('compiles');
});
