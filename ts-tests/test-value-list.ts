import test from 'tape-six';
import ValueList, {ValueNode, Ptr} from 'list-toolkit/value-list.js';

test('ValueList<V>: iteration yields unwrapped values', t => {
  const list = ValueList.from<number>([1, 2, 3]);

  const values: number[] = [];
  for (const v of list) {
    values.push(v);
  }
  t.deepEqual(values, [1, 2, 3]);
});

test('ValueList<V>: getNodeIterator yields ValueNode<V>', t => {
  const list = ValueList.from<string>(['a', 'b', 'c']);

  const nodes: ValueNode<string>[] = [];
  for (const node of list.getNodeIterator()) {
    nodes.push(node);
  }
  t.equal(nodes.length, 3);
  t.equal(nodes[0].value, 'a');
  t.equal(nodes[2].value, 'c');
});

test('ValueList<V>: popFront returns V, popFrontNode returns ValueNode<V>', t => {
  const list = ValueList.from<number>([10, 20, 30]);

  const val: number | undefined = list.popFront();
  t.equal(val, 10);

  const node: ValueNode<number> | undefined = list.popFrontNode();
  t.ok(node);
  t.equal(node!.value, 20);
});

test('ValueList<V>: pushFront/pushBack accept raw values', t => {
  const list = new ValueList<number>();

  list.pushFront(1);
  list.pushBack(2);
  list.pushFront(0);

  t.deepEqual(Array.from(list), [0, 1, 2]);
});

test('ValueList<V>: Ptr over ValueNode<V>', t => {
  const list = ValueList.from<number>([10, 20, 30]);

  const ptr: Ptr<ValueNode<number>> = list.frontPtr;
  t.equal(ptr.node.value, 10);

  ptr.next();
  t.equal(ptr.node.value, 20);
});

test('ValueList<V>: getReverseIterator yields V', t => {
  const list = ValueList.from<number>([1, 2, 3]);

  const reversed: number[] = [];
  for (const v of list.getReverseIterator()) {
    reversed.push(v);
  }
  t.deepEqual(reversed, [3, 2, 1]);
});

test('ValueList<V>: sort with typed comparator', t => {
  const list = ValueList.from<number>([3, 1, 2]);

  list.sort((a: ValueNode<number>, b: ValueNode<number>) => a.value < b.value);

  t.deepEqual(Array.from(list), [1, 2, 3]);
});

test('ValueList<V>: clone returns ValueList<V>', t => {
  const list = ValueList.from<string>(['x', 'y']);
  const copy: ValueList<string> = list.clone();

  t.deepEqual(Array.from(copy), ['x', 'y']);
});

test('ValueList<V>: make and makeFrom return typed lists', t => {
  const list = ValueList.from<number>([1]);

  const empty: ValueList<number> = list.make();
  t.ok(empty.isEmpty);

  const built: ValueList<number> = list.makeFrom([10, 20]);
  t.deepEqual(Array.from(built), [10, 20]);
});

test('ValueList<V>: string values', t => {
  const list = ValueList.from<string>(['hello', 'world']);

  const first: string | undefined = list.popFront();
  t.equal(first, 'hello');
});
