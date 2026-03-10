import test from 'tape-six';
import ExtList, {Ptr as ExtDllPtr} from 'list-toolkit/ext-list.js';
import ExtValueList from 'list-toolkit/ext-value-list.js';
import ExtSList, {Ptr as ExtSllPtr} from 'list-toolkit/ext-slist.js';
import ExtValueSList from 'list-toolkit/ext-value-slist.js';
import type {ValueNode, DllRange} from 'list-toolkit/list/nodes.js';
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

test('ExtList<T>: constructor and basic property types', t => {
  const list = new ExtList<DNode>();
  const _empty: boolean = list.isEmpty;
  const _one: boolean = list.isOne;
  const _oneOrEmpty: boolean = list.isOneOrEmpty;
  const _len: number = list.getLength();
  const _head: DNode | null = list.head;
  const _front: DNode | undefined = list.front;
  const _back: DNode | undefined = list.back;
  const _range: DllRange<DNode> | null = list.range;
  t.pass('compiles');
});

test('ExtList<T>: Ptr types', t => {
  const list = ExtList.from<DNode>([{v: 1}, {v: 2}]);
  const ptr: ExtDllPtr<DNode> | null = list.makePtr();
  const mpp: ExtDllPtr<DNode> = list.makePtrFromPrev();
  const clone: ExtDllPtr<DNode> = mpp.clone();
  const node: DNode = mpp.node;
  const next: DNode = mpp.nextNode;
  const prev: DNode = mpp.prevNode;
  t.pass('compiles');
});

test('ExtList<T>: remove return types', t => {
  const list = ExtList.from<DNode>([{v: 1}, {v: 2}, {v: 3}]);
  const removed: DNode | null = list.removeCurrent();
  const removedB: DNode | null = list.removeNodeBefore();
  const removedA: DNode | null = list.removeNodeAfter();
  const removedB2: DNode | null = list.removeBefore();
  const removedA2: DNode | null = list.removeAfter();
  const removedN: DNode | null = list.removeNode({v: 1});
  t.pass('compiles');
});

test('ExtList<T>: add/insert return types', t => {
  const list = ExtList.from<DNode>([{v: 1}]);
  const pA: ExtDllPtr<DNode> = list.addAfter({v: 2});
  const pB: ExtDllPtr<DNode> = list.addBefore({v: 3});
  const pAdd: ExtDllPtr<DNode> = list.add({v: 4});
  const pNA: ExtDllPtr<DNode> = list.addNodeAfter({v: 5});
  const pNB: ExtDllPtr<DNode> = list.addNodeBefore({v: 6});
  const list2 = ExtList.from<DNode>([{v: 7}]);
  const pIB: ExtDllPtr<DNode> | null = list.insertBefore(list2);
  const list3 = ExtList.from<DNode>([{v: 8}]);
  const pIA: ExtDllPtr<DNode> | null = list.insertAfter(list3);
  t.pass('compiles');
});

test('ExtList<T>: move return types', t => {
  const a: DNode = {v: 1};
  const b: DNode = {v: 2};
  const list = ExtList.from<DNode>([a, b]);
  const pMB: ExtDllPtr<DNode> | ExtList<DNode> = list.moveBefore(b);
  const pMA: ExtDllPtr<DNode> | ExtList<DNode> = list.moveAfter(a);
  t.pass('compiles');
});

test('ExtList<T>: clear/extract return types', t => {
  const list = ExtList.from<DNode>([{v: 1}, {v: 2}, {v: 3}]);
  const extracted: ExtList<DNode> = list.extractRange();
  const list2 = ExtList.from<DNode>([{v: 4}, {v: 5}]);
  const byCondition: ExtList<DNode> = list2.extractBy(n => n.v > 4);
  const list3 = ExtList.from<DNode>([{v: 6}]);
  const _self: ExtList<DNode> = list3.clear();
  t.pass('compiles');
});

test('ExtList<T>: sort/reverse return types', t => {
  const list = ExtList.from<DNode>([{v: 3}, {v: 1}]);
  const _rev: ExtList<DNode> = list.reverse();
  const _sorted: ExtList<DNode> = list.sort((a: DNode, b: DNode) => a.v < b.v);
  t.pass('compiles');
});

test('ExtList<T>: iterator types', t => {
  const list = ExtList.from<DNode>([{v: 1}]);
  const iter: IterableIterator<DNode> = list[Symbol.iterator]();
  const nodeIter: IterableIterator<DNode> = list.getNodeIterator();
  const aliasIter: IterableIterator<DNode> = list.getIterator();
  const ptrIter: IterableIterator<ExtDllPtr<DNode>> = list.getPtrIterator();
  const revIter: IterableIterator<DNode> = list.getReverseNodeIterator();
  const revAlias: IterableIterator<DNode> = list.getReverseIterator();
  const revPtrIter: IterableIterator<ExtDllPtr<DNode>> = list.getReversePtrIterator();
  t.pass('compiles');
});

test('ExtList<T>: clone/make/makeFrom/from types', t => {
  const list = ExtList.from<DNode>([{v: 1}]);
  const cloned: ExtList<DNode> = list.clone();
  const empty: ExtList<DNode> = list.make();
  const built: ExtList<DNode> = list.makeFrom([{v: 2}]);
  const fromStatic: ExtList<DNode> = ExtList.from<DNode>([{v: 3}]);
  t.pass('compiles');
});

test('ExtList<T>: attach/detach types', t => {
  const source = ExtList.from<DNode>([{v: 1}]);
  const node: DNode | null = source.detach();
  const list = new ExtList<DNode>();
  const prev: DNode | null = list.attach(node);
  const detached: DNode | null = list.detach();
  t.pass('compiles');
});

test('ExtValueList<V>: value iterator yields V, node iterator yields ValueNode<V>', t => {
  const list = ExtValueList.from<number>([1, 2]);
  const valIter: IterableIterator<number> = list[Symbol.iterator]();
  const valIter2: IterableIterator<number> = list.getIterator();
  const valIter3: IterableIterator<number> = list.getValueIterator();
  const nodeIter: IterableIterator<ValueNode<number>> = list.getNodeIterator();
  const revVal: IterableIterator<number> = list.getReverseIterator();
  const revVal2: IterableIterator<number> = list.getReverseValueIterator();
  const revNode: IterableIterator<ValueNode<number>> = list.getReverseNodeIterator();
  t.pass('compiles');
});

test('ExtValueList<V>: clone/make/makeFrom/from types', t => {
  const list = ExtValueList.from<string>(['a']);
  const cloned: ExtValueList<string> = list.clone();
  const empty: ExtValueList<string> = list.make();
  const built: ExtValueList<string> = list.makeFrom(['b']);
  const fromStatic: ExtValueList<string> = ExtValueList.from<string>(['c']);
  t.pass('compiles');
});

test('ExtSList<T>: constructor and basic property types', t => {
  const list = new ExtSList<SNode>();
  const _empty: boolean = list.isEmpty;
  const _len: number = list.getLength();
  const _head: SNode | null = list.head;
  t.pass('compiles');
});

test('ExtSList<T>: Ptr types', t => {
  const list = ExtSList.from<SNode>([{v: 1}, {v: 2}]);
  const ptr: ExtSllPtr<SNode> | null = list.makePtr();
  const mpp: ExtSllPtr<SNode> = list.makePtrFromPrev();
  const clone: ExtSllPtr<SNode> = mpp.clone();
  t.pass('compiles');
});

test('ExtSList<T>: remove/add/insert types', t => {
  const list = ExtSList.from<SNode>([{v: 1}, {v: 2}]);
  const removed: SNode | null = list.removeNodeAfter();
  const removed2: SNode | null = list.removeAfter();
  const pA: ExtSllPtr<SNode> = list.addAfter({v: 3});
  const pAdd: ExtSllPtr<SNode> = list.add({v: 4});
  const pNA: ExtSllPtr<SNode> = list.addNodeAfter({v: 5});
  const list2 = ExtSList.from<SNode>([{v: 6}]);
  const pIA: ExtSllPtr<SNode> | null = list.insertAfter(list2);
  t.pass('compiles');
});

test('ExtSList<T>: iterator types', t => {
  const list = ExtSList.from<SNode>([{v: 1}]);
  const iter: IterableIterator<SNode> = list[Symbol.iterator]();
  const nodeIter: IterableIterator<SNode> = list.getNodeIterator();
  const aliasIter: IterableIterator<SNode> = list.getIterator();
  const ptrIter: IterableIterator<ExtSllPtr<SNode>> = list.getPtrIterator();
  t.pass('compiles');
});

test('ExtSList<T>: clone/make/makeFrom/from types', t => {
  const list = ExtSList.from<SNode>([{v: 1}]);
  const cloned: ExtSList<SNode> = list.clone();
  const empty: ExtSList<SNode> = list.make();
  const built: ExtSList<SNode> = list.makeFrom([{v: 2}]);
  const fromStatic: ExtSList<SNode> = ExtSList.from<SNode>([{v: 3}]);
  t.pass('compiles');
});

test('ExtValueSList<V>: value iterator yields V, node iterator yields SValueNode<V>', t => {
  const list = ExtValueSList.from<number>([1, 2]);
  const valIter: IterableIterator<number> = list[Symbol.iterator]();
  const valIter2: IterableIterator<number> = list.getIterator();
  const valIter3: IterableIterator<number> = list.getValueIterator();
  const nodeIter: IterableIterator<SValueNode<number>> = list.getNodeIterator();
  t.pass('compiles');
});

test('ExtValueSList<V>: clone/make/makeFrom/from types', t => {
  const list = ExtValueSList.from<string>(['a']);
  const cloned: ExtValueSList<string> = list.clone();
  const empty: ExtValueSList<string> = list.make();
  const built: ExtValueSList<string> = list.makeFrom(['b']);
  const fromStatic: ExtValueSList<string> = ExtValueSList.from<string>(['c']);
  t.pass('compiles');
});
