import test from 'tape-six';
import UnrolledList from 'list-toolkit/unrolled-list.js';

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

const chunkInvariants = list => {
  let total = 0,
    chunk = list.head,
    prev = null;
  while (chunk) {
    if (chunk.prev !== prev) return false;
    if (chunk.count < 1 || chunk.start < 0 || chunk.start + chunk.count > list.chunkSize) return false;
    total += chunk.count;
    prev = chunk;
    chunk = chunk.next;
  }
  if (list.tail !== prev) return false;
  return total === list.size;
};

test('UnrolledList - basics', t => {
  const list = new UnrolledList({chunkSize: 4});
  t.ok(list.isEmpty);
  t.equal(list.size, 0);
  t.equal(list.front, undefined);
  t.equal(list.back, undefined);
  t.equal(list.popFront(), undefined);
  t.equal(list.popBack(), undefined);

  list.pushBack(2).pushBack(3).pushFront(1);
  t.equal(list.size, 3);
  t.equal(list.front, 1);
  t.equal(list.back, 3);
  t.equal(list.peekFront(), 1);
  t.equal(list.peekBack(), 3);
  t.deepEqual(Array.from(list), [1, 2, 3]);
  t.ok(chunkInvariants(list));

  t.equal(list.popFront(), 1);
  t.equal(list.popBack(), 3);
  t.deepEqual(Array.from(list), [2]);
  t.ok(chunkInvariants(list));
});

test('UnrolledList - chunk boundaries', t => {
  const list = new UnrolledList({chunkSize: 4});
  for (let i = 0; i < 10; ++i) list.pushBack(i);
  t.equal(list.size, 10);
  t.deepEqual(
    Array.from(list),
    Array.from({length: 10}, (_, i) => i)
  );
  t.ok(chunkInvariants(list));

  for (let i = -1; i > -11; --i) list.pushFront(i);
  t.equal(list.size, 20);
  t.equal(list.front, -10);
  t.equal(list.back, 9);
  t.ok(chunkInvariants(list));

  const drained = [];
  while (!list.isEmpty) drained.push(list.popFront());
  t.deepEqual(
    drained,
    Array.from({length: 20}, (_, i) => i - 10)
  );
});

test('UnrolledList - aliases and at()', t => {
  const list = new UnrolledList({chunkSize: 3});
  list.push(2).unshift(1).add(3).addFront(0).addBack(4);
  t.deepEqual(Array.from(list), [0, 1, 2, 3, 4]);
  t.equal(list.at(0), 0);
  t.equal(list.at(4), 4);
  t.equal(list.at(2), 2);
  t.equal(list.at(-1), 4);
  t.equal(list.at(-5), 0);
  t.equal(list.at(5), undefined);
  t.equal(list.at(-6), undefined);
  t.equal(list.shift(), 0);
  t.equal(list.pop(), 4);
  t.equal(list.removeFront(), 1);
  t.equal(list.removeBack(), 3);
  t.equal(list.size, 1);
});

test('UnrolledList - iterators across chunks', t => {
  const list = new UnrolledList({chunkSize: 3});
  list.pushValuesBack([1, 2, 3, 4, 5, 6, 7]);
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5, 6, 7]);
  t.deepEqual(Array.from(list.getReverseIterator()), [7, 6, 5, 4, 3, 2, 1]);

  list.pushValuesFront([0, -1]);
  t.deepEqual(Array.from(list), [-1, 0, 1, 2, 3, 4, 5, 6, 7]);
  t.ok(chunkInvariants(list));
});

test('UnrolledList - popped slots release references', t => {
  const list = new UnrolledList({chunkSize: 4}),
    a = {id: 1},
    b = {id: 2};
  list.pushBack(a).pushBack(b);
  const chunk = list.head;
  list.popFront();
  list.popBack();
  t.ok(chunk.values.every(slot => slot === undefined));
  t.ok(list.isEmpty);
  t.equal(list.head, null);
  t.equal(list.tail, null);
});

test('UnrolledList - clear and reuse', t => {
  const list = UnrolledList.from([1, 2, 3], {chunkSize: 2});
  list.clear();
  t.ok(list.isEmpty);
  t.equal(list.size, 0);
  t.deepEqual(Array.from(list), []);
  list.pushBack(9).pushFront(8);
  t.deepEqual(Array.from(list), [8, 9]);
  t.ok(chunkInvariants(list));
});

test('UnrolledList - deterministic stress vs reference', t => {
  const random = makeLcg(),
    list = new UnrolledList({chunkSize: 8}),
    reference = [];
  for (let step = 0; step < 5000; ++step) {
    const op = random();
    if (op < 0.35) {
      const value = Math.floor(random() * 1000);
      list.pushBack(value);
      reference.push(value);
    } else if (op < 0.6) {
      const value = Math.floor(random() * 1000);
      list.pushFront(value);
      reference.unshift(value);
    } else if (op < 0.8) {
      t.equal(list.popFront(), reference.shift());
    } else {
      t.equal(list.popBack(), reference.pop());
    }
  }
  t.equal(list.size, reference.length);
  t.ok(chunkInvariants(list));
  t.deepEqual(Array.from(list), reference);
  if (reference.length) {
    const mid = reference.length >> 1;
    t.equal(list.at(mid), reference[mid]);
  }
});
