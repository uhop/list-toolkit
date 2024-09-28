import MinHeap from '../src/heap/min-heap.js';
import LeftistHeap from '../src/heap/leftist-heap.js';
import SkewHeap from '../src/heap/skew-heap.js';

const data = Array.from({length: 10_000}, () => Math.random());

export default {
  MinHeap: n => {
    const heap = new MinHeap();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  LeftistHeap: n => {
    const heap = new LeftistHeap();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  },

  SkewHeap: n => {
    const heap = new SkewHeap();
    for (let i = 0; i < n; ++i) {
      for (const value of data) heap.push(value);
      while (!heap.isEmpty) heap.pop();
    }
    return heap;
  }
};
