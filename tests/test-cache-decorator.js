'use strict';

import test from 'tape-six';
import {decorate, decorateMethod, getCache} from 'list-toolkit/cache/decorator.js';
import Cache from 'list-toolkit/cache/cache-lru.js';

test('Cache decorators', t => {

  class Sample {
    static counter = 0;

    m(value) {
      return Sample.counter++;
    }
  }

  const sample = new Sample();
  decorateMethod(sample, 'm', new Cache(3));

  t.equal(sample.m(1), 0);
  t.equal(sample.m(1), 0);

  t.equal(sample.m(2), 1);
  t.equal(sample.m(2), 1);

  t.equal(sample.m(3), 2);
  t.equal(sample.m(3), 2);

  t.equal(sample.m(1), 0);

  t.equal(sample.m(4), 3);
  t.equal(sample.m(4), 3);
  t.equal(sample.m(1), 0);
  t.equal(sample.m(3), 2);

  t.equal(sample.m(2), 4);

  t.equal(getCache(sample, 'm').size, 3);
});
