import Deque from '../src/deque.js';
import RingBuffer from '../src/ring-buffer.js';

const SIZE = 1_000,
  CYCLES = 10_000,
  data = Array.from({length: SIZE}, (_, i) => i);

// all three share push (back) / shift (front) names
const churn = makeContainer => n => {
  let container;
  for (let i = 0; i < n; ++i) {
    container = makeContainer();
    for (let j = 0; j < CYCLES; ++j) {
      container.push(j);
      container.shift();
    }
  }
  return container;
};

const fillDrain = makeContainer => n => {
  let container;
  for (let i = 0; i < n; ++i) {
    container = makeContainer();
    for (let j = 0; j < CYCLES; ++j) container.push(j);
    while (container.length || container.size) container.shift();
  }
  return container;
};

const makeArray = () => data.slice(),
  makeDeque = () => {
    const deque = new Deque();
    deque.pushValuesBack(data);
    return deque;
  },
  makeRing = () => RingBuffer.from(data);

export default {
  'churn 1k: Array': churn(makeArray),
  'churn 1k: Deque (list)': churn(makeDeque),
  'churn 1k: RingBuffer': churn(makeRing),
  'fill+drain 10k: Array': fillDrain(() => []),
  'fill+drain 10k: Deque (list)': fillDrain(() => new Deque()),
  'fill+drain 10k: RingBuffer': fillDrain(() => new RingBuffer())
};
