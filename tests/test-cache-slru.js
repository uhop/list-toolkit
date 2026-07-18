import test from 'tape-six';
import CacheSLRU from 'list-toolkit/cache/cache-slru.js';

test('CacheSLRU - basics', t => {
  const cache = new CacheSLRU(3);
  t.equal(cache.size, 0);
  t.equal(cache.capacity, 3);
  cache.register('a', 1).register('b', 2);
  t.equal(cache.find('a'), 1);
  t.equal(cache.get('b'), 2);
  t.equal(cache.size, 2);
  cache.remove('a');
  t.equal(cache.size, 1);
  t.notOk(cache.has('a'));
  cache.clear();
  t.ok(cache.isEmpty);
  t.equal(cache.protectedSize, 0);
});

test('CacheSLRU - promotion on hit', t => {
  const cache = new CacheSLRU(4, 2);
  cache.set('a', 1).set('b', 2);
  t.equal(cache.protectedSize, 0);
  cache.find('a');
  t.equal(cache.protectedSize, 1);
  cache.find('a');
  t.equal(cache.protectedSize, 1, 'protected hit does not double-promote');
  cache.find('b');
  t.equal(cache.protectedSize, 2);
});

test('CacheSLRU - scan resistance', t => {
  const cache = new CacheSLRU(4, 2);
  cache.set('hot1', 1).set('hot2', 2);
  cache.find('hot1');
  cache.find('hot2');
  t.equal(cache.protectedSize, 2);

  for (let i = 0; i < 20; ++i) cache.set(`scan${i}`, i);
  t.ok(cache.has('hot1'), 'protected entry survives a scan');
  t.ok(cache.has('hot2'), 'protected entry survives a scan');
  t.equal(cache.size, 4);
});

test('CacheSLRU - protected overflow demotes its LRU', t => {
  const cache = new CacheSLRU(6, 2);
  cache.set('a', 1).set('b', 2).set('c', 3);
  cache.find('a');
  cache.find('b');
  t.equal(cache.protectedSize, 2);
  cache.find('c');
  t.equal(cache.protectedSize, 2, 'protected stays at capacity');
  const entries = Array.from(cache);
  t.ok(
    entries.find(e => e.key === 'a' && !e.protected),
    'protected LRU was demoted to probation'
  );
  t.ok(entries.find(e => e.key === 'c' && e.protected));
});

test('CacheSLRU - eviction prefers probation, falls back to protected', t => {
  const cache = new CacheSLRU(2, 2);
  cache.set('a', 1).set('b', 2);
  cache.find('a');
  cache.find('b');
  t.equal(cache.protectedSize, 2, 'everything protected');
  cache.set('c', 3);
  t.equal(cache.size, 2, 'evicted from protected when probation is empty');
  t.ok(cache.has('c'));
});

test('CacheSLRU - re-register updates value', t => {
  const cache = new CacheSLRU(3);
  cache.set('k', 1);
  cache.set('k', 9);
  t.equal(cache.size, 1);
  t.equal(cache.peek('k'), 9);
});
