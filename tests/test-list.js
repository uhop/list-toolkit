'use strict';
import test from 'tape-six';
import List from '../src/List.js';

test('General List tests', t => {
  const numbers = List.from([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    odds = new List(),
    evens = new List();

  for (const value of numbers.getReverseIterable()) {
    if (value & 1) {
      odds.pushFront(value);
    } else {
      evens.pushBack(value);
    }
  }

  numbers.reverse();
  evens.reverse();

  t.deepEqual(Array.from(numbers), [9, 8, 7, 6, 5, 4, 3, 2, 1]);
  t.deepEqual(Array.from(odds), [1, 3, 5, 7, 9]);
  t.deepEqual(Array.from(evens), [2, 4, 6, 8]);

  const oddsAndEvens = new List();

  for (const value of odds) oddsAndEvens.pushBack(value);
  for (const value of evens) oddsAndEvens.pushBack(value);

  t.deepEqual(Array.from(oddsAndEvens), [1, 3, 5, 7, 9, 2, 4, 6, 8]);
  t.deepEqual(Array.from(oddsAndEvens.sort((a, b) => a - b)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});
