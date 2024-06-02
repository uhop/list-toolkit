'use strict';

export * from './cache/cache-lru.js';
import Cache from './cache/cache-lru.js';
import decorator from './cache/decorator.js';

export const cacheDecorator = (object, key, Cache = Cache, ...args) => decorator(object, key, Cache, ...args);

export default Cache;
