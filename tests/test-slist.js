'use strict';
import test from 'tape-six';
import SList from '../src/SList.js';

test('General SList tests', t => {
  const numbers = SList.from([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    odds = new SList(),
    evens = new SList();

  for (const value of numbers) {
    if (value & 1) {
      odds.pushFront(value);
    } else {
      evens.pushFront(value);
    }
  }

  numbers.reverse();
  odds.reverse();
  evens.reverse();

  t.deepEqual(Array.from(numbers), [9, 8, 7, 6, 5, 4, 3, 2, 1]);
  t.deepEqual(Array.from(odds), [1, 3, 5, 7, 9]);
  t.deepEqual(Array.from(evens), [2, 4, 6, 8]);

  const oddsAndEvens = new SList();

  for (const value of odds) oddsAndEvens.pushFront(value);
  for (const value of evens) oddsAndEvens.pushFront(value);
  oddsAndEvens.reverse();

  t.deepEqual(Array.from(oddsAndEvens), [1, 3, 5, 7, 9, 2, 4, 6, 8]);
  t.deepEqual(Array.from(oddsAndEvens.sort((a, b) => a - b)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});
