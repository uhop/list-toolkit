'use strict';

import test from 'tape-six';
import Cache from 'list-toolkit/cache.js';

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

  t.deepEqual(Array.from(cache).map(x => x.value), [44, 42]);
  t.deepEqual(Array.from(cache.getReverseIterable()).map(x => x.value), [42, 44]);

  cache.clear();
  t.equal(cache.size, 0);
});

