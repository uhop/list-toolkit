class Heap {
  constructor(less = (a, b) => a < b, arrayLike) {
    this.less = less;
    this.array = arrayLike ? Heap.make(Array.from(arrayLike), this.less) : [];
  }

  get length() {
    return this.array.length;
  }

  get isEmpty() {
    return !this.array.length;
  }

  get top() {
    return this.array[0];
  }

  clear() {
    this.array = [];
    return this;
  }

  pop() {
    return Heap.pop(this.array, this.less);
  }

  push(value) {
    Heap.push(this.array, value, this.less);
    return this;
  }

  releaseSorted() {
    Heap.sort(this.array, this.less);
    const array = this.array;
    this.array = [];
    return array;
  }

  make() {
    return new Heap(this.less);
  }

  clone() {
    const heap = new Heap(this.less);
    heap.array = this.array.slice(0);
    return heap;
  }

  static make(array, less = (a, b) => a < b) {
    if (array.length <= 1) return array;
    for (let n = array.length, j = (n >> 1) - 1, a, b; j >= 0; --j) {
      for (let i = j, c = (i << 1) + 1; c < n; i = c, c = (i << 1) + 1) {
        b = array[c];
        if (c + 1 < n) {
          a = array[c + 1];
          if (!less(a, b)) {
            ++c;
            b = a;
          }
        }
        a = array[i];
        if (!less(a, b)) break;
        array[c] = a;
        array[i] = b;
      }
    }
    return array;
  }

  static pop(heapArray, less = (a, b) => a < b) {
    const n = heapArray.length - 1;
    if (n > 0) {
      let a = heapArray[n],
        b;
      heapArray[n] = heapArray[0];
      heapArray[0] = a;
      for (let i = 0, c = 1; c < n; i = c, c = (i << 1) + 1) {
        b = heapArray[c];
        if (c + 1 < n) {
          a = heapArray[c + 1];
          if (!less(a, b)) {
            ++c;
            b = a;
          }
        }
        a = heapArray[i];
        if (!less(a, b)) break;
        heapArray[c] = a;
        heapArray[i] = b;
      }
    }
    return heapArray.pop();
  }

  static push(heapArray, b, less = (a, b) => a < b) {
    let i = heapArray.length;
    heapArray.push(b);
    while (i) {
      const p = (i - 1) >> 1,
        a = heapArray[p];
      if (!less(a, b)) break;
      heapArray[i] = a;
      heapArray[p] = b;
      i = p;
    }
    return heapArray;
  }

  static sort(heapArray, less = (a, b) => a < b) {
    if (heapArray.length <= 1) return heapArray;
    for (let n = heapArray.length - 1; n; --n) {
      let a = heapArray[n],
        b;
      heapArray[n] = heapArray[0];
      heapArray[0] = a;
      for (let i = 0, c = 1; c < n; i = c, c = (i << 1) + 1) {
        b = heapArray[c];
        if (c + 1 < n) {
          a = heapArray[c + 1];
          if (!less(a, b)) {
            ++c;
            b = a;
          }
        }
        a = heapArray[i];
        if (!less(a, b)) break;
        heapArray[c] = a;
        heapArray[i] = b;
      }
    }
    return heapArray;
  }
}

export default Heap;
