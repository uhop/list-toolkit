import ValueList from '../src/value-list.js';
import RingBuffer from '../src/ring-buffer.js';
import UnrolledList from '../src/unrolled-list.js';

const SIZE = 10_000;

// pipeline pattern: fill at the back, iterate (sum), drain from the front

export default {
  'pipeline 10k: Array': n => {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      const array = [];
      for (let j = 0; j < SIZE; ++j) array.push(j);
      for (const value of array) sum += value;
      while (array.length) array.shift();
    }
    return sum;
  },

  'pipeline 10k: ValueList': n => {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      const list = new ValueList();
      for (let j = 0; j < SIZE; ++j) list.pushBack(j);
      for (const value of list) sum += value;
      while (!list.isEmpty) list.popFront();
    }
    return sum;
  },

  'pipeline 10k: RingBuffer': n => {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      const ring = new RingBuffer();
      for (let j = 0; j < SIZE; ++j) ring.pushBack(j);
      for (const value of ring) sum += value;
      while (ring.size) ring.popFront();
    }
    return sum;
  },

  'pipeline 10k: UnrolledList': n => {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      const list = new UnrolledList();
      for (let j = 0; j < SIZE; ++j) list.pushBack(j);
      for (const value of list) sum += value;
      while (list.size) list.popFront();
    }
    return sum;
  }
};
