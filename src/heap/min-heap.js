import HeapBase from './basics.js';

// the following functions are inlined:

// const left = i => (i << 1) + 1;
// const right = i => (i + 1) << 1;
// const parent = i => (i - 1) >> 1;

const up = (array, i, less = defaultLess) => {
  for (let p = (i - 1) >> 1; i > 0; i = p, p = (i - 1) >> 1) {
    const iValue = array[i],
      pValue = array[p];
    if (!less(iValue, pValue)) break;
    array[i] = pValue;
    array[p] = iValue;
  }
  return array;
};

const down = (array, i, less = defaultLess, n = array.length) => {
  for (;;) {
    const l = (i << 1) + 1;
    if (l >= n) break;
    const r = l + 1,
      c = r < n && less(array[r], array[l]) ? r : l,
      iValue = array[i],
      cValue = array[c];
    if (!less(cValue, iValue)) break;
    array[i] = cValue;
    array[c] = iValue;
    i = c;
  }
  return array;
};

/** Array-based binary min-heap. */
export class MinHeap extends HeapBase {
  /**
   * @param {object} [options] - Ordering options (`less`, `equal`, `compare`).
   * @param {...Iterable} args - Initial arrays or heaps to merge.
   */
  constructor(options, ...args) {
    super(options);
    if (typeof this.compare == 'function') {
      this.less = (a, b) => this.compare(a, b) < 0;
      this.equal = (a, b) => !this.compare(a, b);
    }
    this.array = [];
    if (args.length) this.merge(...args);
  }

  /** The number of elements. */
  get length() {
    return this.array.length;
  }

  /** Whether the heap has no elements. */
  get isEmpty() {
    return !this.array.length;
  }

  /** The minimum element without removing it. */
  get top() {
    return this.array[0];
  }

  /**
   * Alias for `top`.
   * @returns {*} The minimum element.
   */
  peek() {
    return this.array[0];
  }

  /**
   * Remove and return the minimum element.
   * @returns {*} The removed element, or `undefined` if empty.
   */
  pop() {
    // return MinHeap.pop(this.array, this.less); // inlined
    switch (this.array.length) {
      case 0:
        return;
      case 1:
        return this.array.pop();
    }
    const top = this.array[0];
    this.array[0] = this.array.pop();
    // down(this.array, 0, this.less); // inlined
    const n = this.array.length;
    for (let i = 0; ; ) {
      const l = (i << 1) + 1;
      if (l >= n) break;
      const r = l + 1,
        c = r < n && this.less(this.array[r], this.array[l]) ? r : l,
        iValue = this.array[i],
        cValue = this.array[c];
      if (!this.less(cValue, iValue)) break;
      this.array[i] = cValue;
      this.array[c] = iValue;
      i = c;
    }
    return top;
  }

  /**
   * Add an element to the heap.
   * @param {*} value - Element to add.
   * @returns {MinHeap} `this` for chaining.
   */
  push(value) {
    // MinHeap.push(this.array, value, this.less); // inlined
    let i = this.array.length;
    this.array.push(value);
    // up(this.array, i, this.less); // inlined
    for (let p = (i - 1) >> 1; i > 0; i = p, p = (i - 1) >> 1) {
      const iValue = this.array[i],
        pValue = this.array[p];
      if (!this.less(iValue, pValue)) break;
      this.array[i] = pValue;
      this.array[p] = iValue;
    }
    return this;
  }

  /**
   * Push then pop in one operation.
   * @param {*} value - Element to push.
   * @returns {*} The popped element.
   */
  pushPop(value) {
    // return MinHeap.pushPop(this.array, value, this.less); // inlined
    if (!this.array.length || this.less(value, this.array[0])) return value;
    const top = this.array[0];
    this.array[0] = value;
    // down(this.array, 0, this.less); // inlined
    const n = this.array.length;
    for (let i = 0; ; ) {
      const l = (i << 1) + 1;
      if (l >= n) break;
      const r = l + 1,
        c = r < n && this.less(this.array[r], this.array[l]) ? r : l,
        iValue = this.array[i],
        cValue = this.array[c];
      if (!this.less(cValue, iValue)) break;
      this.array[i] = cValue;
      this.array[c] = iValue;
      i = c;
    }
    return top;
  }

  /**
   * Pop then push in one operation.
   * @param {*} value - Element to push.
   * @returns {*} The previously minimum element.
   */
  replaceTop(value) {
    // return MinHeap.replaceTop(this.array, value, this.less); // inlined
    const top = this.array[0];
    this.array[0] = value;
    // down(this.array, 0, this.less); // inlined
    const n = this.array.length;
    for (let i = 0; ; ) {
      const l = (i << 1) + 1;
      if (l >= n) break;
      const r = l + 1,
        c = r < n && this.less(this.array[r], this.array[l]) ? r : l,
        iValue = this.array[i],
        cValue = this.array[c];
      if (!this.less(cValue, iValue)) break;
      this.array[i] = cValue;
      this.array[c] = iValue;
      i = c;
    }
    return top;
  }

  /**
   * Check whether a value exists in the heap.
   * @param {*} value - Value to search for.
   * @returns {boolean} `true` if found.
   */
  has(value) {
    // return MinHeap.has(this.array, value, this.equal); // inlined
    return this.array.findIndex(element => this.equal(element, value)) >= 0;
  }

  /**
   * Find the index of a value.
   * @param {*} value - Value to search for.
   * @returns {number} The index, or `-1` if not found.
   */
  findIndex(value) {
    return this.array.findIndex(element => this.equal(element, value));
  }

  /**
   * Remove a value from the heap.
   * @param {*} value - Value to remove.
   * @returns {MinHeap} `this` for chaining.
   */
  remove(value) {
    MinHeap.remove(this.array, value, this.less, this.equal);
    return this;
  }

  /**
   * Remove an element by its array index.
   * @param {number} index - Index to remove.
   * @returns {MinHeap} `this` for chaining.
   */
  removeByIndex(index) {
    MinHeap.removeByIndex(this.array, index, this.less);
    return this;
  }

  /**
   * Replace a value with a new one.
   * @param {*} value - Value to find.
   * @param {*} newValue - Replacement value.
   * @returns {MinHeap} `this` for chaining.
   */
  replace(value, newValue) {
    MinHeap.replace(this.array, value, newValue, this.less, this.equal);
    return this;
  }

  /**
   * Replace an element at a given index.
   * @param {number} index - Index to replace.
   * @param {*} newValue - Replacement value.
   * @returns {MinHeap} `this` for chaining.
   */
  replaceByIndex(index, newValue) {
    MinHeap.replaceByIndex(this.array, index, newValue, this.less);
    return this;
  }

  /**
   * Re-heapify after the top element has been mutated.
   * @returns {MinHeap} `this` for chaining.
   */
  updateTop() {
    down(this.array, 0, this.less);
    return this;
  }

  /**
   * Re-heapify after an element at a given index has been mutated.
   * @param {number} index - Index of the mutated element.
   * @param {boolean} isDecreased - `true` if the key decreased.
   * @returns {MinHeap} `this` for chaining.
   */
  updateByIndex(index, isDecreased) {
    MinHeap.updateByIndex(this.array, index, isDecreased, this.less);
    return this;
  }

  /**
   * Remove all elements.
   * @returns {MinHeap} `this` for chaining.
   */
  clear() {
    this.array = [];
    return this;
  }

  /**
   * Sort the internal array in place and release it, clearing the heap.
   * @returns {Array} The sorted array.
   */
  releaseSorted() {
    MinHeap.sort(this.array, this.less);
    const array = this.array;
    this.array = [];
    return array;
  }

  /**
   * Merge one or more iterables or heaps into this heap.
   * @param {...Iterable} args - Arrays or MinHeaps to merge.
   * @returns {MinHeap} `this` for chaining.
   */
  merge(...args) {
    if (!args.length) return this;
    this.array = MinHeap.build(
      this.array.concat(
        ...args.map(item => {
          if (item instanceof MinHeap) return item.array;
          if (!item) return [];
          return item;
        })
      ),
      this.less
    );
    return this;
  }

  /**
   * Create a shallow copy of this heap.
   * @returns {MinHeap} A new MinHeap with the same elements.
   */
  clone() {
    const heap = new MinHeap(this);
    heap.array = this.array.slice(0);
    return heap;
  }

  /**
   * Build a heap from an array in place.
   * @param {Array} array - Array to heapify.
   * @param {Function} [less] - Ordering function.
   * @returns {Array} The heapified array.
   */
  static build(array, less = MinHeap.defaults.less) {
    if (array.length <= 1) return array;
    for (let n = array.length, j = (n >> 1) - 1; j >= 0; --j) {
      // down(array, j, less, n); // inlined
      for (let i = j; ; ) {
        const l = (i << 1) + 1;
        if (l >= n) break;
        const r = l + 1,
          c = r < n && less(array[r], array[l]) ? r : l,
          iValue = array[i],
          cValue = array[c];
        if (!less(cValue, iValue)) break;
        array[i] = cValue;
        array[c] = iValue;
        i = c;
      }
    }
    return array;
  }

  /**
   * Pop the minimum from a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {Function} [less] - Ordering function.
   * @returns {*} The removed element.
   */
  static pop(heapArray, less = MinHeap.defaults.less) {
    switch (heapArray.length) {
      case 0:
        return;
      case 1:
        return heapArray.pop();
    }
    const top = heapArray[0];
    heapArray[0] = heapArray.pop();
    down(heapArray, 0, less);
    return top;
  }

  /**
   * Push an item onto a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {*} item - Element to add.
   * @param {Function} [less] - Ordering function.
   * @returns {Array} The heap array.
   */
  static push(heapArray, item, less = MinHeap.defaults.less) {
    const i = heapArray.length;
    heapArray.push(item);
    return up(heapArray, i, less);
  }

  /**
   * Push then pop on a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {*} item - Element to push.
   * @param {Function} [less] - Ordering function.
   * @returns {*} The popped element.
   */
  static pushPop(heapArray, item, less = MinHeap.defaults.less) {
    if (!heapArray.length || less(item, heapArray[0])) return item;
    return MinHeap.replaceTop(heapArray, item, less);
  }

  /**
   * Replace the top of a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {*} item - Replacement element.
   * @param {Function} [less] - Ordering function.
   * @returns {*} The previous top.
   */
  static replaceTop(heapArray, item, less = MinHeap.defaults.less) {
    const top = heapArray[0];
    heapArray[0] = item;
    down(heapArray, 0, less);
    return top;
  }

  /**
   * Check whether a value exists in a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {*} item - Value to search for.
   * @param {Function} [equal] - Equality function.
   * @returns {boolean} `true` if found.
   */
  static has(heapArray, item, equal = MinHeap.defaults.equal) {
    return heapArray.findIndex(element => equal(element, item)) >= 0;
  }

  /**
   * Find the index of a value in a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {*} item - Value to search for.
   * @param {Function} [equal] - Equality function.
   * @returns {number} The index, or `-1` if not found.
   */
  static findIndex(heapArray, item, equal = MinHeap.defaults.equal) {
    return heapArray.findIndex(element => equal(element, item));
  }

  /**
   * Remove an element by index from a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {number} index - Index to remove.
   * @param {Function} [less] - Ordering function.
   * @returns {Array} The heap array.
   */
  static removeByIndex(heapArray, index, less = MinHeap.defaults.less) {
    if (index < 0 || index >= heapArray.length) return this;
    const last = heapArray.length - 1;
    if (index !== last) {
      const item = heapArray[index],
        newItem = (heapArray[index] = heapArray.pop());
      return MinHeap.updateByIndex(heapArray, index, less(newItem, item), less);
    }
    heapArray.pop();
    return heapArray;
  }

  /**
   * Remove a value from a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {*} item - Value to remove.
   * @param {Function} [less] - Ordering function.
   * @param {Function} [equal] - Equality function.
   * @returns {Array} The heap array.
   */
  static remove(heapArray, item, less = MinHeap.defaults.less, equal = MinHeap.defaults.equal) {
    const index = heapArray.findIndex(element => equal(element, item));
    return MinHeap.removeByIndex(heapArray, index, less);
  }

  /**
   * Replace an element at a given index in a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {number} index - Index to replace.
   * @param {*} newItem - Replacement element.
   * @param {Function} [less] - Ordering function.
   * @returns {Array} The heap array.
   */
  static replaceByIndex(heapArray, index, newItem, less = MinHeap.defaults.less) {
    if (index < 0 || index >= heapArray.length) return this;
    const item = heapArray[index];
    heapArray[index] = newItem;
    return MinHeap.updateByIndex(heapArray, index, less(newItem, item), less);
  }

  /**
   * Replace a value in a heap array.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {*} item - Value to find.
   * @param {*} newItem - Replacement value.
   * @param {Function} [less] - Ordering function.
   * @param {Function} [equal] - Equality function.
   * @returns {Array} The heap array.
   */
  static replace(heapArray, item, newItem, less = MinHeap.defaults.less, equal = MinHeap.defaults.equal) {
    const index = heapArray.findIndex(element => equal(element, item));
    return MinHeap.replaceByIndex(heapArray, index, newItem, less);
  }

  /**
   * Re-heapify after an element at a given index has been mutated.
   * @param {Array} heapArray - Heap-ordered array.
   * @param {number} index - Index of the mutated element.
   * @param {boolean} isDecreased - `true` if the key decreased.
   * @param {Function} [less] - Ordering function.
   * @returns {Array} The heap array.
   */
  static updateByIndex(heapArray, index, isDecreased, less = MinHeap.defaults.less) {
    if (index < 0 || index >= heapArray.length) return this;
    return (isDecreased ? up : down)(heapArray, index, less);
  }

  /**
   * Sort a heap array in place (heap sort).
   * @param {Array} heapArray - Heap-ordered array.
   * @param {Function} [less] - Ordering function.
   * @returns {Array} The sorted array.
   */
  static sort(heapArray, less = MinHeap.defaults.less) {
    if (heapArray.length <= 1) return heapArray;
    for (let n = heapArray.length - 1; n; --n) {
      [heapArray[0], heapArray[n]] = [heapArray[n], heapArray[0]];
      down(heapArray, 0, less, n);
    }
    return heapArray;
  }

  /**
   * Build a MinHeap from an existing array.
   * @param {Array} array - Array of elements.
   * @param {object} [options] - Ordering options.
   * @returns {MinHeap} A new MinHeap.
   */
  static from(array, options = MinHeap.defaults) {
    const heap = new MinHeap(options);
    heap.array = MinHeap.build(array, heap.less);
    return heap;
  }
}

export default MinHeap;
