import test from 'tape-six';
import RingBuffer from 'list-toolkit/ring-buffer.js';

test('RingBuffer<V>: constructor and basic property types', t => {
  const ring = new RingBuffer<number>({capacity: 10, initialCapacity: 4});
  const _size: number = ring.size;
  const _capacity: number = ring.capacity;
  const _isEmpty: boolean = ring.isEmpty;
  const _isFull: boolean = ring.isFull;
  const _front: number | undefined = ring.front;
  const _back: number | undefined = ring.back;
  t.pass('compiles');
});

test('RingBuffer<V>: mutation and access types', t => {
  const ring = new RingBuffer<number>();
  const _self: RingBuffer<number> = ring.pushFront(1).pushBack(2).unshift(0).push(3);
  const _front: number | undefined = ring.popFront();
  const _back: number | undefined = ring.popBack();
  const _shifted: number | undefined = ring.shift();
  const _popped: number | undefined = ring.pop();
  const _atValue: number | undefined = ring.at(-1);
  const _self2: RingBuffer<number> = ring.pushValuesFront([1]).pushValuesBack([2]).rotate(1).clear();
  t.pass('compiles');
});

test('RingBuffer<V>: iteration and from types', t => {
  const ring = RingBuffer.from<string>(['a', 'b'], {capacity: 5});
  const _peekF: string | undefined = ring.peekFront();
  const _peekB: string | undefined = ring.peekBack();
  const _iter: IterableIterator<string> = ring[Symbol.iterator]();
  const _rev: Iterable<string> = ring.getReverseIterator();
  t.pass('compiles');
});
