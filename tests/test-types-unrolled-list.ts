import test from 'tape-six';
import UnrolledList from 'list-toolkit/unrolled-list.js';

test('UnrolledList<V>: constructor and basic property types', t => {
  const list = new UnrolledList<number>({chunkSize: 32});
  const _size: number = list.size;
  const _chunkSize: number = list.chunkSize;
  const _isEmpty: boolean = list.isEmpty;
  const _front: number | undefined = list.front;
  const _back: number | undefined = list.back;
  t.pass('compiles');
});

test('UnrolledList<V>: mutation and access types', t => {
  const list = new UnrolledList<number>();
  const _self: UnrolledList<number> = list.pushFront(1).pushBack(2).unshift(0).push(3);
  const _front: number | undefined = list.popFront();
  const _back: number | undefined = list.popBack();
  const _shifted: number | undefined = list.shift();
  const _popped: number | undefined = list.pop();
  const _atValue: number | undefined = list.at(-1);
  const _self2: UnrolledList<number> = list.pushValuesFront([1]).pushValuesBack([2]).clear();
  t.pass('compiles');
});

test('UnrolledList<V>: iteration and from types', t => {
  const list = UnrolledList.from<string>(['a', 'b'], {chunkSize: 16});
  const _peekF: string | undefined = list.peekFront();
  const _peekB: string | undefined = list.peekBack();
  const _iter: IterableIterator<string> = list[Symbol.iterator]();
  const _rev: Iterable<string> = list.getReverseIterator();
  t.pass('compiles');
});
