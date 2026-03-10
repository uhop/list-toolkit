import test from 'tape-six';
import Queue from 'list-toolkit/queue.js';
import Stack from 'list-toolkit/stack.js';

test('Queue<V>: constructor and basic property types', t => {
  const q = new Queue<number>();
  const _empty: boolean = q.isEmpty;
  const _size: number = q.size;
  t.pass('compiles');
});

test('Queue<V>: enqueue/dequeue/push/pop/add/remove types', t => {
  const q = new Queue<string>();
  const _self: Queue<string> = q.enqueue('a');
  const _self2: Queue<string> = q.push('b');
  const _self3: Queue<string> = q.add('c');
  const _self4: Queue<string> = q.pushBack('d');
  const val: string | undefined = q.dequeue();
  const val2: string | undefined = q.pop();
  const val3: string | undefined = q.remove();
  const val4: string | undefined = q.popFront();
  t.pass('compiles');
});

test('Queue<V>: top/peek types', t => {
  const q = new Queue<number>();
  q.enqueue(42);
  const top: number | undefined = q.top;
  const peek: number | undefined = q.peek();
  t.pass('compiles');
});

test('Queue<V>: addValues type', t => {
  const q = new Queue<number>();
  const _self: Queue<number> = q.addValues([1, 2, 3]);
  t.pass('compiles');
});

test('Queue<V>: clear type', t => {
  const q = new Queue<number>();
  const _self: Queue<number> = q.clear();
  t.pass('compiles');
});

test('Queue<V>: iterator types', t => {
  const q = new Queue<number>();
  q.enqueue(1);
  const iter: IterableIterator<number> = q[Symbol.iterator]();
  const revIter: IterableIterator<number> | undefined = q.getReverseIterator();
  t.pass('compiles');
});

test('Stack<V>: constructor and basic property types', t => {
  const s = new Stack<number>();
  const _empty: boolean = s.isEmpty;
  const _size: number = s.size;
  t.pass('compiles');
});

test('Stack<V>: push/pop types', t => {
  const s = new Stack<string>();
  const _self: Stack<string> = s.push('a');
  const _self2: Stack<string> = s.pushFront('b');
  const val: string | undefined = s.pop();
  t.pass('compiles');
});

test('Stack<V>: top/peek types', t => {
  const s = new Stack<number>();
  s.push(42);
  const top: number | undefined = s.top;
  const peek: number | undefined = s.peek();
  t.pass('compiles');
});

test('Stack<V>: pushValues type', t => {
  const s = new Stack<number>();
  const _self: Stack<number> = s.pushValues([1, 2, 3]);
  t.pass('compiles');
});

test('Stack<V>: clear type', t => {
  const s = new Stack<number>();
  const _self: Stack<number> = s.clear();
  t.pass('compiles');
});

test('Stack<V>: iterator types', t => {
  const s = new Stack<number>();
  s.push(1);
  const iter: IterableIterator<number> = s[Symbol.iterator]();
  const revIter: IterableIterator<number> | undefined = s.getReverseIterator();
  t.pass('compiles');
});
