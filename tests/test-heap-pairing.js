import test from 'tape-six';
import PairingHeap, {PairingHeapNode} from 'list-toolkit/heap/pairing-heap.js';

const isValidHeap = heap => {
  let count = 0;
  if (heap.root) {
    if (heap.root.prev || heap.root.sibling) return false;
    const stack = [heap.root];
    while (stack.length) {
      const node = stack.pop();
      ++count;
      let prev = node;
      for (let child = node.child; child; child = child.sibling) {
        if (child.prev !== prev) return false;
        if (heap.less(child.value, node.value)) return false;
        stack.push(child);
        prev = child;
      }
    }
  }
  return count === heap.size;
};

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

test('PairingHeap - basics', t => {
  const heap = new PairingHeap();
  t.ok(heap.isEmpty);
  t.equal(heap.length, 0);
  t.equal(heap.top, undefined);
  t.equal(heap.pop(), undefined);

  heap.push(3);
  heap.push(1);
  heap.push(2);
  t.equal(heap.size, 3);
  t.equal(heap.top, 1);
  t.equal(heap.peek(), 1);
  t.ok(isValidHeap(heap));

  t.equal(heap.pop(), 1);
  t.equal(heap.pop(), 2);
  t.equal(heap.pop(), 3);
  t.ok(heap.isEmpty);
});

test('PairingHeap - push returns a node handle', t => {
  const heap = new PairingHeap(),
    node = heap.push(42);
  t.ok(node instanceof PairingHeapNode);
  t.equal(node.value, 42);
  t.equal(heap.root, node);
});

test('PairingHeap - decrease-key by handle', t => {
  const heap = new PairingHeap({less: (a, b) => a.p < b.p}),
    nodes = Array.from({length: 10}, (_, i) => heap.push({p: i + 10}));
  t.ok(isValidHeap(heap));

  nodes[7].value.p = 1;
  heap.update(nodes[7], true);
  t.equal(heap.top, nodes[7].value);
  t.ok(isValidHeap(heap));

  nodes[3].value.p = 0;
  heap.update(nodes[3]);
  t.equal(heap.top, nodes[3].value);
  t.ok(isValidHeap(heap));
});

test('PairingHeap - general update (increase)', t => {
  const heap = new PairingHeap({less: (a, b) => a.p < b.p}),
    nodes = Array.from({length: 10}, (_, i) => heap.push({p: i}));

  nodes[0].value.p = 100;
  heap.update(nodes[0]);
  t.equal(heap.top.p, 1);
  t.ok(isValidHeap(heap));

  nodes[5].value.p = 200;
  heap.update(nodes[5], false);
  t.ok(isValidHeap(heap));

  const drained = [];
  while (!heap.isEmpty) drained.push(heap.pop().p);
  t.deepEqual(drained, [1, 2, 3, 4, 6, 7, 8, 9, 100, 200]);
});

test('PairingHeap - remove by handle', t => {
  const heap = new PairingHeap({less: (a, b) => a.p < b.p}),
    nodes = Array.from({length: 10}, (_, i) => heap.push({p: i}));

  heap.remove(nodes[5]);
  t.equal(heap.size, 9);
  t.ok(isValidHeap(heap));

  heap.remove(nodes[0]);
  t.equal(heap.top.p, 1);
  t.ok(isValidHeap(heap));

  heap.remove(nodes[9]);
  t.equal(heap.size, 7);
  t.ok(isValidHeap(heap));

  const drained = [];
  while (!heap.isEmpty) drained.push(heap.pop().p);
  t.deepEqual(drained, [1, 2, 3, 4, 6, 7, 8]);
});

test('PairingHeap - merge', t => {
  const heap1 = PairingHeap.from([1, 5, 9]),
    heap2 = PairingHeap.from([2, 4, 8]);
  heap1.merge(heap2, [3, 7], PairingHeap.from([6]));
  t.ok(heap2.isEmpty);
  t.equal(heap2.size, 0);
  t.equal(heap1.size, 9);
  t.ok(isValidHeap(heap1));
  const drained = [];
  while (!heap1.isEmpty) drained.push(heap1.pop());
  t.deepEqual(drained, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('PairingHeap - pushPop and replaceTop', t => {
  const heap = PairingHeap.from([2, 4, 6]);
  t.equal(heap.pushPop(1), 1);
  t.equal(heap.size, 3);
  t.equal(heap.pushPop(5), 2);
  t.equal(heap.size, 3);
  t.ok(isValidHeap(heap));

  t.equal(heap.replaceTop(3), 4);
  t.equal(heap.size, 3);
  t.ok(isValidHeap(heap));

  const empty = new PairingHeap();
  t.equal(empty.replaceTop(7), undefined);
  t.equal(empty.top, 7);
  t.equal(empty.size, 1);
});

test('PairingHeap - clone independence', t => {
  const heap = PairingHeap.from([3, 1, 4, 1.5, 5]),
    copy = heap.clone();
  t.equal(copy.size, heap.size);
  t.ok(isValidHeap(copy));

  heap.push(0);
  heap.pop();
  t.equal(copy.size, 5);
  const drained = [];
  while (!copy.isEmpty) drained.push(copy.pop());
  t.deepEqual(drained, [1, 1.5, 3, 4, 5]);
});

test('PairingHeap - custom order and clear', t => {
  const maxHeap = PairingHeap.from([1, 5, 3], {less: (a, b) => a > b});
  t.equal(maxHeap.pop(), 5);

  const byCompare = PairingHeap.from(['bb', 'a', 'ccc'], {compare: (a, b) => a.length - b.length});
  t.equal(byCompare.pop(), 'a');

  byCompare.clear();
  t.ok(byCompare.isEmpty);
  t.equal(byCompare.size, 0);
});

test('PairingHeap - deterministic stress', t => {
  const random = makeLcg(),
    heap = new PairingHeap({less: (a, b) => a.p < b.p}),
    live = [];
  for (let step = 0; step < 2000; ++step) {
    const op = random();
    if (op < 0.5 || !live.length) {
      const item = {p: Math.floor(random() * 10000)};
      live.push({item, node: heap.push(item)});
    } else if (op < 0.7) {
      const picked = live.splice(Math.floor(random() * live.length), 1)[0];
      heap.remove(picked.node);
    } else if (op < 0.9) {
      const picked = live[Math.floor(random() * live.length)],
        newP = Math.floor(random() * 10000),
        isDecreased = newP < picked.item.p;
      picked.item.p = newP;
      heap.update(picked.node, isDecreased);
    } else {
      const value = heap.pop(),
        index = live.findIndex(entry => entry.item === value);
      live.splice(index, 1);
    }
  }
  t.equal(heap.size, live.length);
  t.ok(isValidHeap(heap));
  const expected = live.map(entry => entry.item.p).sort((a, b) => a - b);
  const drained = [];
  while (!heap.isEmpty) drained.push(heap.pop().p);
  t.deepEqual(drained, expected);
});
