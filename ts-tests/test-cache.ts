import test from 'tape-six';
import Cache from 'list-toolkit/cache.js';
import {CacheLRU} from 'list-toolkit/cache/cache-lru.js';
import {CacheFIFO} from 'list-toolkit/cache/cache-fifo.js';
import {CacheLFU} from 'list-toolkit/cache/cache-lfu.js';
import {CacheRandom} from 'list-toolkit/cache/cache-random.js';

test('CacheLRU<K,V>: typed key-value operations', t => {
  const cache = new CacheLRU<string, number>(5);

  cache.register('a', 1);
  cache.set('b', 2);
  cache.add('c', 3);

  t.ok(cache.has('a'));

  const val: number | undefined = cache.find('a');
  t.equal(val, 1);

  const val2: number | undefined = cache.get('b');
  t.equal(val2, 2);

  cache.remove('c');
  t.notOk(cache.has('c'));
});

test('CacheLRU<K,V>: iteration yields {key, value}', t => {
  const cache = new CacheLRU<string, number>(5);
  cache.set('x', 10);
  cache.set('y', 20);

  const entries: Array<{key: string; value: number}> = [];
  for (const entry of cache) {
    entries.push(entry);
  }
  t.equal(entries.length, 2);
  t.equal(typeof entries[0].key, 'string');
  t.equal(typeof entries[0].value, 'number');
});

test('CacheLRU<K,V>: getReverseIterator yields {key, value}', t => {
  const cache = new CacheLRU<string, number>(5);
  cache.set('a', 1);
  cache.set('b', 2);

  const entries: Array<{key: string; value: number}> = [];
  for (const entry of cache.getReverseIterator()) {
    entries.push(entry);
  }
  t.equal(entries.length, 2);
});

test('CacheLRU<K,V>: numeric keys', t => {
  const cache = new CacheLRU<number, string>(3);
  cache.set(1, 'one');
  cache.set(2, 'two');

  const val: string | undefined = cache.get(1);
  t.equal(val, 'one');
});

test('CacheFIFO<K,V>: extends CacheLRU', t => {
  const cache = new CacheFIFO<string, number>(3);
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);

  t.equal(cache.size, 3);
  t.ok(cache.has('a'));
});

test('CacheLFU<K,V>: resetCounters', t => {
  const cache = new CacheLFU<string, number>(5);
  cache.set('a', 1);
  cache.set('b', 2);

  cache.find('a');
  cache.find('a');

  cache.resetCounters(1);
  t.equal(cache.size, 2);
});

test('CacheRandom<K,V>: resetIds', t => {
  const cache = new CacheRandom<string, number>(5);
  cache.set('a', 1);
  cache.set('b', 2);

  cache.resetIds();
  t.equal(cache.size, 2);
});

test('Cache default export is CacheLRU', t => {
  const cache = new Cache<string, number>(3);
  cache.set('x', 42);
  t.equal(cache.get('x'), 42);
});
