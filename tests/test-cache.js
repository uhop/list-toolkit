import test from 'tape-six';
import Cache from 'list-toolkit/cache.js';
import CacheLFU from 'list-toolkit/cache/cache-lfu.js';
import CacheRandom from 'list-toolkit/cache/cache-random.js';

test('Cache', t => {
  const cache = new Cache(3);

  t.equal(cache.size, 0);
  t.equal(cache.capacity, 3);
  t.equal(cache.find(1), undefined);

  cache.register(1, 41);
  t.equal(cache.size, 1);
  t.equal(cache.find(1), 41);

  cache.register(1, 41).register(2, 42).register(3, 43);
  t.equal(cache.size, 3);
  t.equal(cache.find(1), 41);
  t.equal(cache.find(2), 42);
  t.equal(cache.find(3), 43);
  t.equal(cache.find(4), undefined);

  cache.register(4, 44);
  t.equal(cache.size, 3);
  t.equal(cache.find(1), undefined);
  t.equal(cache.find(2), 42);
  t.equal(cache.find(3), 43);
  t.equal(cache.find(4), 44);
  t.equal(cache.list.front.value.value, 44);
  t.equal(cache.list.back.value.value, 42);

  cache.remove(3);
  t.equal(cache.size, 2);
  t.equal(cache.find(1), undefined);
  t.equal(cache.find(2), 42);
  t.equal(cache.find(3), undefined);
  t.equal(cache.find(4), 44);
  t.equal(cache.list.front.value.value, 44);
  t.equal(cache.list.back.value.value, 42);

  t.deepEqual(
    Array.from(cache).map(x => x.value),
    [44, 42]
  );
  t.deepEqual(
    Array.from(cache.getReverseIterator()).map(x => x.value),
    [42, 44]
  );

  cache.clear();
  t.equal(cache.size, 0);
});

test('CacheLFU', t => {
  const cache = new CacheLFU(3);

  cache.register('a', 1).register('b', 2).register('c', 3);
  t.equal(cache.size, 3);
  t.equal(cache.find('a'), 1);
  t.equal(cache.find('b'), 2);
  t.equal(cache.find('c'), 3);

  cache.register('d', 4);
  t.equal(cache.size, 3);
  t.ok(cache.has('d'));

  cache.remove('d');
  t.equal(cache.size, 2);
  t.equal(cache.find('d'), undefined);

  cache.clear();
  t.equal(cache.size, 0);
});

test('CacheLFU.resetCounters()', t => {
  const cache = new CacheLFU(3);
  cache.register('a', 1).register('b', 2).register('c', 3);
  cache.find('a');
  cache.find('a');

  cache.resetCounters(1);

  const counters = [];
  for (const item of cache.heap.array) {
    counters.push(item.value.counter);
  }
  t.ok(counters.every(c => c === 1));
});

test('CacheRandom', t => {
  const cache = new CacheRandom(3);

  cache.register('a', 1).register('b', 2).register('c', 3);
  t.equal(cache.size, 3);
  t.equal(cache.find('a'), 1);
  t.equal(cache.find('b'), 2);
  t.equal(cache.find('c'), 3);

  cache.register('d', 4);
  t.equal(cache.size, 3);
  t.ok(cache.has('d'));

  cache.clear();
  t.equal(cache.size, 0);
});

test('CacheRandom.resetIds()', t => {
  const cache = new CacheRandom(3);
  cache.register('a', 1).register('b', 2).register('c', 3);

  cache.resetIds();

  const ids = new Set();
  for (const item of cache.heap.array) {
    ids.add(item.value.id);
  }
  t.equal(ids.size, 3);
  t.ok([...ids].every(id => typeof id === 'number' && id >= 0 && id < 3));
});
