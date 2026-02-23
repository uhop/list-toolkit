import test from 'tape-six';
import SList, {Ptr} from 'list-toolkit/slist.js';
import ValueSList, {ValueNode} from 'list-toolkit/value-slist.js';
import type {SllRange, SllPtrRange} from 'list-toolkit/slist/nodes.js';

interface SNode {
  id: number;
  next?: SNode;
}

test('SList<T>: generic node typing', t => {
  const list = new SList<SNode>();
  t.ok(list.isEmpty);

  list.pushFront({id: 1});
  list.pushBack({id: 2});
  list.pushBack({id: 3});

  const front: SNode = list.front as SNode;
  t.equal(front.id, 1);
  t.equal(list.getLength(), 3);
});

test('SList<T>: iteration yields T', t => {
  const list = SList.from<SNode>([{id: 10}, {id: 20}]);

  const collected: SNode[] = [];
  for (const node of list) {
    collected.push(node);
  }
  t.equal(collected.length, 2);
  t.equal(collected[0].id, 10);
});

test('SList<T>: Ptr navigation', t => {
  const list = new SList<SNode>();
  list.pushBack({id: 1});
  list.pushBack({id: 2});

  const ptr: Ptr<SNode> = list.frontPtr;
  t.equal((ptr.node as SNode).id, 1);

  ptr.next();
  t.equal((ptr.node as SNode).id, 2);
});

test('SList<T>: range and ptrRange typing', t => {
  const list = SList.from<SNode>([{id: 1}, {id: 2}]);

  const range: SllRange<SNode> | null = list.range;
  t.ok(range);

  const ptrRange: SllPtrRange<SNode> | null = list.ptrRange;
  t.ok(ptrRange);
});

test('SList<T>: sort with typed comparator', t => {
  const list = SList.from<SNode>([{id: 30}, {id: 10}, {id: 20}]);

  list.sort((a: SNode, b: SNode) => a.id < b.id);

  const ids = Array.from(list).map(n => n.id);
  t.deepEqual(ids, [10, 20, 30]);
});

test('ValueSList<V>: iteration yields unwrapped values', t => {
  const list = ValueSList.from<number>([1, 2, 3]);

  const values: number[] = [];
  for (const v of list) {
    values.push(v);
  }
  t.deepEqual(values, [1, 2, 3]);
});

test('ValueSList<V>: getNodeIterator yields ValueNode<V>', t => {
  const list = ValueSList.from<string>(['a', 'b']);

  const nodes: ValueNode<string>[] = [];
  for (const node of list.getNodeIterator()) {
    nodes.push(node);
  }
  t.equal(nodes.length, 2);
  t.equal(nodes[0].value, 'a');
});

test('ValueSList<V>: popFront returns V', t => {
  const list = ValueSList.from<number>([10, 20]);

  const val: number | undefined = list.popFront();
  t.equal(val, 10);
});

test('ValueSList<V>: clone returns ValueSList<V>', t => {
  const list = ValueSList.from<number>([1, 2, 3]);
  const copy: ValueSList<number> = list.clone();
  t.deepEqual(Array.from(copy), [1, 2, 3]);
});
