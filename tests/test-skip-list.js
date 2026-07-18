import test from 'tape-six';
import SkipList, {SkipListNode} from 'list-toolkit/skip-list.js';

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

test('SkipList - basics', t => {
  const list = new SkipList();
  t.ok(list.isEmpty);
  t.equal(list.size, 0);
  t.equal(list.length, 0);
  t.equal(list.getMin(), null);
  t.equal(list.getMax(), null);
  t.equal(list.find(1), null);
  t.notOk(list.has(1));

  list.insert(5).insert(3).insert(7).insert(1).insert(4);
  t.notOk(list.isEmpty);
  t.equal(list.size, 5);
  t.deepEqual(Array.from(list), [1, 3, 4, 5, 7]);
  t.equal(list.getMin().value, 1);
  t.equal(list.getMax().value, 7);
  t.ok(list.find(3) instanceof SkipListNode);
  t.equal(list.find(3).value, 3);
  t.equal(list.find(6), null);
  t.ok(list.has(7));
  t.notOk(list.has(6));
});

test('SkipList - duplicates are ignored', t => {
  const list = SkipList.from([3, 1, 2]);
  list.insert(2).insert(1).insert(3);
  t.equal(list.size, 3);
  t.deepEqual(Array.from(list), [1, 2, 3]);
});

test('SkipList - remove', t => {
  const list = SkipList.from([5, 3, 7, 1, 4]);
  list.remove(3);
  t.equal(list.size, 4);
  t.deepEqual(Array.from(list), [1, 4, 5, 7]);
  list.remove(6);
  t.equal(list.size, 4);
  list.remove(1).remove(7);
  t.deepEqual(Array.from(list), [4, 5]);
  t.equal(list.getMin().value, 4);
  t.equal(list.getMax().value, 5);
  list.remove(4).remove(5);
  t.ok(list.isEmpty);
  t.equal(list.getMin(), null);
  t.equal(list.getMax(), null);
  t.equal(list.last, null);
});

test('SkipList - floor and ceil', t => {
  const list = SkipList.from([1, 3, 5, 7]);
  t.equal(list.floor(4).value, 3);
  t.equal(list.floor(5).value, 5);
  t.equal(list.floor(9).value, 7);
  t.equal(list.floor(0), null);
  t.equal(list.ceil(4).value, 5);
  t.equal(list.ceil(5).value, 5);
  t.equal(list.ceil(0).value, 1);
  t.equal(list.ceil(9), null);
});

test('SkipList - popFront', t => {
  const list = SkipList.from([3, 1, 2]);
  t.equal(list.popFront(), 1);
  t.equal(list.popFront(), 2);
  t.equal(list.popFront(), 3);
  t.equal(list.popFront(), undefined);
  t.ok(list.isEmpty);
  t.equal(list.last, null);
});

test('SkipList - iterators', t => {
  const list = SkipList.from([5, 3, 7, 1, 4]);
  t.deepEqual(Array.from(list), [1, 3, 4, 5, 7]);
  t.deepEqual(Array.from(list.getReverseIterator()), [7, 5, 4, 3, 1]);
  t.deepEqual(Array.from(list.getIterator()), [1, 3, 4, 5, 7]);
  t.deepEqual(Array.from(list.getIterator({from: 3, to: 5})), [3, 4, 5]);
  t.deepEqual(Array.from(list.getIterator({from: 2, to: 6})), [3, 4, 5]);
  t.deepEqual(Array.from(list.getIterator({from: 6})), [7]);
  t.deepEqual(Array.from(list.getIterator({to: 3})), [1, 3]);
  t.deepEqual(Array.from(list.getIterator({from: 8})), []);
  t.deepEqual(
    Array.from(list.getNodeIterator({from: 3, to: 5})).map(node => node.value),
    [3, 4, 5]
  );
  t.ok(Array.from(list.getNodeIterator()).every(node => node instanceof SkipListNode));
});

test('SkipList - custom order', t => {
  const maxFirst = SkipList.from([1, 5, 3], {less: (a, b) => a > b});
  t.deepEqual(Array.from(maxFirst), [5, 3, 1]);
  t.equal(maxFirst.getMin().value, 5);

  const byCompare = SkipList.from(['bb', 'a', 'ccc'], {compare: (a, b) => a.length - b.length});
  t.deepEqual(Array.from(byCompare), ['a', 'bb', 'ccc']);
  t.ok(byCompare.has('bb'));
  t.equal(byCompare.floor('dd').value, 'bb');
});

test('SkipList - clear and reuse', t => {
  const list = SkipList.from([1, 2, 3]);
  list.clear();
  t.ok(list.isEmpty);
  t.equal(list.size, 0);
  t.deepEqual(Array.from(list), []);
  list.insert(9).insert(8);
  t.deepEqual(Array.from(list), [8, 9]);
});

test('SkipList - deterministic stress', t => {
  const random = makeLcg(),
    list = new SkipList({random}),
    values = [];
  for (let i = 0; i < 1000; ++i) values.push(i);
  for (let i = values.length - 1; i > 0; --i) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  for (const value of values) list.insert(value);
  t.equal(list.size, 1000);
  t.deepEqual(
    Array.from(list),
    Array.from({length: 1000}, (_, i) => i)
  );
  t.ok(list.head.next.length <= list.maxLevel);

  for (let i = 0; i < 1000; i += 2) list.remove(i);
  t.equal(list.size, 500);
  t.deepEqual(
    Array.from(list),
    Array.from({length: 500}, (_, i) => 2 * i + 1)
  );
  t.deepEqual(
    Array.from(list.getReverseIterator()),
    Array.from({length: 500}, (_, i) => 999 - 2 * i)
  );
  t.equal(list.floor(500).value, 499);
  t.equal(list.ceil(500).value, 501);
});

test('SkipList - degenerate single-level list stays correct', t => {
  const list = SkipList.from([4, 2, 5, 1, 3], {random: () => 0.99});
  t.deepEqual(Array.from(list), [1, 2, 3, 4, 5]);
  t.equal(list.head.next.length, 1);
  list.remove(3);
  t.deepEqual(Array.from(list), [1, 2, 4, 5]);
});
