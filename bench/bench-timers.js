import TimerWheel from '../src/timer-wheel.js';
import IndexedHeap from '../src/heap/indexed-heap.js';

const makeLcg =
  (seed = 42) =>
  () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

const COUNT = 10_000,
  HORIZON = 1_000,
  CHURN = 100_000,
  random = makeLcg(),
  delays = Array.from({length: COUNT}, () => 1 + Math.floor(random() * HORIZON)),
  churnPicks = Array.from({length: CHURN}, () => [Math.floor(random() * COUNT), 1 + Math.floor(random() * HORIZON)]);

const less = (a, b) => a.due < b.due;

export default {
  'schedule+drain: TimerWheel': n => {
    let wheel;
    for (let i = 0; i < n; ++i) {
      wheel = new TimerWheel({slots: 1024});
      for (const delay of delays) wheel.schedule(delay, delay);
      while (!wheel.isEmpty) wheel.tick();
    }
    return wheel;
  },

  'schedule+drain: IndexedHeap': n => {
    let heap;
    for (let i = 0; i < n; ++i) {
      heap = new IndexedHeap({less});
      for (const delay of delays) heap.push({due: delay});
      let now = 0;
      while (!heap.isEmpty) {
        ++now;
        while (heap.top && heap.top.due <= now) heap.pop();
      }
    }
    return heap;
  },

  'reschedule churn: TimerWheel': n => {
    let wheel;
    for (let i = 0; i < n; ++i) {
      wheel = new TimerWheel({slots: 1024});
      const entries = delays.map(delay => wheel.schedule(delay, delay));
      for (const [index, delay] of churnPicks) wheel.reschedule(entries[index], delay);
    }
    return wheel;
  },

  'reschedule churn: IndexedHeap': n => {
    let heap;
    for (let i = 0; i < n; ++i) {
      heap = new IndexedHeap({less});
      const entries = delays.map(delay => {
        const entry = {due: delay};
        heap.push(entry);
        return entry;
      });
      for (const [index, delay] of churnPicks) {
        entries[index].due = delay;
        heap.update(entries[index]);
      }
    }
    return heap;
  }
};
