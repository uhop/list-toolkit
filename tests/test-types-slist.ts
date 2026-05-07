import test from 'tape-six';
import SList, {Ptr} from 'list-toolkit/slist.js';
import ValueSList, {ValueNode} from 'list-toolkit/value-slist.js';
import type {SllRange, SllPtrRange} from 'list-toolkit/slist/nodes.js';

interface SNode {
  id: number;
  next?: SNode;
}

test('SList<T>: constructor and basic property types', t => {
  const list = new SList<SNode>();
  const _empty: boolean = list.isEmpty;
  const _one: boolean = list.isOne;
  const _oneOrEmpty: boolean = list.isOneOrEmpty;
  const _len: number = list.getLength();
  t.pass('compiles');
});

test('SList<T>: push/pop return types', t => {
  const list = new SList<SNode>();
  const ptrF: Ptr<SNode> = list.pushFront({id: 1});
  const ptrB: Ptr<SNode> = list.pushBack({id: 2});
  const ptrP: Ptr<SNode> = list.push({id: 3});
  const ptrFN: Ptr<SNode> = list.pushFrontNode({id: 4});
  const ptrBN: Ptr<SNode> = list.pushBackNode({id: 5});
  const popped: SNode | undefined = list.popFrontNode();
  const popF: SNode | undefined = list.popFront();
  const pop: SNode | undefined = list.pop();
  t.pass('compiles');
});

test('SList<T>: front/back/range types', t => {
  const list = SList.from<SNode>([{id: 1}, {id: 2}]);
  const front: SNode = list.front;
  const back: SNode = list.back;
  const range: SllRange<SNode> | null = list.range;
  const ptrRange: SllPtrRange<SNode> | null = list.ptrRange;
  t.pass('compiles');
});

test('SList<T>: Ptr types and navigation', t => {
  const list = SList.from<SNode>([{id: 1}, {id: 2}]);
  const fp: Ptr<SNode> = list.frontPtr;
  const mp: Ptr<SNode> = list.makePtr();
  const mpp: Ptr<SNode> = list.makePtrFromPrev();
  const node: SNode = fp.node;
  const next: SNode = fp.nextNode;
  const prev: SNode = fp.prevNode;
  const _valid: boolean = fp.isPrevNodeValid();
  const _isHead: boolean = fp.isHead;
  const _self: Ptr<SNode> = fp.next();
  const clone: Ptr<SNode> = fp.clone();
  t.pass('compiles');
});

test('SList<T>: Ptr mutation types', t => {
  const list = SList.from<SNode>([{id: 1}, {id: 2}]);
  const ptr = list.frontPtr;
  const removed: SNode | null = ptr.removeCurrent();
  const list2 = SList.from<SNode>([{id: 3}]);
  const ptrAdd: Ptr<SNode> = ptr.addBefore({id: 4});
  const ptrAdd2: Ptr<SNode> = ptr.addAfter({id: 5});
  const ptrAdd3: Ptr<SNode> = ptr.addNodeBefore({id: 6});
  const ptrAdd4: Ptr<SNode> = ptr.addNodeAfter({id: 7});
  const ptrIns: Ptr<SNode> = ptr.insertBefore(list2);
  const list3 = SList.from<SNode>([{id: 8}]);
  const ptrIns2: Ptr<SNode> = ptr.insertAfter(list3);
  t.pass('compiles');
});

test('SList<T>: append/move return types', t => {
  const list = SList.from<SNode>([{id: 1}]);
  const list2 = SList.from<SNode>([{id: 2}]);
  const pA: Ptr<SNode> | SList<SNode> = list.append(list2);
  const list3 = SList.from<SNode>([{id: 3}]);
  const pAF: Ptr<SNode> | SList<SNode> = list.appendFront(list3);
  const list4 = SList.from<SNode>([{id: 4}]);
  const pAB: Ptr<SNode> | SList<SNode> = list.appendBack(list4);
  const pMF: Ptr<SNode> | SList<SNode> = list.moveToFront(list.frontPtr);
  const pMB: Ptr<SNode> | SList<SNode> = list.moveToBack(list.frontPtr);
  t.pass('compiles');
});

test('SList<T>: clear/remove/extract return types', t => {
  const list = SList.from<SNode>([{id: 1}, {id: 2}, {id: 3}]);
  const removed: SNode | null = list.removeNode(list.frontPtr);
  const extracted: SList<SNode> = list.extractRange();
  const list2 = SList.from<SNode>([{id: 4}, {id: 5}]);
  const byCondition: SList<SNode> = list2.extractBy(n => n.id > 4);
  const list3 = SList.from<SNode>([{id: 6}]);
  const _self: SList<SNode> = list3.clear();
  t.pass('compiles');
});

test('SList<T>: sort/reverse return types', t => {
  const list = SList.from<SNode>([{id: 3}, {id: 1}]);
  const _rev: SList<SNode> = list.reverse();
  const _sorted: SList<SNode> = list.sort((a: SNode, b: SNode) => a.id < b.id);
  t.pass('compiles');
});

test('SList<T>: iterator types', t => {
  const list = SList.from<SNode>([{id: 1}]);
  const iter: IterableIterator<SNode> = list[Symbol.iterator]();
  const nodeIter: IterableIterator<SNode> = list.getNodeIterator();
  const aliasIter: IterableIterator<SNode> = list.getIterator();
  const ptrIter: IterableIterator<Ptr<SNode>> = list.getPtrIterator();
  t.pass('compiles');
});

test('SList<T>: release types', t => {
  const list = SList.from<SNode>([{id: 1}]);
  const raw: SNode | null = list.releaseRawList();
  const list2 = SList.from<SNode>([{id: 2}]);
  const nt: {head: SNode; tail: SNode} | null = list2.releaseNTList();
  t.pass('compiles');
});

test('SList<T>: make/makeFrom/static from types', t => {
  const list = SList.from<SNode>([{id: 1}]);
  const empty: SList<SNode> = list.make();
  const copy: SList<SNode> = list.makeFrom([{id: 2}]);
  const fromStatic: SList<SNode> = SList.from<SNode>([{id: 3}]);
  t.pass('compiles');
});

test('ValueSList<V>: push/pop value types', t => {
  const list = new ValueSList<number>();
  list.pushFront(42);
  list.pushBack(99);
  const val: number | undefined = list.popFront();
  const val2: number | undefined = list.pop();
  t.pass('compiles');
});

test('ValueSList<V>: default iterator yields V, node iterator yields ValueNode<V>', t => {
  const list = ValueSList.from<number>([1, 2]);
  const valIter: IterableIterator<number> = list[Symbol.iterator]();
  const valIter2: IterableIterator<number> = list.getIterator();
  const valIter3: IterableIterator<number> = list.getValueIterator();
  const nodeIter: IterableIterator<ValueNode<number>> = list.getNodeIterator();
  t.pass('compiles');
});

test('ValueSList<V>: clone/make/makeFrom return ValueSList<V>', t => {
  const list = ValueSList.from<string>(['a']);
  const cloned: ValueSList<string> = list.clone();
  const empty: ValueSList<string> = list.make();
  const built: ValueSList<string> = list.makeFrom(['b']);
  const fromStatic: ValueSList<string> = ValueSList.from<string>(['c']);
  t.pass('compiles');
});
