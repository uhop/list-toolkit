import test from 'tape-six';
import FreeList from 'list-toolkit/free-list.js';
import ValueList from 'list-toolkit/value-list.js';
import ValueSList from 'list-toolkit/value-slist.js';
import {ValueNode} from 'list-toolkit/list/nodes.js';
import {ValueNode as SValueNode} from 'list-toolkit/slist/nodes.js';

test('FreeList - basics', t => {
  const pool = new FreeList({create: () => ({id: 0})});
  t.ok(pool.isEmpty);
  t.equal(pool.size, 0);

  const a = pool.acquire();
  t.ok(a && typeof a === 'object', 'creates when empty');

  a.id = 42;
  pool.release(a);
  t.equal(pool.size, 1);
  t.notOk(pool.isEmpty);

  const b = pool.acquire();
  t.equal(b, a, 'recycles the released object');
  t.equal(pool.size, 0);
});

test('FreeList - LIFO recycling and iteration', t => {
  const pool = new FreeList(),
    x = {tag: 'x'},
    y = {tag: 'y'};
  pool.release(x).release(y);
  t.deepEqual(
    Array.from(pool).map(node => node.tag),
    ['y', 'x']
  );
  t.equal(pool.acquire(), y);
  t.equal(pool.acquire(), x);
  t.equal(pool.acquire(), undefined, 'pure recycler returns undefined when drained');
});

test('FreeList - reset hook scrubs on release', t => {
  const pool = new FreeList({reset: node => (node.value = null)}),
    node = {value: {big: 'payload'}};
  pool.release(node);
  t.equal(node.value, null, 'payload reference dropped at release time');
});

test('FreeList - capacity bounds the pool', t => {
  const pool = new FreeList({capacity: 2});
  pool.release({}).release({}).release({});
  t.equal(pool.size, 2);
  t.ok(pool.isFull);

  const disabled = new FreeList({capacity: 0});
  disabled.release({});
  t.equal(disabled.size, 0, 'capacity 0 disables pooling');
});

test('FreeList - preallocate and clear', t => {
  let counter = 0;
  const pool = new FreeList({create: () => ({id: ++counter}), capacity: 5});
  pool.preallocate(10);
  t.equal(pool.size, 5, 'preallocation respects capacity');
  t.equal(counter, 5);

  const pooled = Array.from(pool);
  pool.clear();
  t.ok(pool.isEmpty);
  t.ok(
    pooled.every(node => node.next === null),
    'clear scrubs the threading links'
  );
});

test('FreeList - recycles DLL ValueNodes through a ValueList', t => {
  const pool = new FreeList({
    create: () => new ValueNode(null),
    reset: node => (node.value = null),
    prevName: 'prev'
  });
  const list = new ValueList();

  for (let round = 0; round < 3; ++round) {
    for (let i = 0; i < 5; ++i) {
      const node = pool.acquire();
      node.value = round * 5 + i;
      list.pushBackNode(node);
    }
    t.deepEqual(
      Array.from(list),
      Array.from({length: 5}, (_, i) => round * 5 + i),
      `round ${round}`
    );
    while (!list.isEmpty) pool.release(list.popFrontNode());
  }
  t.equal(pool.size, 5, 'steady state: five nodes total were ever created');
});

test('FreeList - recycles SLL ValueNodes through a ValueSList', t => {
  const pool = new FreeList({create: () => new SValueNode(null), reset: node => (node.value = null)});
  const list = new ValueSList();

  for (let round = 0; round < 3; ++round) {
    const node = pool.acquire();
    node.value = round;
    list.pushBackNode(node);
    t.deepEqual(Array.from(list), [round]);
    pool.release(list.popFrontNode());
  }
  t.equal(pool.size, 1);
});

test('FreeList - custom link name via symbol', t => {
  const key = Symbol('pool'),
    pool = new FreeList({nextName: key}),
    node = {next: 'untouched'};
  pool.release(node);
  t.equal(node.next, 'untouched', 'default link property left alone');
  const back = pool.acquire();
  t.equal(back, node);
  t.equal(back[key], null);
});
