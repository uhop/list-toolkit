'use strict';

import test from 'tape-six';

import Queue from 'list-toolkit/queue.js';

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
