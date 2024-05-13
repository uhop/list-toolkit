'use strict';

const unit = require('heya-unit');

const List = require('../cjs/List.js').default;

const listToArray = list => Array.from(list);

unit.add(module, [
  function test_list(t) {
    const nums = List.from([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      odds = new List(),
      evens = new List();

    for (const value of nums.getReverseIterable()) {
      if (value & 1) {
        odds.pushFront(value);
      } else {
        evens.pushBack(value);
      }
    }

    nums.reverse();
    evens.reverse();

    eval(t.TEST('t.unify(Array.from(nums), [9, 8, 7, 6, 5, 4, 3, 2, 1])'));
    eval(t.TEST('t.unify(Array.from(odds), [1, 3, 5, 7, 9])'));
    eval(t.TEST('t.unify(Array.from(evens), [2, 4, 6, 8])'));

    const oddsAndEvens = new List();

    for (const value of odds) oddsAndEvens.pushBack(value);
    for (const value of evens) oddsAndEvens.pushBack(value);

    eval(t.TEST('t.unify(Array.from(oddsAndEvens), [1, 3, 5, 7, 9, 2, 4, 6, 8])'));
    eval(t.TEST('t.unify(Array.from(oddsAndEvens.sort((a, b) => a - b)), [1, 2, 3, 4, 5, 6, 7, 8, 9])'));
  }
]);
