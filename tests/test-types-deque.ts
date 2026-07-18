import test from 'tape-six';
import Deque from 'list-toolkit/deque.js';
import ValueList from 'list-toolkit/value-list.js';

test('Deque<V>: constructor and basic property types', t => {
  const deque = new Deque<number>();
  const _size: number = deque.size;
  const _isEmpty: boolean = deque.isEmpty;
  const _front: number | undefined = deque.front;
  const _back: number | undefined = deque.back;
  t.pass('compiles');
});

test('Deque<V>: mutation types', t => {
  const deque = new Deque<number>();
  const _self: Deque<number> = deque.pushFront(1).pushBack(2).unshift(0).push(3).add(4).addFront(-1).addBack(5);
  const _front: number | undefined = deque.popFront();
  const _back: number | undefined = deque.popBack();
  const _shifted: number | undefined = deque.shift();
  const _popped: number | undefined = deque.pop();
  const _self2: Deque<number> = deque.pushValuesFront([1, 2]).pushValuesBack([3, 4]);
  const _self3: Deque<number> = deque.rotate(2).rotate(-1).rotate().clear();
  t.pass('compiles');
});

test('Deque<V>: iteration and construction types', t => {
  const deque = new Deque<string>(new ValueList());
  const _fromClass = new Deque<string>(ValueList);
  const _peekF: string | undefined = deque.peekFront();
  const _peekB: string | undefined = deque.peekBack();
  const _iter: IterableIterator<string> = deque[Symbol.iterator]();
  const _rev: IterableIterator<string> | undefined = deque.getReverseIterator();
  t.pass('compiles');
});

test('Deque<V>: from() types', t => {
  const deque: Deque<number> = Deque.from([1, 2, 3]);
  const _onList: Deque<string> = Deque.from(['a'], new ValueList<string>());
  const _onClass: Deque<boolean> = Deque.from([true], ValueList);
  t.pass('compiles');
});
