import test from 'tape-six';

import Stack from 'list-toolkit/stack.js';
import ValueList from 'list-toolkit/value-list.js';

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

test('Stack: constructor accepts instance or class', t => {
  const fromInstance = new Stack(ValueList.from([1, 2, 3]));
  t.equal(fromInstance.size, 3);
  t.equal(fromInstance.top, 1);

  const fromClass = new Stack(ValueList);
  t.ok(fromClass.isEmpty);
  fromClass.push(42);
  t.equal(fromClass.top, 42);
});

test('Stack: from()', t => {
  const stack = Stack.from([1, 2, 3]);
  t.equal(stack.size, 3);
  t.equal(stack.top, 3);
  t.deepEqual([...stack], [3, 2, 1]);
  t.equal(stack.pop(), 3);
});

test('Stack: add/remove/addValues aliases', t => {
  const stack = new Stack();
  stack.add(1).add(2);
  t.equal(stack.top, 2);
  t.equal(stack.remove(), 2);
  stack.addValues([5, 6]);
  t.equal(stack.top, 6);
  t.deepEqual([...stack], [6, 5, 1]);
});
