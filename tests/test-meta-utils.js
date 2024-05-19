'use strict';

import test from 'tape-six';
import {copyOptions} from 'list-toolkit/meta-utils.js';

test('utils: copyOptions()', t => {
  t.equal(typeof copyOptions, 'function');

  t.deepEqual(copyOptions({a: 1}, {b: 2, c: 3}), {a: 1, b: 2, c: 3});
  t.deepEqual(copyOptions({a: 1}, {b: 2, c: 3}, {c: 5, d: 4}), {a: 1, b: 2, c: 5});
  t.deepEqual(copyOptions({a: 1}, {b: 2, c: 3}, null, 1, 'z'), {a: 1, b: 2, c: 3});
  t.deepEqual(copyOptions(null, {b: 2, c: 3}, null, 1, 'z'), {b: 2, c: 3});
});
