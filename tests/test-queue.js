import test from 'tape-six';

import Queue from 'list-toolkit/queue.js';
import ValueList from 'list-toolkit/value-list.js';

test('Queue', t => {
  t.equal(typeof Queue, 'function');

  const queue = new Queue();
  t.ok(queue.isEmpty);
  t.equal(queue.size, 0);
  t.equal(queue.top, undefined);
  t.equal(queue.peek(), undefined);

  queue.enqueue(3).enqueue(2).enqueue(5).enqueue(1).enqueue(4);
  t.notOk(queue.isEmpty);
  t.equal(queue.size, 5);
  t.equal(queue.top, 3);
  t.equal(queue.peek(), 3);

  t.equal(queue.dequeue(), 3);
  t.equal(queue.size, 4);
  t.equal(queue.top, 2);
  t.equal(queue.peek(), 2);

  queue.addValues([7, 6]);
  t.equal(queue.size, 6);
  t.deepEqual([...queue], [2, 5, 1, 4, 7, 6]);

  queue.clear();
  t.ok(queue.isEmpty);
  t.equal(queue.size, 0);
  t.equal(queue.top, undefined);
  t.equal(queue.peek(), undefined);
});

test('Queue: constructor accepts instance or class', t => {
  const fromInstance = new Queue(ValueList.from([1, 2, 3]));
  t.equal(fromInstance.size, 3);
  t.equal(fromInstance.top, 1);

  const fromClass = new Queue(ValueList);
  t.ok(fromClass.isEmpty);
  fromClass.add(42);
  t.equal(fromClass.top, 42);
});

test('Queue: from()', t => {
  const queue = Queue.from([1, 2, 3]);
  t.equal(queue.size, 3);
  t.deepEqual([...queue], [1, 2, 3]);
  t.equal(queue.remove(), 1);

  const onClass = Queue.from([4, 5], ValueList);
  t.deepEqual([...onClass], [4, 5]);
});

test('Queue: front and pushValues aliases', t => {
  const queue = Queue.from([1, 2]);
  t.equal(queue.front, 1);
  t.equal(queue.front, queue.top);
  queue.pushValues([3, 4]);
  t.deepEqual([...queue], [1, 2, 3, 4]);
  queue.clear();
  t.equal(queue.front, undefined);
});
