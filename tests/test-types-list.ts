import test from 'tape-six';
import List, {Ptr} from 'list-toolkit/list.js';
import ValueList, {ValueNode} from 'list-toolkit/value-list.js';
import type {DllRange, DllOptions} from 'list-toolkit/list/nodes.js';

interface DNode {
  x: number;
  next?: DNode;
  prev?: DNode;
}

test('List<T>: constructor and basic property types', t => {
  const list = new List<DNode>();
  const _empty: boolean = list.isEmpty;
  const _one: boolean = list.isOne;
  const _oneOrEmpty: boolean = list.isOneOrEmpty;
  const _len: number = list.getLength();
  t.pass('compiles');
});

test('List<T>: push/pop return types', t => {
  const list = new List<DNode>();
  const ptrF: Ptr<DNode> = list.pushFront({x: 1});
  const ptrB: Ptr<DNode> = list.pushBack({x: 2});
  const ptrP: Ptr<DNode> = list.push({x: 3});
  const ptrFN: Ptr<DNode> = list.pushFrontNode({x: 4});
  const ptrBN: Ptr<DNode> = list.pushBackNode({x: 5});
  const popped: DNode | undefined = list.popFrontNode();
  const popped2: DNode | undefined = list.popBackNode();
  const popF: DNode | undefined = list.popFront();
  const popB: DNode | undefined = list.popBack();
  const pop: DNode | undefined = list.pop();
  t.pass('compiles');
});

test('List<T>: front/back/range types', t => {
  const list = List.from<DNode>([{x: 1}, {x: 2}]);
  const front: DNode = list.front;
  const back: DNode = list.back;
  const range: DllRange<DNode> | null = list.range;
  t.pass('compiles');
});

test('List<T>: Ptr types and navigation', t => {
  const list = List.from<DNode>([{x: 1}, {x: 2}]);
  const fp: Ptr<DNode> = list.frontPtr;
  const bp: Ptr<DNode> = list.backPtr;
  const mp: Ptr<DNode> = list.makePtr();
  const mpp: Ptr<DNode> = list.makePtrFromPrev();
  const node: DNode = fp.node;
  const next: DNode = fp.nextNode;
  const prev: DNode = fp.prevNode;
  const _valid: boolean = fp.isPrevNodeValid();
  const _isHead: boolean = fp.isHead;
  const _self: Ptr<DNode> = fp.next();
  const _self2: Ptr<DNode> = fp.prev();
  const clone: Ptr<DNode> = fp.clone();
  t.pass('compiles');
});

test('List<T>: append/move return types', t => {
  const list = List.from<DNode>([{x: 1}]);
  const list2 = List.from<DNode>([{x: 2}]);
  const pA: Ptr<DNode> | List<DNode> = list.append(list2);
  const list3 = List.from<DNode>([{x: 3}]);
  const pAF: Ptr<DNode> | List<DNode> = list.appendFront(list3);
  const list4 = List.from<DNode>([{x: 4}]);
  const pAB: Ptr<DNode> | List<DNode> = list.appendBack(list4);
  const pMF: Ptr<DNode> = list.moveToFront(list.frontPtr);
  const pMB: Ptr<DNode> = list.moveToBack(list.frontPtr);
  t.pass('compiles');
});

test('List<T>: clear/remove/extract return types', t => {
  const list = List.from<DNode>([{x: 1}, {x: 2}, {x: 3}]);
  const removed: DNode = list.removeNode(list.frontPtr);
  const extracted: List<DNode> = list.extractRange();
  const list2 = List.from<DNode>([{x: 4}, {x: 5}]);
  const byCondition: List<DNode> = list2.extractBy(n => n.x > 4);
  const list3 = List.from<DNode>([{x: 6}]);
  const _self: List<DNode> = list3.clear();
  t.pass('compiles');
});

test('List<T>: sort/reverse return types', t => {
  const list = List.from<DNode>([{x: 3}, {x: 1}]);
  const _rev: List<DNode> = list.reverse();
  const _sorted: List<DNode> = list.sort((a: DNode, b: DNode) => a.x < b.x);
  t.pass('compiles');
});

test('List<T>: iterator types', t => {
  const list = List.from<DNode>([{x: 1}]);
  const iter: IterableIterator<DNode> = list[Symbol.iterator]();
  const nodeIter: IterableIterator<DNode> = list.getNodeIterator();
  const aliasIter: IterableIterator<DNode> = list.getIterator();
  const ptrIter: IterableIterator<Ptr<DNode>> = list.getPtrIterator();
  const revIter: IterableIterator<DNode> = list.getReverseNodeIterator();
  const revAlias: IterableIterator<DNode> = list.getReverseIterator();
  const revPtrIter: IterableIterator<Ptr<DNode>> = list.getReversePtrIterator();
  t.pass('compiles');
});

test('List<T>: release types', t => {
  const list = List.from<DNode>([{x: 1}]);
  const raw: DNode | null = list.releaseRawList();
  const list2 = List.from<DNode>([{x: 2}]);
  const nt: {head: DNode; tail: DNode} | null = list2.releaseNTList();
  t.pass('compiles');
});

test('List<T>: validateRange type', t => {
  const list = List.from<DNode>([{x: 1}, {x: 2}]);
  const _valid: boolean = list.validateRange(list.range!);
  t.pass('compiles');
});

test('List<T>: make/makeFrom/static from types', t => {
  const list = List.from<DNode>([{x: 1}]);
  const empty: List<DNode> = list.make();
  const copy: List<DNode> = list.makeFrom([{x: 2}]);
  const fromStatic: List<DNode> = List.from<DNode>([{x: 3}]);
  t.pass('compiles');
});

test('ValueList<V>: push/pop value types', t => {
  const list = new ValueList<number>();
  const ptr: Ptr<ValueNode<number>> = list.pushFront(42);
  const ptr2: Ptr<ValueNode<number>> = list.pushBack(99);
  const ptr3: Ptr<ValueNode<number>> = list.push(7);
  const val: number | undefined = list.popFront();
  const val2: number | undefined = list.popBack();
  const val3: number | undefined = list.pop();
  const node: ValueNode<number> | undefined = list.popFrontNode();
  const node2: ValueNode<number> | undefined = list.popBackNode();
  t.pass('compiles');
});

test('ValueList<V>: front/back are ValueNode<V>', t => {
  const list = ValueList.from<string>(['a', 'b']);
  const front: ValueNode<string> = list.front;
  const back: ValueNode<string> = list.back;
  const range: DllRange<ValueNode<string>> | null = list.range;
  const fp: Ptr<ValueNode<string>> = list.frontPtr;
  const bp: Ptr<ValueNode<string>> = list.backPtr;
  t.pass('compiles');
});

test('ValueList<V>: default iterator yields V, node iterator yields ValueNode<V>', t => {
  const list = ValueList.from<number>([1, 2]);
  const valIter: IterableIterator<number> = list[Symbol.iterator]();
  const valIter2: IterableIterator<number> = list.getIterator();
  const valIter3: IterableIterator<number> = list.getValueIterator();
  const nodeIter: IterableIterator<ValueNode<number>> = list.getNodeIterator();
  const revVal: IterableIterator<number> = list.getReverseIterator();
  const revVal2: IterableIterator<number> = list.getReverseValueIterator();
  const revNode: IterableIterator<ValueNode<number>> = list.getReverseNodeIterator();
  const ptrIter: IterableIterator<Ptr<ValueNode<number>>> = list.getPtrIterator();
  const revPtrIter: IterableIterator<Ptr<ValueNode<number>>> = list.getReversePtrIterator();
  t.pass('compiles');
});

test('ValueList<V>: sort comparator receives ValueNode<V>', t => {
  const list = ValueList.from<number>([3, 1, 2]);
  const _self: ValueList<number> = list.sort((a: ValueNode<number>, b: ValueNode<number>) => a.value < b.value);
  t.pass('compiles');
});

test('ValueList<V>: extract/clone/make return ValueList<V>', t => {
  const list = ValueList.from<number>([1, 2, 3]);
  const extracted: ValueList<number> = list.extractRange();
  const list2 = ValueList.from<number>([4, 5]);
  const byCondition: ValueList<number> = list2.extractBy(n => n.value > 4);
  const list3 = ValueList.from<number>([6]);
  const cloned: ValueList<number> = list3.clone();
  const empty: ValueList<number> = list3.make();
  const built: ValueList<number> = list3.makeFrom([7]);
  const fromStatic: ValueList<number> = ValueList.from<number>([8]);
  t.pass('compiles');
});

test('ValueList<V>: adoptValue returns ValueNode<V>', t => {
  const list = new ValueList<string>();
  const node: ValueNode<string> = list.adoptValue('hello');
  t.pass('compiles');
});

test('ValueList: static properties', t => {
  const _PtrClass: typeof Ptr = ValueList.Ptr;
  const _VNClass: typeof ValueNode = ValueList.ValueNode;
  t.pass('compiles');
});
