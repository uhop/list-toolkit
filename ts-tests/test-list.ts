import test from 'tape-six';
import List, {Ptr} from 'list-toolkit/list.js';
import type {DllRange} from 'list-toolkit/list/nodes.js';

interface MyNode {
  x: number;
  next?: MyNode;
  prev?: MyNode;
}

test('List<T>: generic node typing', t => {
  const list = new List<MyNode>();
  t.ok(list.isEmpty);

  const a: MyNode = {x: 1};
  const b: MyNode = {x: 2};
  const c: MyNode = {x: 3};

  list.pushFront(a);
  list.pushBack(b);
  list.pushBack(c);

  const front: MyNode = list.front as MyNode;
  t.equal(front.x, 1);

  const back: MyNode = list.back as MyNode;
  t.equal(back.x, 3);

  t.equal(list.getLength(), 3);
});

test('List<T>: iteration yields T', t => {
  const list = new List<MyNode>();
  const items: MyNode[] = [{x: 10}, {x: 20}, {x: 30}];
  for (const item of items) list.pushBack(item);

  const collected: MyNode[] = [];
  for (const node of list) {
    collected.push(node);
  }
  t.equal(collected.length, 3);
  t.equal(collected[0].x, 10);
  t.equal(collected[2].x, 30);
});

test('List<T>: Ptr navigation', t => {
  const list = new List<MyNode>();
  list.pushBack({x: 1});
  list.pushBack({x: 2});
  list.pushBack({x: 3});

  const ptr: Ptr<MyNode> = list.frontPtr;
  t.equal((ptr.node as MyNode).x, 1);

  ptr.next();
  t.equal((ptr.node as MyNode).x, 2);
});

test('List<T>: range typing', t => {
  const list = new List<MyNode>();
  list.pushBack({x: 1});
  list.pushBack({x: 2});
  list.pushBack({x: 3});

  const range: DllRange<MyNode> | null = list.range;
  t.ok(range);
});

test('List<T>: make and makeFrom return typed lists', t => {
  const list = new List<MyNode>();
  list.pushBack({x: 1});
  list.pushBack({x: 2});

  const empty: List<MyNode> = list.make();
  t.ok(empty.isEmpty);

  const copy: List<MyNode> = list.makeFrom([{x: 10}, {x: 20}]);
  t.equal(copy.getLength(), 2);
});

test('List<T>: sort with typed comparator', t => {
  const list = new List<MyNode>();
  list.pushBack({x: 30});
  list.pushBack({x: 10});
  list.pushBack({x: 20});

  list.sort((a: MyNode, b: MyNode) => a.x < b.x);

  const values: number[] = Array.from(list).map(n => n.x);
  t.deepEqual(values, [10, 20, 30]);
});

test('List.from static generic', t => {
  const nodes: MyNode[] = [{x: 5}, {x: 6}];
  const list: List<MyNode> = List.from(nodes);
  t.equal(list.getLength(), 2);
});
