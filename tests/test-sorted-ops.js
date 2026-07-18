import test from 'tape-six';
import List from 'list-toolkit/list.js';
import SList from 'list-toolkit/slist.js';
import ValueList from 'list-toolkit/value-list.js';
import ValueSList from 'list-toolkit/value-slist.js';
import ExtList from 'list-toolkit/ext-list.js';
import ExtSList from 'list-toolkit/ext-slist.js';

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

const lessNode = (a, b) => a.k < b.k;
const lessValue = (a, b) => a.value < b.value;

test('insertSorted - List and SList', t => {
  for (const Ctor of [List, SList]) {
    const list = new Ctor();
    list.insertSorted({k: 5}, lessNode);
    list.insertSorted({k: 1}, lessNode);
    list.insertSorted({k: 3}, lessNode);
    list.insertSorted({k: 9}, lessNode);
    list.insertSorted({k: 3, tag: 'second'}, lessNode);
    t.deepEqual(
      Array.from(list).map(node => node.k),
      [1, 3, 3, 5, 9],
      Ctor.name
    );
    const threes = Array.from(list).filter(node => node.k === 3);
    t.equal(threes[1].tag, 'second', `${Ctor.name}: equal values insert after existing`);
    t.equal(list.back.k, 9, `${Ctor.name}: back is maintained`);
  }
});

test('insertSorted - value lists return usable pointers', t => {
  for (const Ctor of [ValueList, ValueSList]) {
    const list = new Ctor();
    list.insertSorted(2, lessValue);
    list.insertSorted(4, lessValue);
    const ptr = list.insertSorted(3, lessValue);
    t.equal(ptr.node.value, 3, Ctor.name);
    t.deepEqual(Array.from(list), [2, 3, 4], Ctor.name);
    list.pushBack(5);
    t.deepEqual(Array.from(list), [2, 3, 4, 5], `${Ctor.name}: list intact after insertSorted`);
  }
});

test('mergeSorted - basics and stability', t => {
  for (const Ctor of [List, SList]) {
    const a = Ctor.from([
        {k: 1, src: 'a'},
        {k: 3, src: 'a'},
        {k: 5, src: 'a'}
      ]),
      b = Ctor.from([
        {k: 2, src: 'b'},
        {k: 3, src: 'b'},
        {k: 6, src: 'b'}
      ]);
    a.mergeSorted(b, lessNode);
    t.ok(b.isEmpty, `${Ctor.name}: argument drained`);
    t.deepEqual(
      Array.from(a).map(node => node.k),
      [1, 2, 3, 3, 5, 6],
      Ctor.name
    );
    const threes = Array.from(a).filter(node => node.k === 3);
    t.deepEqual(
      threes.map(node => node.src),
      ['a', 'b'],
      `${Ctor.name}: stable — this before argument on ties`
    );
    a.pushBack({k: 10});
    t.equal(a.back.k, 10, `${Ctor.name}: back is maintained after merge`);
  }
});

test('mergeSorted - empty cases and compatibility', t => {
  const empty = new ValueList(),
    full = ValueList.from([1, 2, 3]);
  empty.mergeSorted(full, lessValue);
  t.deepEqual(Array.from(empty), [1, 2, 3]);
  t.ok(full.isEmpty);

  empty.mergeSorted(new ValueList(), lessValue);
  t.deepEqual(Array.from(empty), [1, 2, 3]);

  const incompatible = new ValueList({nextName: 'n2', prevName: 'p2'});
  t.throws(() => empty.mergeSorted(incompatible, lessValue));
});

test('mergeSorted - all elements before or after', t => {
  const low = ValueSList.from([1, 2, 3]),
    high = ValueSList.from([4, 5, 6]);
  low.mergeSorted(high, lessValue);
  t.deepEqual(Array.from(low), [1, 2, 3, 4, 5, 6]);
  low.pushBack(7);
  t.deepEqual(Array.from(low), [1, 2, 3, 4, 5, 6, 7]);

  const high2 = ValueSList.from([8, 9]),
    low2 = ValueSList.from([0, 1]);
  high2.mergeSorted(low2, lessValue);
  t.deepEqual(Array.from(high2), [0, 1, 8, 9]);
});

test('sort - correctness across shapes', t => {
  const random = makeLcg();
  for (const Ctor of [ValueList, ValueSList]) {
    const data = Array.from({length: 500}, () => Math.floor(random() * 100)),
      expected = data.slice().sort((a, b) => a - b);

    t.deepEqual(Array.from(Ctor.from(data).sort(lessValue)), expected, `${Ctor.name}: random with duplicates`);
    t.deepEqual(Array.from(Ctor.from(expected).sort(lessValue)), expected, `${Ctor.name}: already sorted`);
    t.deepEqual(Array.from(Ctor.from(expected.slice().reverse()).sort(lessValue)), expected, `${Ctor.name}: reverse sorted`);
    t.deepEqual(Array.from(Ctor.from([7, 7, 7, 7]).sort(lessValue)), [7, 7, 7, 7], `${Ctor.name}: all equal`);
    t.deepEqual(Array.from(Ctor.from([1]).sort(lessValue)), [1], `${Ctor.name}: single`);
    t.deepEqual(Array.from(new Ctor().sort(lessValue)), [], `${Ctor.name}: empty`);

    const sorted = Ctor.from(data).sort(lessValue);
    sorted.pushBack(1000);
    t.equal(sorted.back.value, 1000, `${Ctor.name}: back is maintained after sort`);
  }
});

test('sort - ext lists parity and stability', t => {
  const random = makeLcg(11);
  {
    const items = Array.from({length: 100}, (_, i) => ({k: Math.floor(random() * 10), i})),
      ext = new ExtList(List.from(items).releaseRawList());
    ext.sort(lessNode);
    const result = Array.from(ext.getNodeIterator());
    t.equal(result.length, 100, 'ExtList: all nodes present');
    t.equal(ext.head, result[0], 'ExtList: head is the sorted first node');
    let stable = true;
    for (let i = 1; i < result.length; ++i) {
      const prev = result[i - 1],
        curr = result[i];
      if (prev.k > curr.k || (prev.k === curr.k && prev.i > curr.i)) {
        stable = false;
        break;
      }
    }
    t.ok(stable, 'ExtList: sorted and stable');
  }
  {
    const items = Array.from({length: 100}, (_, i) => ({k: Math.floor(random() * 10), i})),
      ext = new ExtSList(SList.from(items).releaseRawList());
    ext.sort(lessNode);
    const result = Array.from(ext.getNodeIterator());
    t.equal(result.length, 100, 'ExtSList: all nodes present');
    t.equal(ext.head, result[0], 'ExtSList: head is the sorted first node');
    let stable = true;
    for (let i = 1; i < result.length; ++i) {
      const prev = result[i - 1],
        curr = result[i];
      if (prev.k > curr.k || (prev.k === curr.k && prev.i > curr.i)) {
        stable = false;
        break;
      }
    }
    t.ok(stable, 'ExtSList: sorted and stable');
  }
});

test('sort - stability', t => {
  const random = makeLcg(7);
  for (const Ctor of [List, SList]) {
    const items = Array.from({length: 200}, (_, i) => ({k: Math.floor(random() * 10), i})),
      list = Ctor.from(items.map(item => ({...item})));
    list.sort(lessNode);
    const result = Array.from(list);
    for (let i = 1; i < result.length; ++i) {
      const prev = result[i - 1],
        curr = result[i];
      if (prev.k > curr.k || (prev.k === curr.k && prev.i > curr.i)) {
        t.fail(`${Ctor.name}: not stable at position ${i}`);
        break;
      }
    }
    t.equal(result.length, 200, `${Ctor.name}: all nodes present and stable`);
  }
});
