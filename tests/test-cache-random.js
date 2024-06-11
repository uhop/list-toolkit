'use strict';

import test from 'tape-six';
import CacheRandom from 'list-toolkit/cache/cache-random.js';

test('CacheRandom', t => {
  const cache = new CacheRandom(3);
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

  const values = [1, 2, 3, 4].map(key => cache.find(key)),
    def = values.filter(value => value !== undefined),
    undef = values.filter(value => value === undefined);
  t.equal(def.length, 3);
  t.equal(undef.length, 1);

  cache.clear();
  t.equal(cache.size, 0);
  t.ok(cache.isEmpty);
});
