import test from 'tape-six';
import PairingHeap, {PairingHeapNode} from 'list-toolkit/heap/pairing-heap.js';

test('PairingHeap<T>: constructor and basic property types', t => {
  const heap = new PairingHeap<number>({less: (a, b) => a < b});
  const _size: number = heap.size;
  const _length: number = heap.length;
  const _isEmpty: boolean = heap.isEmpty;
  const _top: number | undefined = heap.top;
  const _root: PairingHeapNode<number> | null = heap.root;
  t.pass('compiles');
});

test('PairingHeap<T>: handle-based operation types', t => {
  const heap = new PairingHeap<{p: number}>({compare: (a, b) => a.p - b.p});
  const node: PairingHeapNode<{p: number}> = heap.push({p: 1});
  node.value.p = 0;
  const _self: PairingHeap<{p: number}> = heap.update(node, true).update(node).remove(node);
  const _popped: {p: number} | undefined = heap.pop();
  const _pp: {p: number} = heap.pushPop({p: 2});
  const _prev: {p: number} | undefined = heap.replaceTop({p: 3});
  const _self2: PairingHeap<{p: number}> = heap.merge(new PairingHeap<{p: number}>(), [{p: 4}]).clear();
  t.pass('compiles');
});

test('PairingHeap<T>: from, clone, make types', t => {
  const heap = PairingHeap.from<number>([3, 1, 2]);
  const _copy: PairingHeap<number> = heap.clone();
  const _made: PairingHeap<number> = heap.make([4, 5]);
  t.pass('compiles');
});
