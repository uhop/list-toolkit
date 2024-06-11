'use strict';

import test from 'tape-six';
import {isNTList} from 'list-toolkit/nt-utils.js';

test('isNTList()', t => {
  t.equal(typeof isNTList, 'function');
  t.ok(isNTList(null));
  t.notOk(isNTList({}));

  const circular = {};
  circular.n = circular;

  t.notOk(isNTList(circular, {nextName: 'n'}));

  const node = {nx: null};
  t.ok(isNTList(node, {nextName: 'nx'}));
});
