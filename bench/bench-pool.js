import ValueList from '../src/value-list.js';
import {ValueNode} from '../src/list/nodes.js';
import FreeList from '../src/free-list.js';

const SIZE = 1_000,
  CYCLES = 10_000;

export default {
  'churn: fresh nodes': n => {
    let list;
    for (let i = 0; i < n; ++i) {
      list = new ValueList();
      for (let j = 0; j < SIZE; ++j) list.pushBack(j);
      for (let j = 0; j < CYCLES; ++j) {
        list.popFrontNode();
        list.pushBack(j);
      }
    }
    return list;
  },

  'churn: pooled nodes': n => {
    let list;
    for (let i = 0; i < n; ++i) {
      const pool = new FreeList({create: () => new ValueNode(null), reset: node => (node.value = null), prevName: 'prev'});
      list = new ValueList();
      for (let j = 0; j < SIZE; ++j) {
        const node = pool.acquire();
        node.value = j;
        list.pushBackNode(node);
      }
      for (let j = 0; j < CYCLES; ++j) {
        pool.release(list.popFrontNode());
        const node = pool.acquire();
        node.value = j;
        list.pushBackNode(node);
      }
    }
    return list;
  }
};
