'use strict';

export const compareFromLess = lessFn => (a, b) => lessFn(a, b) ? -1 : lessFn(b, a) ? 1 : 0;
export const lessFromCompare = compareFn => (a, b) => compareFn(a, b) < 0;
export const equalFromLess = lessFn => (a, b) => !lessFn(a, b) && !lessFn(b, a);
export const greaterFromLess = lessFn => (a, b) => lessFn(b, a);

export const binarySearch = (sortedArray, lessValueFn, from = 0, to = sortedArray.length) => {
  let left = from,
    right = to;
  while (left < right) {
    const mid = (left + right) >> 1;
    if (lessValueFn(sortedArray[mid])) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return right;
};

export const copyOptions = (target, pattern, ...sources) => {
  target = target || {};
  const keys = Object.keys(pattern);
  for (const key of keys) {
    target[key] = pattern[key];
  }
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    for (const key of keys) {
      if (key in source) target[key] = source[key];
    }
  }
  return target;
};
