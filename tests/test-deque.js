import test from 'tape-six';
import Deque from 'list-toolkit/deque.js';
import ValueList from 'list-toolkit/value-list.js';

test('Deque - basics', t => {
  const deque = new Deque();
  t.ok(deque.isEmpty);
  t.equal(deque.size, 0);
  t.equal(deque.front, undefined);
  t.equal(deque.back, undefined);
  t.equal(deque.popFront(), undefined);
  t.equal(deque.popBack(), undefined);

  deque.pushBack(2).pushBack(3).pushFront(1);
  t.notOk(deque.isEmpty);
  t.equal(deque.size, 3);
  t.equal(deque.front, 1);
  t.equal(deque.back, 3);
  t.equal(deque.peekFront(), 1);
  t.equal(deque.peekBack(), 3);
  t.deepEqual(Array.from(deque), [1, 2, 3]);

  t.equal(deque.popFront(), 1);
  t.equal(deque.popBack(), 3);
  t.equal(deque.size, 1);
  t.deepEqual(Array.from(deque), [2]);
});

test('Deque - aliases', t => {
  const deque = new Deque();
  deque.push(2).unshift(1).add(3).addFront(0).addBack(4);
  t.deepEqual(Array.from(deque), [0, 1, 2, 3, 4]);
  t.equal(deque.shift(), 0);
  t.equal(deque.pop(), 4);
  t.equal(deque.removeFront(), 1);
  t.equal(deque.removeBack(), 3);
  t.equal(deque.size, 1);
});

test('Deque - bulk pushes', t => {
  const deque = new Deque();
  deque.pushValuesBack([3, 4, 5]);
  deque.pushValuesFront([2, 1]);
  t.deepEqual(Array.from(deque), [1, 2, 3, 4, 5]);
  t.equal(deque.size, 5);
});

test('Deque - rotate', t => {
  const deque = new Deque();
  deque.pushValuesBack([1, 2, 3, 4, 5]);

  deque.rotate();
  t.deepEqual(Array.from(deque), [5, 1, 2, 3, 4]);

  deque.rotate(-1);
  t.deepEqual(Array.from(deque), [1, 2, 3, 4, 5]);

  deque.rotate(2);
  t.deepEqual(Array.from(deque), [4, 5, 1, 2, 3]);

  deque.rotate(-2);
  t.deepEqual(Array.from(deque), [1, 2, 3, 4, 5]);

  deque.rotate(4);
  t.deepEqual(Array.from(deque), [2, 3, 4, 5, 1]);

  deque.rotate(-4);
  t.deepEqual(Array.from(deque), [1, 2, 3, 4, 5]);

  deque.rotate(5);
  t.deepEqual(Array.from(deque), [1, 2, 3, 4, 5]);

  deque.rotate(7);
  t.deepEqual(Array.from(deque), [4, 5, 1, 2, 3]);

  deque.rotate(0);
  t.deepEqual(Array.from(deque), [4, 5, 1, 2, 3]);
  t.equal(deque.size, 5);

  const small = new Deque();
  small.rotate(3);
  t.ok(small.isEmpty);
  small.pushBack(1).rotate(2);
  t.deepEqual(Array.from(small), [1]);
});

test('Deque - iterators', t => {
  const deque = new Deque();
  deque.pushValuesBack([1, 2, 3]);
  t.deepEqual(Array.from(deque), [1, 2, 3]);
  t.deepEqual(Array.from(deque.getReverseIterator()), [3, 2, 1]);
});

test('Deque - constructor accepts an instance or a class', t => {
  const prefilled = ValueList.from([1, 2, 3]),
    deque = new Deque(prefilled);
  t.equal(deque.size, 3);
  t.equal(deque.list, prefilled);
  t.deepEqual(Array.from(deque), [1, 2, 3]);

  const fromClass = new Deque(ValueList);
  t.ok(fromClass.isEmpty);
  t.ok(fromClass.list instanceof ValueList);
});

test('Deque - clear and reuse', t => {
  const deque = new Deque();
  deque.pushValuesBack([1, 2, 3]);
  deque.clear();
  t.ok(deque.isEmpty);
  t.equal(deque.size, 0);
  deque.pushFront(9);
  t.deepEqual(Array.from(deque), [9]);
});

test('Deque - sliding window', t => {
  const deque = new Deque(),
    windowSize = 3,
    seen = [];
  for (const value of [1, 2, 3, 4, 5, 6]) {
    deque.pushBack(value);
    if (deque.size > windowSize) deque.popFront();
    seen.push(Array.from(deque));
  }
  t.deepEqual(seen, [[1], [1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]]);
});

test('Deque - from()', t => {
  const deque = Deque.from([1, 2, 3]);
  t.equal(deque.size, 3);
  t.deepEqual([...deque], [1, 2, 3]);
  t.equal(deque.front, 1);
  t.equal(deque.back, 3);

  const onInstance = Deque.from([4, 5], ValueList.from([1]));
  t.deepEqual([...onInstance], [1, 4, 5]);
});
