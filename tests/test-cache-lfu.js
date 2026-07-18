import test from 'tape-six';
import CacheLFU from 'list-toolkit/cache/cache-lfu.js';

test('CacheLFU', t => {
  const cache = new CacheLFU(3);
  t.equal(cache.size, 0);
  t.equal(cache.capacity, 3);
  t.equal(cache.find(1), undefined);

  cache.register(1, 41);
  t.equal(cache.size, 1);
  t.equal(cache.find(1), 41);

  cache.register(2, 42);
  t.equal(cache.size, 2);
  t.equal(cache.find(2), 42);
  t.equal(cache.find(1), 41);

  cache.register(3, 43);
  t.equal(cache.size, 3);
  t.equal(cache.find(3), 43);
  t.equal(cache.find(2), 42);
  t.equal(cache.find(1), 41);

  cache.register(4, 44);
  t.equal(cache.size, 3);
  t.equal(cache.find(4), 44);
  t.equal(cache.find(3), undefined);
  t.equal(cache.find(2), 42);
  t.equal(cache.find(1), 41);

  t.deepEqual(
    Array.from(cache)
      .map(value => value.key)
      .sort((a, b) => a - b),
    [1, 2, 4]
  );

  cache.remove(2);
  cache.remove(3);

  t.deepEqual(
    Array.from(cache)
      .map(value => value.key)
      .sort((a, b) => a - b),
    [1, 4]
  );

  cache.clear();
  t.equal(cache.size, 0);
  t.ok(cache.isEmpty);
});

test('CacheLFU - exact eviction under post-insertion access', t => {
  const cache = new CacheLFU(3);
  cache.register('a', 1);
  cache.register('b', 2);
  cache.register('c', 3);
  for (let i = 0; i < 100; ++i) cache.find('a');
  cache.register('d', 4);
  t.ok(cache.has('a'));
  t.notOk(cache.has('b'));
  t.ok(cache.has('c'));
  t.ok(cache.has('d'));
});

test('CacheLFU - LRU tie-break among least frequent', t => {
  const cache = new CacheLFU(2);
  cache.register('x', 1);
  cache.register('y', 2);
  cache.register('z', 3);
  t.notOk(cache.has('x'));
  t.ok(cache.has('y'));
  t.ok(cache.has('z'));
});

test('CacheLFU - iteration in ascending frequency order', t => {
  const cache = new CacheLFU(3);
  cache.register('a', 1);
  cache.register('b', 2);
  cache.register('c', 3);
  cache.find('b');
  cache.find('c');
  cache.find('c');
  t.deepEqual(
    Array.from(cache).map(entry => entry.counter),
    [1, 2, 3]
  );
  t.deepEqual(
    Array.from(cache).map(entry => entry.key),
    ['a', 'b', 'c']
  );
  t.deepEqual(
    Array.from(cache.getReverseIterator()).map(entry => entry.key),
    ['c', 'b', 'a']
  );
});

test('CacheLFU - re-register resets frequency', t => {
  const cache = new CacheLFU(2);
  cache.register('k', 1);
  for (let i = 0; i < 5; ++i) cache.find('k');
  cache.register('k', 9);
  t.equal(cache.find('k'), 9);
  const entry = Array.from(cache).find(e => e.key === 'k');
  t.equal(entry.counter, 2);
});

test('CacheLFU - resetCounters', t => {
  const cache = new CacheLFU(3);
  cache.register('a', 1);
  cache.register('b', 2);
  cache.register('c', 3);
  cache.find('a');
  cache.find('a');
  cache.find('b');
  cache.resetCounters();
  t.deepEqual(
    Array.from(cache).map(entry => entry.counter),
    [1, 1, 1]
  );
  cache.register('d', 4);
  t.equal(cache.size, 3);
  t.ok(cache.has('a'));
  t.ok(cache.has('b'));
  t.notOk(cache.has('c'));
  t.ok(cache.has('d'));
});
