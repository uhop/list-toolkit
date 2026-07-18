import test from 'tape-six';
import CacheLRU from 'list-toolkit/cache/cache-lru.js';
import CacheFIFO from 'list-toolkit/cache/cache-fifo.js';
import CacheLFU from 'list-toolkit/cache/cache-lfu.js';
import CacheRandom from 'list-toolkit/cache/cache-random.js';
import CacheSLRU from 'list-toolkit/cache/cache-slru.js';
import CacheClock from 'list-toolkit/cache/cache-clock.js';

const POLICIES = [CacheLRU, CacheFIFO, CacheLFU, CacheRandom, CacheSLRU, CacheClock];

test('peek - reads without side effects across policies', t => {
  for (const Ctor of POLICIES) {
    const cache = new Ctor(3);
    cache.set('a', 1).set('b', 2);
    t.equal(cache.peek('a'), 1, Ctor.name);
    t.equal(cache.peek('missing'), undefined, Ctor.name);
    t.equal(cache.size, 2, Ctor.name);
  }
});

test('peek - does not promote in LRU', t => {
  const cache = new CacheLRU(3);
  cache.set('a', 1).set('b', 2).set('c', 3);
  cache.peek('a');
  cache.set('d', 4);
  t.notOk(cache.has('a'), 'peeked entry was still evicted as LRU');
  t.ok(cache.has('b'));

  const cache2 = new CacheLRU(3);
  cache2.set('a', 1).set('b', 2).set('c', 3);
  cache2.find('a');
  cache2.set('d', 4);
  t.ok(cache2.has('a'), 'found entry was promoted');
  t.notOk(cache2.has('b'));
});

test('peek - does not count in LFU', t => {
  const cache = new CacheLFU(3);
  cache.set('a', 1).set('b', 2).set('c', 3);
  for (let i = 0; i < 10; ++i) cache.peek('a');
  const entry = Array.from(cache).find(e => e.key === 'a');
  t.equal(entry.counter, 1);
});

test('setCapacity - shrinks with convergence across policies', t => {
  for (const Ctor of POLICIES) {
    const cache = new Ctor(10);
    for (let i = 0; i < 10; ++i) cache.set(i, i);
    t.equal(cache.size, 10, Ctor.name);

    cache.setCapacity(3);
    t.equal(cache.size, 3, `${Ctor.name}: evicted down to the new capacity`);
    t.equal(cache.capacity, 3, Ctor.name);

    cache.set('x', 42);
    t.equal(cache.size, 3, `${Ctor.name}: stays converged after inserts`);
    t.ok(cache.has('x'), Ctor.name);

    cache.setCapacity(5);
    t.equal(cache.size, 3, `${Ctor.name}: growing does not evict`);
    cache.set('y', 1).set('z', 2);
    t.equal(cache.size, 5, Ctor.name);
  }
});

test('setCapacity - LRU evicts the least recently used first', t => {
  const cache = new CacheLRU(4);
  cache.set('a', 1).set('b', 2).set('c', 3).set('d', 4);
  cache.find('a');
  cache.setCapacity(2);
  t.ok(cache.has('a'));
  t.ok(cache.has('d'));
  t.notOk(cache.has('b'));
  t.notOk(cache.has('c'));
});

test('evict - single manual eviction', t => {
  for (const Ctor of POLICIES) {
    const cache = new Ctor(5);
    cache.set('a', 1).set('b', 2).set('c', 3);
    cache.evict();
    t.equal(cache.size, 2, Ctor.name);
    new Ctor(5).evict();
  }
});
