import test from 'tape-six';
import Cache from 'list-toolkit/cache.js';
import {CacheLRU} from 'list-toolkit/cache/cache-lru.js';
import {CacheFIFO} from 'list-toolkit/cache/cache-fifo.js';
import {CacheLFU} from 'list-toolkit/cache/cache-lfu.js';
import {CacheRandom} from 'list-toolkit/cache/cache-random.js';

test('CacheLRU<K,V>: constructor and basic property types', t => {
  const cache = new CacheLRU<string, number>(5);
  const _size: number = cache.size;
  const _capacity: number = cache.capacity;
  t.pass('compiles');
});

test('CacheLRU<K,V>: register/set/add/find/get/has/remove types', t => {
  const cache = new CacheLRU<string, number>(5);
  const _self: CacheLRU<string, number> = cache.register('a', 1);
  const _self2: CacheLRU<string, number> = cache.set('b', 2);
  const _self3: CacheLRU<string, number> = cache.add('c', 3);
  const val: number | undefined = cache.find('a');
  const val2: number | undefined = cache.get('b');
  const _has: boolean = cache.has('c');
  const _self4: CacheLRU<string, number> = cache.remove('a');
  const _self5: CacheLRU<string, number> = cache.delete('b');
  const _self6: CacheLRU<string, number> = cache.clear();
  t.pass('compiles');
});

test('CacheLRU<K,V>: iteration yields {key, value}', t => {
  const cache = new CacheLRU<string, number>(5);
  cache.set('x', 10);
  const iter: IterableIterator<{key: string; value: number}> = cache[Symbol.iterator]();
  const revIter: IterableIterator<{key: string; value: number}> = cache.getReverseIterator();
  t.pass('compiles');
});

test('CacheLRU<K,V>: numeric keys, object values', t => {
  const cache = new CacheLRU<number, {name: string}>(3);
  cache.set(1, {name: 'one'});
  const val: {name: string} | undefined = cache.get(1);
  t.pass('compiles');
});

test('CacheFIFO<K,V>: extends CacheLRU types', t => {
  const cache = new CacheFIFO<string, number>(3);
  const _self: CacheFIFO<string, number> = cache.set('a', 1);
  const val: number | undefined = cache.find('a');
  const _size: number = cache.size;
  t.pass('compiles');
});

test('CacheLFU<K,V>: resetCounters type', t => {
  const cache = new CacheLFU<string, number>(5);
  cache.set('a', 1);
  const _self: CacheLFU<string, number> = cache.resetCounters(1);
  const val: number | undefined = cache.find('a');
  t.pass('compiles');
});

test('CacheRandom<K,V>: resetIds type', t => {
  const cache = new CacheRandom<string, number>(5);
  cache.set('a', 1);
  const _self: CacheRandom<string, number> = cache.resetIds();
  const val: number | undefined = cache.find('a');
  t.pass('compiles');
});

test('Cache default export is CacheLRU', t => {
  const cache = new Cache<string, number>(3);
  const _self: Cache<string, number> = cache.set('x', 42);
  const val: number | undefined = cache.get('x');
  t.pass('compiles');
});
