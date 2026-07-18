import test from 'tape-six';
import RingBuffer from 'list-toolkit/ring-buffer.js';

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

test('RingBuffer - basics', t => {
  const ring = new RingBuffer();
  t.ok(ring.isEmpty);
  t.notOk(ring.isFull);
  t.equal(ring.size, 0);
  t.equal(ring.front, undefined);
  t.equal(ring.back, undefined);
  t.equal(ring.popFront(), undefined);
  t.equal(ring.popBack(), undefined);

  ring.pushBack(2).pushBack(3).pushFront(1);
  t.equal(ring.size, 3);
  t.equal(ring.front, 1);
  t.equal(ring.back, 3);
  t.equal(ring.peekFront(), 1);
  t.equal(ring.peekBack(), 3);
  t.deepEqual(Array.from(ring), [1, 2, 3]);

  t.equal(ring.popFront(), 1);
  t.equal(ring.popBack(), 3);
  t.deepEqual(Array.from(ring), [2]);
});

test('RingBuffer - aliases and at()', t => {
  const ring = new RingBuffer();
  ring.push(2).unshift(1).add(3).addFront(0).addBack(4);
  t.deepEqual(Array.from(ring), [0, 1, 2, 3, 4]);
  t.equal(ring.at(0), 0);
  t.equal(ring.at(4), 4);
  t.equal(ring.at(-1), 4);
  t.equal(ring.at(-5), 0);
  t.equal(ring.at(5), undefined);
  t.equal(ring.at(-6), undefined);
  t.equal(ring.shift(), 0);
  t.equal(ring.pop(), 4);
  t.equal(ring.removeFront(), 1);
  t.equal(ring.removeBack(), 3);
  t.equal(ring.size, 1);
});

test('RingBuffer - growth preserves order across wraps', t => {
  const ring = new RingBuffer({initialCapacity: 4});
  for (let i = 0; i < 3; ++i) {
    ring.pushBack(i);
    ring.popFront();
  }
  for (let i = 0; i < 40; ++i) ring.pushBack(i);
  t.equal(ring.size, 40);
  t.deepEqual(
    Array.from(ring),
    Array.from({length: 40}, (_, i) => i)
  );
  t.deepEqual(
    Array.from(ring.getReverseIterator()),
    Array.from({length: 40}, (_, i) => 39 - i)
  );
});

test('RingBuffer - bounded eviction (keep last N)', t => {
  const ring = new RingBuffer({capacity: 3});
  for (let i = 1; i <= 5; ++i) ring.pushBack(i);
  t.ok(ring.isFull);
  t.equal(ring.size, 3);
  t.deepEqual(Array.from(ring), [3, 4, 5]);

  ring.pushFront(0);
  t.deepEqual(Array.from(ring), [0, 3, 4]);
  t.equal(ring.size, 3);
});

test('RingBuffer - rotate', t => {
  const ring = RingBuffer.from([1, 2, 3, 4, 5]);
  ring.rotate();
  t.deepEqual(Array.from(ring), [5, 1, 2, 3, 4]);
  ring.rotate(-1);
  t.deepEqual(Array.from(ring), [1, 2, 3, 4, 5]);
  ring.rotate(2);
  t.deepEqual(Array.from(ring), [4, 5, 1, 2, 3]);
  ring.rotate(-2);
  t.deepEqual(Array.from(ring), [1, 2, 3, 4, 5]);
  ring.rotate(7);
  t.deepEqual(Array.from(ring), [4, 5, 1, 2, 3]);
  ring.rotate(0);
  t.deepEqual(Array.from(ring), [4, 5, 1, 2, 3]);

  const full = RingBuffer.from([1, 2, 3, 4], {initialCapacity: 4});
  t.equal(full.array.length, 4);
  full.rotate(1);
  t.deepEqual(Array.from(full), [4, 1, 2, 3]);
  full.rotate(-1);
  t.deepEqual(Array.from(full), [1, 2, 3, 4]);

  const small = new RingBuffer();
  small.rotate(3);
  t.ok(small.isEmpty);
  small.pushBack(1).rotate(2);
  t.deepEqual(Array.from(small), [1]);
});

test('RingBuffer - popped slots release references', t => {
  const ring = new RingBuffer({initialCapacity: 4});
  const a = {id: 1},
    b = {id: 2};
  ring.pushBack(a).pushBack(b);
  ring.popFront();
  ring.popBack();
  t.ok(ring.array.every(slot => slot === undefined));
  ring.pushBack(a);
  ring.clear();
  t.ok(ring.array.every(slot => slot === undefined));
});

test('RingBuffer - bulk pushes and clear reuse', t => {
  const ring = new RingBuffer();
  ring.pushValuesBack([3, 4, 5]);
  ring.pushValuesFront([2, 1]);
  t.deepEqual(Array.from(ring), [1, 2, 3, 4, 5]);
  ring.clear();
  t.ok(ring.isEmpty);
  ring.pushBack(9);
  t.deepEqual(Array.from(ring), [9]);
});

test('RingBuffer - deterministic stress vs reference', t => {
  const random = makeLcg(),
    ring = new RingBuffer({initialCapacity: 4}),
    reference = [];
  for (let step = 0; step < 5000; ++step) {
    const op = random();
    if (op < 0.35) {
      const value = Math.floor(random() * 1000);
      ring.pushBack(value);
      reference.push(value);
    } else if (op < 0.6) {
      const value = Math.floor(random() * 1000);
      ring.pushFront(value);
      reference.unshift(value);
    } else if (op < 0.8) {
      t.equal(ring.popFront(), reference.shift());
    } else {
      t.equal(ring.popBack(), reference.pop());
    }
  }
  t.equal(ring.size, reference.length);
  t.deepEqual(Array.from(ring), reference);
});
