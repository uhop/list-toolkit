import test from 'tape-six';
import ExtList from 'list-toolkit/ext-list.js';
import ExtValueList from 'list-toolkit/ext-value-list.js';
import ExtSList from 'list-toolkit/ext-slist.js';
import ExtValueSList from 'list-toolkit/ext-value-slist.js';
import type {ValueNode} from 'list-toolkit/list/nodes.js';
import type {ValueNode as SValueNode} from 'list-toolkit/slist/nodes.js';

interface DNode {
  v: number;
  next?: DNode;
  prev?: DNode;
}

interface SNode {
  v: number;
  next?: SNode;
}

test('ExtList<T>: generic node typing and iteration', t => {
  const a: DNode = {v: 1};
  const b: DNode = {v: 2};
  const c: DNode = {v: 3};

  const list = ExtList.from<DNode>([a, b, c]);
  t.equal(list.getLength(), 3);

  const collected: DNode[] = [];
  for (const node of list) {
    collected.push(node);
  }
  t.equal(collected.length, 3);
  t.equal(collected[0].v, 1);
});

test('ExtList<T>: Ptr typing', t => {
  const list = ExtList.from<DNode>([{v: 1}, {v: 2}]);

  const ptr = list.makePtr();
  t.ok(ptr);
  t.equal((ptr!.node as DNode).v, 1);

  const clone = ptr!.clone();
  t.equal((clone.node as DNode).v, 1);
});

test('ExtValueList<V>: iteration yields unwrapped values', t => {
  const list = ExtValueList.from<number>([10, 20, 30]);

  const values: number[] = [];
  for (const v of list) {
    values.push(v);
  }
  t.deepEqual(values, [10, 20, 30]);
});

test('ExtValueList<V>: getNodeIterator yields ValueNode<V>', t => {
  const list = ExtValueList.from<string>(['a', 'b']);

  const nodes: ValueNode<string>[] = [];
  for (const node of list.getNodeIterator()) {
    nodes.push(node);
  }
  t.equal(nodes.length, 2);
  t.equal(nodes[0].value, 'a');
});

test('ExtSList<T>: generic node typing and iteration', t => {
  const list = ExtSList.from<SNode>([{v: 1}, {v: 2}, {v: 3}]);
  t.equal(list.getLength(), 3);

  const collected: SNode[] = [];
  for (const node of list) {
    collected.push(node);
  }
  t.equal(collected[0].v, 1);
});

test('ExtValueSList<V>: iteration yields unwrapped values', t => {
  const list = ExtValueSList.from<number>([5, 10, 15]);

  const values: number[] = [];
  for (const v of list) {
    values.push(v);
  }
  t.deepEqual(values, [5, 10, 15]);
});

test('ExtValueSList<V>: getNodeIterator yields SValueNode<V>', t => {
  const list = ExtValueSList.from<string>(['x', 'y']);

  const nodes: SValueNode<string>[] = [];
  for (const node of list.getNodeIterator()) {
    nodes.push(node);
  }
  t.equal(nodes.length, 2);
  t.equal(nodes[0].value, 'x');
});
