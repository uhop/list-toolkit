'use strict';

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

  t.deepEqual(Array.from(cache).map(value => value.key).sort((a, b) => a - b), [1, 2, 4]);

  cache.remove(2);
  cache.remove(3);

  t.deepEqual(Array.from(cache).map(value => value.key).sort((a, b) => a - b), [1, 4]);

  cache.clear();
  t.equal(cache.size, 0);
  t.ok(cache.isEmpty);
});
