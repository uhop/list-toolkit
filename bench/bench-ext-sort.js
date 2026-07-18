import List from '../src/list.js';
import SList from '../src/slist.js';
import ExtList from '../src/ext-list.js';
import ExtSList from '../src/ext-slist.js';

// the pre-2026-07-18 recursive ext sorts, for comparison

const oldSortExtList = (list, lessFn) => {
  if (list.isOneOrEmpty) return list;

  const left = list.make(),
    right = list.make();

  let isLeft = true;
  for (const current of list.getNodeIterator()) {
    current[list.nextName] = current[list.prevName] = current;
    if (isLeft) {
      left.addNodeAfter(current);
      left.next();
    } else {
      right.addNodeAfter(current);
      right.next();
    }
    isLeft = !isLeft;
  }
  list.clear();

  oldSortExtList(left.next(), lessFn);
  oldSortExtList(right.next(), lessFn);

  while (!left.isEmpty && !right.isEmpty) {
    list.addNodeAfter((lessFn(left.head, right.head) ? left : right).removeCurrent());
    list.next();
  }
  if (!left.isEmpty) {
    const last = left.head[left.prevName];
    list.insertAfter(left);
    list.head = last;
  }
  if (!right.isEmpty) {
    const last = right.head[right.prevName];
    list.insertAfter(right);
    list.head = last;
  }

  return list.next();
};

const oldSortExtSList = (list, lessFn) => {
  if (list.isOneOrEmpty) return list;

  const leftHead = {},
    rightHead = {};
  leftHead[list.nextName] = leftHead;
  rightHead[list.nextName] = rightHead;

  const left = list.make(leftHead),
    right = list.make(rightHead);

  let isLeft = true;
  for (const current of list.getNodeIterator()) {
    current[list.nextName] = current;
    if (isLeft) {
      left.addNodeAfter(current);
      left.next();
    } else {
      right.addNodeAfter(current);
      right.next();
    }
    isLeft = !isLeft;
  }
  left.removeNodeAfter();
  right.removeNodeAfter();
  list.clear();

  oldSortExtSList(left.next(), lessFn);
  oldSortExtSList(right.next(), lessFn);

  const leftIterator = left.getNodeIterator()[Symbol.iterator](),
    rightIterator = right.getNodeIterator()[Symbol.iterator]();
  let leftItem = leftIterator.next(),
    rightItem = rightIterator.next();
  while (!leftItem.done && !rightItem.done) {
    let node;
    if (lessFn(leftItem.value, rightItem.value)) {
      node = leftItem.value;
      leftItem = leftIterator.next();
    } else {
      node = rightItem.value;
      rightItem = rightIterator.next();
    }
    node[list.nextName] = node;
    list.addNodeAfter(node);
    list.next();
  }
  for (; !leftItem.done; list.next(), leftItem = leftIterator.next()) {
    const node = leftItem.value;
    node[list.nextName] = node;
    list.addNodeAfter(node);
  }
  for (; !rightItem.done; list.next(), rightItem = rightIterator.next()) {
    const node = rightItem.value;
    node[list.nextName] = node;
    list.addNodeAfter(node);
  }

  return list.next();
};

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

const SIZE = 10_000,
  random = makeLcg(),
  randomValues = Array.from({length: SIZE}, () => Math.floor(random() * 1_000_000)),
  sortedValues = randomValues.slice().sort((a, b) => a - b);

const makeExtList = values => new ExtList(List.from(values.map(p => ({p}))).releaseRawList()),
  makeExtSList = values => new ExtSList(SList.from(values.map(p => ({p}))).releaseRawList()),
  less = (a, b) => a.p < b.p;

const bench = (make, values, sortFn) => n => {
  let list;
  for (let i = 0; i < n; ++i) {
    list = make(values);
    sortFn(list);
  }
  return list;
};

export default {
  'DLL random: new delegated': bench(makeExtList, randomValues, list => list.sort(less)),
  'DLL random: old recursive': bench(makeExtList, randomValues, list => oldSortExtList(list, less)),
  'DLL sorted: new delegated': bench(makeExtList, sortedValues, list => list.sort(less)),
  'DLL sorted: old recursive': bench(makeExtList, sortedValues, list => oldSortExtList(list, less)),
  'SLL random: new delegated': bench(makeExtSList, randomValues, list => list.sort(less)),
  'SLL random: old recursive': bench(makeExtSList, randomValues, list => oldSortExtSList(list, less)),
  'SLL sorted: new delegated': bench(makeExtSList, sortedValues, list => list.sort(less)),
  'SLL sorted: old recursive': bench(makeExtSList, sortedValues, list => oldSortExtSList(list, less))
};
