import test from 'tape-six';
import TimerWheel from 'list-toolkit/timer-wheel.js';

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

test('TimerWheel - basics', t => {
  const wheel = new TimerWheel({slots: 8});
  t.ok(wheel.isEmpty);
  t.equal(wheel.size, 0);
  t.equal(wheel.currentTick, 0);
  t.deepEqual(wheel.tick(), []);
  t.equal(wheel.currentTick, 1);

  wheel.schedule('a', 1);
  wheel.schedule('b', 3);
  t.equal(wheel.size, 2);
  t.deepEqual(wheel.tick(), ['a']);
  t.deepEqual(wheel.tick(), []);
  t.deepEqual(wheel.tick(), ['b']);
  t.ok(wheel.isEmpty);
  t.equal(wheel.currentTick, 4);
});

test('TimerWheel - exact delays incl. wrap-around and rounds', t => {
  const wheel = new TimerWheel({slots: 8}),
    fired = [];
  for (const delay of [1, 7, 8, 9, 16, 17, 40]) {
    wheel.schedule(delay, delay);
  }
  for (let now = 1; now <= 48; ++now) {
    for (const value of wheel.tick()) fired.push([value, now]);
  }
  t.deepEqual(
    fired,
    [1, 7, 8, 9, 16, 17, 40].map(d => [d, d])
  );
  t.ok(wheel.isEmpty);
});

test('TimerWheel - same-tick timers fire in scheduling order', t => {
  const wheel = new TimerWheel({slots: 8});
  wheel.schedule('first', 2);
  wheel.schedule('second', 2);
  wheel.schedule('third', 2);
  t.deepEqual(wheel.advance(2), ['first', 'second', 'third']);
});

test('TimerWheel - cancel and isScheduled', t => {
  const wheel = new TimerWheel({slots: 8}),
    keep = wheel.schedule('keep', 3),
    drop = wheel.schedule('drop', 3);
  t.ok(wheel.isScheduled(keep));
  t.ok(wheel.isScheduled(drop));

  t.ok(wheel.cancel(drop));
  t.notOk(wheel.isScheduled(drop));
  t.notOk(wheel.cancel(drop));
  t.equal(wheel.size, 1);

  t.deepEqual(wheel.advance(3), ['keep']);
  t.notOk(wheel.isScheduled(keep));
  t.notOk(wheel.cancel(keep));
});

test('TimerWheel - reschedule moves and revives', t => {
  const wheel = new TimerWheel({slots: 8}),
    entry = wheel.schedule('x', 2);
  wheel.reschedule(entry, 5);
  t.equal(wheel.size, 1);
  t.deepEqual(wheel.advance(2), []);
  t.deepEqual(wheel.advance(3), ['x']);

  wheel.reschedule(entry, 2);
  t.ok(wheel.isScheduled(entry));
  t.equal(wheel.size, 1);
  t.deepEqual(wheel.advance(2), ['x']);
});

test('TimerWheel - remainingTicks', t => {
  const wheel = new TimerWheel({slots: 8}),
    near = wheel.schedule('near', 3),
    far = wheel.schedule('far', 20);
  t.equal(wheel.remainingTicks(near), 3);
  t.equal(wheel.remainingTicks(far), 20);
  wheel.tick();
  t.equal(wheel.remainingTicks(near), 2);
  t.equal(wheel.remainingTicks(far), 19);
  wheel.advance(2);
  t.equal(wheel.remainingTicks(near), undefined);
  t.equal(wheel.remainingTicks(far), 17);
});

test('TimerWheel - delay clamping and iteration', t => {
  const wheel = new TimerWheel({slots: 8});
  wheel.schedule('zero', 0);
  wheel.schedule('negative', -5);
  wheel.schedule('fraction', 2.7);
  t.deepEqual(Array.from(wheel).sort(), ['fraction', 'negative', 'zero']);
  t.deepEqual(wheel.tick().sort(), ['negative', 'zero']);
  t.deepEqual(wheel.tick(), ['fraction']);
});

test('TimerWheel - clear releases handles', t => {
  const wheel = new TimerWheel({slots: 8}),
    a = wheel.schedule('a', 2),
    b = wheel.schedule('b', 12);
  wheel.clear();
  t.ok(wheel.isEmpty);
  t.notOk(wheel.isScheduled(a));
  t.notOk(wheel.isScheduled(b));
  t.deepEqual(wheel.advance(16), []);
  wheel.reschedule(a, 1);
  t.deepEqual(wheel.tick(), ['a']);
});

test('TimerWheel - deterministic stress vs reference', t => {
  const random = makeLcg(),
    wheel = new TimerWheel({slots: 16}),
    live = new Map();
  let now = 0,
    nextId = 0;
  for (let step = 0; step < 3000; ++step) {
    const op = random();
    if (op < 0.45 || !live.size) {
      const id = nextId++,
        delay = 1 + Math.floor(random() * 50);
      live.set(id, {due: now + delay, entry: wheel.schedule(id, delay)});
    } else if (op < 0.6) {
      const ids = [...live.keys()],
        id = ids[Math.floor(random() * ids.length)];
      wheel.cancel(live.get(id).entry);
      live.delete(id);
    } else if (op < 0.75) {
      const ids = [...live.keys()],
        id = ids[Math.floor(random() * ids.length)],
        delay = 1 + Math.floor(random() * 50);
      wheel.reschedule(live.get(id).entry, delay);
      live.get(id).due = now + delay;
    } else {
      ++now;
      const fired = wheel.tick(),
        expected = [...live.entries()].filter(([, record]) => record.due === now).map(([id]) => id);
      t.deepEqual(fired.sort(), expected.sort());
      for (const id of expected) live.delete(id);
    }
  }
  t.equal(wheel.size, live.size);
  while (live.size) {
    ++now;
    for (const id of wheel.tick()) {
      t.equal(live.get(id).due, now);
      live.delete(id);
    }
    t.ok(now < 100000);
  }
  t.ok(wheel.isEmpty);
});
