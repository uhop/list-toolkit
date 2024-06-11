'use strict';

export * from './cache/cache-lru.js';
import Cache from './cache/cache-lru.js';
import decorator from './cache/decorator.js';

export const cacheDecorator = (object, key, cache = new Cache()) => decorator(object, key, cache);

export default Cache;
