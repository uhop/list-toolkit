import test from 'tape-six';
import CacheClock from 'list-toolkit/cache/cache-clock.js';

test('CacheClock - basics', t => {
  const cache = new CacheClock(3);
  t.equal(cache.size, 0);
  cache.register('a', 1).register('b', 2);
  t.equal(cache.find('a'), 1);
  t.equal(cache.get('b'), 2);
  cache.remove('a');
  t.notOk(cache.has('a'));
  t.equal(cache.size, 1);
  cache.clear();
  t.ok(cache.isEmpty);
  t.equal(cache.hand, null);
});

test('CacheClock - second chance spares referenced entries', t => {
  const cache = new CacheClock(3);
  cache.set('a', 1).set('b', 2).set('c', 3);
  cache.find('a');
  cache.set('d', 4);
  t.ok(cache.has('a'), 'referenced entry got a second chance');
  t.equal(cache.size, 3);
  t.ok(cache.has('d'));
});

test('CacheClock - unreferenced entries evict FIFO-like', t => {
  const cache = new CacheClock(3);
  cache.set('a', 1).set('b', 2).set('c', 3);
  cache.set('d', 4);
  cache.set('e', 5);
  t.equal(cache.size, 3);
  t.ok(cache.has('d'));
  t.ok(cache.has('e'));
});

test('CacheClock - sweep clears bits and converges', t => {
  const cache = new CacheClock(3);
  cache.set('a', 1).set('b', 2).set('c', 3);
  cache.find('a');
  cache.find('b');
  cache.find('c');
  cache.set('d', 4);
  t.equal(cache.size, 3, 'eviction converges even when every entry is referenced');
  cache.set('e', 5).set('f', 6);
  t.equal(cache.size, 3);
});

test('CacheClock - removing the hand entry keeps the ring valid', t => {
  const cache = new CacheClock(3);
  cache.set('a', 1).set('b', 2).set('c', 3);
  cache.set('d', 4); // evicts one entry, hand moves
  const keys = Array.from(cache).map(e => e.key);
  cache.remove(keys[0]);
  cache.remove(keys[1]);
  cache.remove(keys[2]);
  t.ok(cache.isEmpty);
  t.equal(cache.hand, null);
  cache.set('x', 1).set('y', 2);
  t.equal(cache.size, 2);
  t.equal(cache.find('x'), 1);
});

test('CacheClock - re-register updates value and marks referenced', t => {
  const cache = new CacheClock(3);
  cache.set('a', 1).set('b', 2).set('c', 3);
  cache.set('a', 9);
  t.equal(cache.size, 3);
  t.equal(cache.peek('a'), 9);
  cache.set('d', 4);
  t.ok(cache.has('a'), 're-registered entry counts as referenced');
});
