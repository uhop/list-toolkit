'use strict';

import test from 'tape-six';
import {compareFromLess, lessFromCompare, equalFromLess, greaterFromLess, binarySearch} from '../src/utils.js';

test('utils: compareFromLess()', t => {
  t.equal(typeof compareFromLess, 'function');

  const fromLt = compareFromLess((a, b) => a < b);
  t.ok(fromLt(1, 2) < 0);
  t.ok(fromLt(3, 2) > 0);
  t.ok(fromLt(4, 4) == 0);

  const fromGt = compareFromLess((a, b) => a > b);
  t.ok(fromGt(1, 2) > 0);
  t.ok(fromGt(3, 2) < 0);
  t.ok(fromGt(4, 4) == 0);
});

test('utils: lessFromCompare()', t => {
  t.equal(typeof lessFromCompare, 'function');

  const fromSub = lessFromCompare((a, b) => a - b);
  t.ok(fromSub(1, 2));
  t.notOk(fromSub(3, 2));
  t.notOk(fromSub(4, 4));

  const fromSubSwapped = lessFromCompare((a, b) => b - a);
  t.notOk(fromSubSwapped(1, 2));
  t.ok(fromSubSwapped(3, 2));
  t.notOk(fromSubSwapped(4, 4));
});

test('utils: equalFromLess()', t => {
  t.equal(typeof equalFromLess, 'function');

  const fromLt = equalFromLess((a, b) => a < b);
  t.notOk(fromLt(1, 2));
  t.notOk(fromLt(3, 2));
  t.ok(fromLt(4, 4));

  const fromGt = equalFromLess((a, b) => a > b);
  t.notOk(fromGt(1, 2));
  t.notOk(fromGt(3, 2));
  t.ok(fromGt(4, 4));
});

test('utils: greaterFromLess()', t => {
  t.equal(typeof greaterFromLess, 'function');

  const fromLt = greaterFromLess((a, b) => a < b);
  t.notOk(fromLt(1, 2));
  t.ok(fromLt(3, 2));
  t.notOk(fromLt(4, 4));

  const fromGt = greaterFromLess((a, b) => a > b);
  t.ok(fromGt(1, 2));
  t.notOk(fromGt(3, 2));
  t.notOk(fromGt(4, 4));
});

const isSorted = (array, less = (a, b) => a < b) => {
  for (let i = 1; i < array.length; ++i) {
    if (less(array[i], array[i - 1])) return false;
  }
  return true;
};

test('utils: binarySearch()', t => {
  t.equal(typeof binarySearch, 'function');

  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  t.ok(isSorted(array));

  t.equal(binarySearch(array, x => x < 5), 4);
  t.equal(binarySearch(array, x => x < -5), 0);
  t.equal(binarySearch(array, x => x < 55), 10);

  {
    const array = [];
    for (let i = 0; i < 100; ++i) {
      const value = Math.random();
      array.splice(binarySearch(array, x => x < value), 0, value);
    }
    t.equal(array.length, 100);
    t.ok(isSorted(array));
  }
});
