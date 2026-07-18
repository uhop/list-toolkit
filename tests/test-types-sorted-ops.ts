import test from 'tape-six';
import List from 'list-toolkit/list.js';
import SList from 'list-toolkit/slist.js';
import ValueList from 'list-toolkit/value-list.js';

test('sorted ops: List types', t => {
  interface Item {
    k: number;
    next?: Item;
    prev?: Item;
  }
  const list = new List<Item>();
  const less = (a: Item, b: Item) => a.k < b.k;
  const _ptr = list.insertSorted({k: 1}, less);
  const _self: List<Item> = list.mergeSorted(new List<Item>(), less);
  const _sorted: List<Item> = list.sort(less);
  t.pass('compiles');
});

test('sorted ops: SList types', t => {
  interface Item {
    k: number;
    next?: Item;
  }
  const list = new SList<Item>();
  const less = (a: Item, b: Item) => a.k < b.k;
  const _ptr = list.insertSorted({k: 1}, less);
  const _self: SList<Item> = list.mergeSorted(new SList<Item>(), less);
  t.pass('compiles');
});

test('sorted ops: ValueList types', t => {
  const list = new ValueList<number>();
  const _ptr = list.insertSorted(1, (a, b) => a.value < b.value);
  const _self: ValueList<number> = list.mergeSorted(new ValueList<number>(), (a, b) => a.value < b.value);
  const _sorted: ValueList<number> = list.sort((a, b) => a.value < b.value);
  t.pass('compiles');
});
