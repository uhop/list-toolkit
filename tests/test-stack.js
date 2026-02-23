'use strict';

import test from 'tape-six';

import Stack from 'list-toolkit/stack.js';

test('Stack: basics', t => {
  t.equal(typeof Stack, 'function');

  const stack = new Stack();
  t.ok(stack.isEmpty);
  t.equal(stack.size, 0);
  t.equal(stack.top, undefined);
  t.equal(stack.peek(), undefined);

  stack.push(1);
  t.notOk(stack.isEmpty);
  t.equal(stack.size, 1);
  t.equal(stack.top, 1);
  t.equal(stack.peek(), 1);

  stack.push(2).push(3);
  t.equal(stack.size, 3);
  t.equal(stack.top, 3);
  t.equal(stack.peek(), 3);

  t.equal(stack.pop(), 3);
  t.equal(stack.size, 2);
  t.equal(stack.top, 2);

  t.equal(stack.pop(), 2);
  t.equal(stack.pop(), 1);
  t.ok(stack.isEmpty);
  t.equal(stack.size, 0);
  t.equal(stack.pop(), undefined);
});

test('Stack: pushFront alias', t => {
  const stack = new Stack();
  stack.pushFront(10);
  stack.pushFront(20);
  t.equal(stack.size, 2);
  t.equal(stack.top, 20);
});

test('Stack: pushValues', t => {
  const stack = new Stack();
  stack.pushValues([1, 2, 3]);
  t.equal(stack.size, 3);
  t.equal(stack.top, 3);
  t.deepEqual([...stack], [3, 2, 1]);
});

test('Stack: clear', t => {
  const stack = new Stack();
  stack.push(1).push(2).push(3);
  t.equal(stack.size, 3);

  stack.clear();
  t.ok(stack.isEmpty);
  t.equal(stack.size, 0);
  t.equal(stack.top, undefined);
  t.deepEqual([...stack], []);
});

test('Stack: iterator', t => {
  const stack = new Stack();
  stack.push(1).push(2).push(3);
  t.deepEqual([...stack], [3, 2, 1]);
});

test('Stack: getReverseIterator', t => {
  const stack = new Stack();
  stack.push(1).push(2).push(3);
  const rev = stack.getReverseIterator();
  t.ok(!!rev);
  t.deepEqual([...rev], [1, 2, 3]);
});
