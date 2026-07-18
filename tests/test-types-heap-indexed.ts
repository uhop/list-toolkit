import test from 'tape-six';
import IndexedHeap from 'list-toolkit/heap/indexed-heap.js';

interface Task {
  p: number;
  heapIndex?: number;
}

test('IndexedHeap<T>: constructor and basic property types', t => {
  const heap = new IndexedHeap<Task>({less: (a, b) => a.p < b.p, indexName: 'heapIndex'});
  const _length: number = heap.length;
  const _isEmpty: boolean = heap.isEmpty;
  const _top: Task | undefined = heap.top;
  const _array: Task[] = heap.array;
  t.pass('compiles');
});

test('IndexedHeap<T>: mutation and lookup types', t => {
  const heap = new IndexedHeap<Task>({less: (a, b) => a.p < b.p});
  const task: Task = {p: 1};
  const _self: IndexedHeap<Task> = heap.push(task).push({p: 2});
  const _popped: Task | undefined = heap.pop();
  const _pp: Task = heap.pushPop({p: 3});
  const _prev: Task | undefined = heap.replaceTop({p: 4});
  const _index: number = heap.findIndex(task);
  const _has: boolean = heap.has(task);
  const _self2: IndexedHeap<Task> = heap.update(task, true).update(task);
  const _self3: IndexedHeap<Task> = heap.remove(task).removeByIndex(0);
  const _self4: IndexedHeap<Task> = heap.replace(task, {p: 5}).replaceByIndex(0, {p: 6});
  const _self5: IndexedHeap<Task> = heap
    .merge(new IndexedHeap<Task>(), [{p: 7}])
    .build()
    .clear();
  const _sorted: Task[] = heap.releaseSorted();
  t.pass('compiles');
});

test('IndexedHeap<T>: from and symbol index name', t => {
  const key = Symbol('idx');
  const heap = IndexedHeap.from<Task>([{p: 1}, {p: 2}], {compare: (a, b) => a.p - b.p, indexName: key});
  const _made: IndexedHeap<Task> = heap.make();
  t.pass('compiles');
});
