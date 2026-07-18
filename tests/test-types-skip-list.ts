import test from 'tape-six';
import SkipList, {SkipListNode} from 'list-toolkit/skip-list.js';

test('SkipList<T>: constructor and basic property types', t => {
  const list = new SkipList<number>({less: (a, b) => a < b, p: 0.25, maxLevel: 16, random: () => 0.5});
  const _size: number = list.size;
  const _length: number = list.length;
  const _isEmpty: boolean = list.isEmpty;
  const _last: SkipListNode<number> | null = list.last;
  t.pass('compiles');
});

test('SkipList<T>: mutation and lookup types', t => {
  const list = new SkipList<number>();
  const _self: SkipList<number> = list.insert(1).insert(2);
  const _self2: SkipList<number> = list.remove(1);
  const _self3: SkipList<number> = list.clear();
  const node: SkipListNode<number> | null = list.find(2);
  const _has: boolean = list.has(2);
  const _floor: SkipListNode<number> | null = list.floor(2);
  const _ceil: SkipListNode<number> | null = list.ceil(2);
  const _min: SkipListNode<number> | null = list.getMin();
  const _max: SkipListNode<number> | null = list.getMax();
  const _popped: number | undefined = list.popFront();
  t.pass('compiles');
});

test('SkipList<T>: iteration types', t => {
  const list = SkipList.from([3, 1, 2]);
  const _values: Iterable<number | unknown> = list;
  const typed = SkipList.from<string>(['a', 'b'], {compare: (a, b) => a.localeCompare(b)});
  const _iter: IterableIterator<string> = typed[Symbol.iterator]();
  const _range: Iterable<string> = typed.getIterator({from: 'a', to: 'b'});
  const _nodes: Iterable<SkipListNode<string>> = typed.getNodeIterator();
  const _reverse: Iterable<string> = typed.getReverseIterator();
  t.pass('compiles');
});

test('SkipList<T>: node types', t => {
  const list = SkipList.from<number>([1, 2, 3]);
  const node = list.getMin();
  if (node) {
    const _value: number = node.value;
    const _next: (SkipListNode<number> | null)[] = node.next;
    const _prev: SkipListNode<number> | null = node.prev;
    const _level: number = node.level;
  }
  t.pass('compiles');
});
