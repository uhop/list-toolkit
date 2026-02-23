import test from 'tape-six';
import Queue from 'list-toolkit/queue.js';
import Stack from 'list-toolkit/stack.js';

test('Queue<V>: typed enqueue/dequeue', t => {
  const q = new Queue<number>();
  t.ok(q.isEmpty);

  q.enqueue(1);
  q.enqueue(2);
  q.enqueue(3);

  t.equal(q.size, 3);

  const top: number | undefined = q.top;
  t.equal(top, 1);

  const val: number | undefined = q.dequeue();
  t.equal(val, 1);
  t.equal(q.size, 2);
});

test('Queue<V>: aliases push/pop/add/remove', t => {
  const q = new Queue<string>();

  q.push('a');
  q.add('b');
  q.pushBack('c');

  const v1: string | undefined = q.pop();
  t.equal(v1, 'a');

  const v2: string | undefined = q.remove();
  t.equal(v2, 'b');

  const v3: string | undefined = q.popFront();
  t.equal(v3, 'c');
});

test('Queue<V>: iteration yields V front-to-back', t => {
  const q = new Queue<number>();
  q.enqueue(10);
  q.enqueue(20);
  q.enqueue(30);

  const values: number[] = [];
  for (const v of q) {
    values.push(v);
  }
  t.deepEqual(values, [10, 20, 30]);
});

test('Queue<V>: getReverseIterator yields V back-to-front', t => {
  const q = new Queue<number>();
  q.enqueue(1);
  q.enqueue(2);
  q.enqueue(3);

  const values: number[] = [];
  for (const v of q.getReverseIterator()) {
    values.push(v);
  }
  t.deepEqual(values, [3, 2, 1]);
});

test('Queue<V>: addValues', t => {
  const q = new Queue<number>();
  q.addValues([1, 2, 3]);
  t.equal(q.size, 3);
  t.equal(q.dequeue(), 1);
});

test('Stack<V>: typed push/pop', t => {
  const s = new Stack<number>();
  t.ok(s.isEmpty);

  s.push(1);
  s.push(2);
  s.push(3);

  t.equal(s.size, 3);

  const top: number | undefined = s.top;
  t.equal(top, 3);

  const val: number | undefined = s.pop();
  t.equal(val, 3);
  t.equal(s.size, 2);
});

test('Stack<V>: iteration yields V top-to-bottom', t => {
  const s = new Stack<string>();
  s.push('a');
  s.push('b');
  s.push('c');

  const values: string[] = [];
  for (const v of s) {
    values.push(v);
  }
  t.deepEqual(values, ['c', 'b', 'a']);
});

test('Stack<V>: getReverseIterator yields V bottom-to-top', t => {
  const s = new Stack<number>();
  s.push(1);
  s.push(2);
  s.push(3);

  const values: number[] = [];
  for (const v of s.getReverseIterator()) {
    values.push(v);
  }
  t.deepEqual(values, [1, 2, 3]);
});

test('Stack<V>: pushValues', t => {
  const s = new Stack<number>();
  s.pushValues([1, 2, 3]);
  t.equal(s.size, 3);
  t.equal(s.pop(), 3);
});

test('Stack<V>: peek alias', t => {
  const s = new Stack<string>();
  s.push('hello');

  const val: string | undefined = s.peek();
  t.equal(val, 'hello');
  t.equal(s.size, 1);
});
