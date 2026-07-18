import ValueList from '../src/value-list.js';

// the pre-2026-07-17 recursive alternating-split merge sort, for comparison
const oldSort = (list, lessFn) => {
  if (list.isOneOrEmpty) return list;

  const left = list.make(),
    right = list.make();

  for (let isLeft = true; !list.isEmpty; isLeft = !isLeft) {
    (isLeft ? left : right).pushBackNode(list.popFrontNode());
  }

  oldSort(left, lessFn);
  oldSort(right, lessFn);

  while (!left.isEmpty && !right.isEmpty) {
    list.pushBackNode((lessFn(left.front, right.front) ? left : right).popFrontNode());
  }
  if (!left.isEmpty) list.appendBack(left);
  if (!right.isEmpty) list.appendBack(right);

  return list;
};

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

const SIZE = 10_000,
  random = makeLcg(),
  randomData = Array.from({length: SIZE}, () => Math.floor(random() * 1_000_000)),
  sortedData = randomData.slice().sort((a, b) => a - b),
  reverseData = sortedData.slice().reverse(),
  nearlySorted = sortedData.slice();
for (let i = 0; i < 100; ++i) {
  const a = Math.floor(random() * SIZE),
    b = Math.floor(random() * SIZE);
  [nearlySorted[a], nearlySorted[b]] = [nearlySorted[b], nearlySorted[a]];
}

const less = (a, b) => a.value < b.value;

const bench = (data, sortFn) => n => {
  let list;
  for (let i = 0; i < n; ++i) {
    list = ValueList.from(data);
    sortFn(list);
  }
  return list;
};

export default {
  'random: natural': bench(randomData, list => list.sort(less)),
  'random: old recursive': bench(randomData, list => oldSort(list, less)),
  'sorted: natural': bench(sortedData, list => list.sort(less)),
  'sorted: old recursive': bench(sortedData, list => oldSort(list, less)),
  'reverse: natural': bench(reverseData, list => list.sort(less)),
  'reverse: old recursive': bench(reverseData, list => oldSort(list, less)),
  'nearly sorted: natural': bench(nearlySorted, list => list.sort(less)),
  'nearly sorted: old recursive': bench(nearlySorted, list => oldSort(list, less))
};
