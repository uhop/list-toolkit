import ValueList from '../src/value-list.js';
import {splice} from '../src/list/basics.js';

// the natural merge sort replicated twice as standalone functions — identical
// except the merge's tie preference: taking ties from the left run is what makes
// the sort stable; taking them from the right makes it unstable. One comparison
// per merge step either way — this bench measures the (expected zero) difference.

const makeMerge = takeRightOnTies => (a, b, lessFn) => {
  let current = a[a.nextName];
  while (current !== a && !b.isEmpty) {
    const takeFromB = takeRightOnTies ? !lessFn(current, b.front) : lessFn(b.front, current);
    if (takeFromB) {
      splice(a, current[a.prevName], b.popFrontNode());
    } else {
      current = current[a.nextName];
    }
  }
  if (!b.isEmpty) a.appendBack(b);
  return a;
};

const makeSort = merge => (list, lessFn) => {
  if (list.isOneOrEmpty) return list;
  let runs = [];
  while (!list.isEmpty) {
    const run = list.make();
    do {
      splice(run, run[list.prevName], list.popFrontNode());
    } while (!list.isEmpty && !lessFn(list[list.nextName], run[list.prevName]));
    runs.push(run);
  }
  while (runs.length > 1) {
    const merged = [];
    for (let i = 1; i < runs.length; i += 2) merged.push(merge(runs[i - 1], runs[i], lessFn));
    if (runs.length & 1) merged.push(runs[runs.length - 1]);
    runs = merged;
  }
  list.appendBack(runs[0]);
  return list;
};

const sortStable = makeSort(makeMerge(false)),
  sortUnstable = makeSort(makeMerge(true));

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

const SIZE = 10_000,
  random = makeLcg(),
  distinctData = Array.from({length: SIZE}, () => Math.floor(random() * 1_000_000)),
  tieHeavyData = Array.from({length: SIZE}, () => Math.floor(random() * 10));

const less = (a, b) => a.value < b.value;

const bench = (data, sortFn) => n => {
  let list;
  for (let i = 0; i < n; ++i) {
    list = ValueList.from(data);
    sortFn(list, less);
  }
  return list;
};

export default {
  'distinct keys: stable': bench(distinctData, sortStable),
  'distinct keys: unstable': bench(distinctData, sortUnstable),
  '10 distinct keys (tie-heavy): stable': bench(tieHeavyData, sortStable),
  '10 distinct keys (tie-heavy): unstable': bench(tieHeavyData, sortUnstable)
};
