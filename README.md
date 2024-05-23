# List toolkit [![NPM version][npm-img]][npm-url]

[npm-img]: https://img.shields.io/npm/v/list-toolkit.svg
[npm-url]: https://npmjs.org/package/list-toolkit

List-based **efficient** data structures to organize your objects.
This is a pure JavaScript module with no dependencies
suitable to use in all environments including browsers.

The toolkit provides the following data structures with a full set of efficiently implemented operations:

* Doubly linked circular lists:
  * **List**: a list that uses custom properties on external objects to link them around.
    * Using different custom properties the same object can be linked in different ways.
  * **ValueList**: a doubly linked list implemented as a container, which can hold/reference external values.
    * Based on `List`.
  * **ExtList**: an external handler of a headless list.
* Singly linked lists:
  * **SList**: a list that uses custom properties on external objects to link them around.
    * Using different custom properties the same object can be linked in different ways.
    * Based on `SList`.
  * **ValueSList**: a singly linked list implemented as a container, which can hold/reference external values.
* **Cache**: a `ValueList`-based container with a specified capacity and an LRU policy of evicting old entries.
* **MinHeap**: a classic heap data structure (a priority queue).

All lists can be used without the toolkit. Your existing lists, either doubly or singly linked,
can be used. The toolkit provides a few utilities that you would write yourself if you wanted to use them.

The implementation philosophy was very simple:

* Flexibility, efficiency, and simplicity.
* No dependencies. No unexpected surprises.
* You never pay for what you don't use.
* Suitable for all environments.
* Should be usable with already existing lists.
* Could be used as a foundation for other list-based data structures.

All lists support similar intuitive interfaces:

* Creating from existing objects.
* Adding, inserting, extracting and removing nodes.
* Forward and reverse iterators.
* General manipulations like reversing and sorting.
* Link names for the next and previous links (for doubly linked lists) are customizable.

All facilities are efficient, well-debugged, and battle-tested.

## Installation

```bash
npm install list-toolkit
```

## Usage

The full documentation is available in the project's [wiki](https://github.com/uhop/list-toolkit/wiki). Below is a cheat sheet of the API.

The concepts of pointers and ranges are explained at the end of this document.

### List (list.js)

`List` implements a circular doubly linked list with customizable names of "next" and "prev" links.
Any strings or symbols can be used. The defaults are `"next"` and `"prev"` respectively.

Internally `List` is implemented as a special head node and the whole list is circular.

```js
import List from 'list-toolkit/list.js';
// or
// const List = require('list-toolkit/list.js').default; // CJS

// sample data
const a = {x: 1}, b = {x: 2}, c = {x: 3};

// the main list with default link names
const list = new List.from([a, b, c]);

// iterate over the list
for (const node of list) {
  console.log(node.x); // 1, 2, 3
}

// iterate manually
for (let node = list.front; node !== list; node = node.next) {
  console.log(node.x); // 1, 2, 3
}

// iterate in reverse order
for (const node of list.getReverseIterator()) {
  console.log(node.x); // 3, 2, 1
}

// auxiliary lists with custom link names
const odd = new List({nextName: 'nextOdd', prevName: 'prevOdd'}),
  even = new List({nextName: Symbol(), prevName: Symbol()});

// let's populate them
for (const node of list) {
  (node.x % 2 ? odd : even).pushBack(node);
}

// let's reverse the odd list
odd.reverse();

// let's iterate over them
for (const node of odd) console.log(node.x); // 3, 1
for (const node of even) console.log(node.x); // 2

// let's drop the last odd node:
odd.popBack();
for (let node = odd.front; node !== odd; node = node.nextOdd) {
  console.log(node.x); // 3
}

// the main list is unchanged
console.log(Array.from(list).map(n => n.x)); // [1, 2, 3]

// let's iterate manually using a range
let node = a;
do {
  console.log(node.x);
  node = node.next;
} while (node !== c);
// 1, 2

const extracted = list.extract({from: b, to: c});
console.log(Array.from(extracted).map(n => n.x)); // [2, 3]
console.log(Array.from(list).map(n => n.x)); // [1]
```

As you can see, the API is very simple and intuitive. Objects are used directly as nodes.
They can be used directly for manual iterations or to specify ranges.

If you want to use a list as a container, you can use `ValueList` or `ValueSList` instead.
This way you can keep numbers, strings and other primitives in the same list.
Objects that in the link are not unmodified.

The main inspection operations are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new List(options)` | create a new List | *O(1)* |
| `List.from(values, options)` | create a new List from an iterable | *O(k)* |
| `isEmpty` | check if the list is empty | *O(1)* |
| `front` | get the first node | *O(1)* |
| `back` | get the last node | *O(1)* |
| `getLength()` | get the length of the list | *O(n)* |

The simple manipulations are (all *O(1)*):

| Method | Description | Complexity |
|------|-----------|-----|
| `pushFront(value)` | add a new node at the beginning | *O(1)* |
| `pushBack(value)` | add a new node at the end | *O(1)* |
| `popFront()` | remove and return the first element | *O(1)* |
| `popBack()` | remove and return the last element | *O(1)* |
| `appendFront(list)` | add a list at the beginning | *O(1)* |
| `appendBack(list)` | add a list at the end | *O(1)* |
| `moveToFront(node)` | move a node to the front | *O(1)* |
| `moveToBack(node)` | move a node to the back | *O(1)* |

Removing:

| Method | Description | Complexity |
|------|-----------|-----|
| `removeNode(node)` | remove and return a node | *O(1)* |
| `removeRange(range, drop)` | remove nodes | |
| `removeRange(range, false)` | remove nodes | *O(1)* |
| `removeRange(range, true)` | remove and isolate nodes | *O(k)* |
| `clear(drop)` | remove all nodes |  |
| `clear(false)` | remove all nodes | *O(1)* |
| `clear(true)` | remove and isolate all nodes | *O(k)* |

The extraction methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `extractRange(range)` | extract a range of nodes | *O(1)* |
| `extractBy(condition)` | extract nodes by a condition | *O(n)* |

The list-wide manipulation methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `reverse()` | reverse the list | *O(n)* |
| `sort(lessFn)` | sort the list | *O(n * log(n))* |

Iterators are:

| Method | Description | Complexity |
|------|-----------|-----|
| `[Symbol.iterator]()` | the default iterator | *O(1)* |
| `getNodeIterator(range)` | create an iterator with an optional range | *O(1)* |
| `getIterator(range)` | an alias of `getNodeIterator(range)` | *O(1)* |
| `getPtrIterator(range)` | create a pointer iterator with an optional range | *O(1)* |
| `getReverseNodeIterator(range)` | create a reverse iterator with an optional range | *O(1)* |
| `getReverseIterator(range)` | an alias of `getReverseNodeIterator(range)` | *O(1)* |
| `getReversePtrIterator(range)` | create a reverse pointer iterator with an optional range | *O(1)* |

For more details and to learn about other methods, see the [wiki](https://github.com/uhop/list-toolkit/wiki).

### ValueList (value-list.js)

`ValueList` is a specialization of `List` that holds values instead of nodes. Internally, it uses `ValueNode` objects with the `value` property to store the values.

It supports the same operations as `List`. The difference is:

* `pushFront(value)` and `pushBack(value)` take values and `ValueNode` objects as nodes.
* `popFront()` and `popBack()` return values, not nodes.
* The default iterator, `getValueIterator(range)` and `getReverseValueIterator(range)` return values, not nodes.
* `getIterator(range)` is an alias of `getValueIterator(range)`.
* `getReverseIterator(range)` is an alias of `getReverseValueIterator(range)`.

```js
import ValueList from 'list-toolkit/value-list.js';
// or
// const ValueList = require('list-toolkit/value-list.js').default; // CJS

const list = ValueList.from([1, 2, 3]);

console.log(Array.from(list)); // [1, 2, 3]

for (const value of list) {
  console.log(value); // 1, 2, 3
}

for (let node = list.front; node !== list; node = node.next) {
  console.log(node.value); // 1, 2, 3
}

for (let node = list.back; node !== list; node = node.prev) {
  console.log(node.value); // 3, 2, 1
}

for (const value of list.getReverseValueIterator()) {
  console.log(value); // 3, 2, 1
}
```

### ExtList (ext-list.js)

While `List` implemented as a head node, `ExtList` is implemented as a pointer
to an external headless circular list. It can be added and removed from the outside
at any point. When attached it provides a rich functionality that is similar to `List`'s pointer.

```js
import ExtList from 'list-toolkit/circular-list.js';
// or
// const ExtList = require('list-toolkit/circular-list.js').default; // CJS

import ValueList, {ValueNode} from 'list-toolkit/value-list.js';

const detachedList = ValueList.from([1, 2, 3]).releaseRawList();

let node = detachedList.front;
do {
  console.log(node.value);
  node = node.next;
} while (node !== detachedList);
// 1, 2, 3

const list = new ExtList(detachedList);

for (const node of list) {
  console.log(node.value); // 1, 2, 3
}

// list points to 1, we add 4 before 1 in a circular list
// effectively it adds 4 after 1
list.addBefore(node, new ValueNode(4));

console.log(Array.from(list.getReverseIterator())); // [4, 3, 2, 1]

// let's move list to 2, add 2.5 after 2, and move back to 1
list.next();
const ptr = list.addAfter(node, new ValueNode(2.5));
list.prev();
console.log(Array.from(list)); // [1, 2, 2.5, 3, 4]

// let's remove 2.5 using its pointer
list.removeNode(ptr);
console.log(Array.from(list)); // [1, 2, 3, 4]
```

The main inspection operations are:

| Method | Description | Complexity |
|------|-----------|-----|
| `ExtList(head, options)` | attach an external circular list | *O(1)* |
| `isEmpty()` | check if the list is empty (unattached) | *O(1)* |
| `front` | get the front node | *O(1)* |
| `back` | get the last node | *O(1)* |
| `getLength()` | get the length | *O(n)* |

The pointer manipulation methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `attach(head)` | attach an external circular list | *O(1)* |
| `detach()` | detach the external circular list | *O(1)* |
| `next()` | move the pointer forward | *O(1)* |
| `prev()` | move the pointer backward | *O(1)* |

The removal methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `remove()` | remove the current node and move forward | *O(1)* |
| `removeNode(node)` | remove a node | *O(1)* |
| `removeNodeBefore(node)` | remove a node before the current one | *O(1)* |
| `removeNodeAfter(node)` | remove a node after the current one | *O(1)* |
| `removeRange(range, drop)` | remove a range of nodes | |
| `removeRange(range, false)` | remove a range of nodes | *O(1)* |
| `removeRange(range, true)` | remove and isolate nodes | *O(k)* |
| `clear(drop)` | clear the list | |
| `clear(false)` | clear the list | *O(1)* |
| `clear(true)` | clear the list and isolate nodes | *O(n)* |

The insertion methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `addBefore(node)` | add a node before the current one | *O(1)* |
| `addAfter(node)` | add a node after the current one | *O(1)* |
| `insertBefore(list)` | insert a list before the current node | *O(1)* |
| `insertAfter(list)` | insert a list after the current node | *O(1)* |

The simple manipulation methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `moveBefore(node)` | move a node before the current one | *O(1)* |
| `moveAfter(node)` | move a node after the current one | *O(1)* |

The extraction methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `extractRange(range)` | extract a range of nodes | *O(1)* |
| `extractBy(condition)` | extract nodes that satisfy the condition | *O(n)* |

The list-wide manipulation methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `reverse()` | reverse the list | *O(n)* |
| `sort(lessFn)` | sort the list | *O(n * log(n))* |

Iterators are:

| Method | Description | Complexity |
|------|-----------|-----|
| `[Symbol.iterator]()` | the default iterator | *O(1)* |
| `getNodeIterator(range)` | create an iterator with an optional range | *O(1)* |
| `getIterator(range)` | an alias of `getNodeIterator(range)` | *O(1)* |
| `getPtrIterator(range)` | create a pointer iterator with an optional range | *O(1)* |
| `getReverseNodeIterator(range)` | create a reverse iterator with an optional range | *O(1)* |
| `getReverseIterator(range)` | an alias of `getReverseNodeIterator(range)` | *O(1)* |
| `getReversePtrIterator(range)` | create a reverse pointer iterator with an optional range | *O(1)* |

### SList (slist.js)

`SList` is modelled after `List` but being implemented as a circular singly linked list.
It supports a customizable name of "next". Any strings or symbols can be used.
The default is `"next"`.

Internally `SList` is implemented as a special head node and the whole list is circular.

Being a singly linked list, some `List` operations are not supported due to the efficiency concerns.
For example, it doesn't provide reverse iterations and `popBack()`,
and some method signatures are different:

| Method | Description | Complexity |
|------|-----------|-----|
| `moveToFront(ptr)` | move a node to the front | *O(1)* |
| `moveToBack(ptr)` | move a node to the back | *O(1)* |
| `removeNode(ptr)` | remove a node | *O(1)* |
| `removeRange(ptrRange, drop)` | remove a range of nodes | |
| `removeRange(ptrRange, false)` | remove a range of nodes | *O(1)* |
| `removeRange(ptrRange, true)` | remove and isolate nodes | *O(k)* |
| `extractRange(ptrRange)` | extract a range of nodes | *O(1)* |
| `getPtrIterator(ptrRange)` | create a pointer iterator with an optional range | *O(1)* |

Let's recreate the initial example with `SList`:

```js
import SList from 'list-toolkit/slist.js';
// or
// const SList = require('list-toolkit/slist.js').default; // CJS

// sample data
const a = {x: 1}, b = {x: 2}, c = {x: 3};

// the main list with default link names
const list = new SList.from([a, b, c]);

// iterate over the list
for (const node of list) {
  console.log(node.x); // 1, 2, 3
}

// iterate manually
for (let node = list.front; node !== list; node = node.next) {
  console.log(node.x); // 1, 2, 3
}

// iterate in reverse order: not possible

// auxiliary lists with custom link names
const odd = new List({nextName: 'nextOdd'}),
  even = new List({nextName: Symbol()});

// let's populate them
for (const node of list) {
  (node.x % 2 ? odd : even).pushBack(node);
}

// let's reverse the odd list
odd.reverse();

// let's iterate over them
for (const node of odd) console.log(node.x); // 3, 1
for (const node of even) console.log(node.x); // 2

// let's drop the last odd node: not possible

// the main list is unchanged
console.log(Array.from(list).map(n => n.x)); // [1, 2, 3]

// let's iterate manually using a range
let node = a;
do {
  console.log(node.x);
  node = node.next;
} while (node !== c);
// 1, 2

const extracted = list.extract({from: list.frontPtr.next(), to: c});
console.log(Array.from(extracted).map(n => n.x)); // [2, 3]
console.log(Array.from(list).map(n => n.x)); // [1]
```

### ValueSList (value-slist.js)

`ValueSList` is a subclass of `SList` that is modelled after `ValueList`. It supports
the same operations as `SList`, but the nodes are value nodes (`ValueNode`) and
it differs from `SList` in the same way as `ValueList` from `List`.

```js
import ValueSList from 'list-toolkit/value-slist.js';
// or
// const ValueSList = require('list-toolkit/value-slist.js').default; // CJS

const list = ValueSList.from([1, 2, 3]);

console.log(Array.from(list)); // [1, 2, 3]
```

### ExtSList (ext-slist.js)

`ExtSList` is modelled after `ExtList`, but operates on external circular singly linked lists.

```js
import ExtSList from 'list-toolkit/circular-slist.js';
// or
// const ExtSList = require('list-toolkit/circular-slist.js').default; // CJS

import ValueSList, {ValueNode} from 'list-toolkit/value-slist.js';

const detachedList = ValueSList.from([1, 2, 3]).releaseRawList();

let node = detachedList.front;
do {
  console.log(node.value);
  node = node.next;
} while (node !== detachedList);
// 1, 2, 3

const list = new ExtSList(detachedList);
console.log(Array.from(list)); // [1, 2, 3]
```

`ExtSList` differs from `ExtList` in the following ways:

* Some methods are not supported due to the efficiency concerns:
  * All "back" operations: `back`, `prev()`, `removeNodeBefore()`, `addBefore()`, `insertBefore()`, `moveBefore()`.
  * All reverse iterators: `getReverseIterator()`, `getReverseNodeIterator()`, `getReversePtrIterator()`.
* Some methods have a slightly different signatures.

| Method | Description | Complexity |
|------|-----------|-----|
| `moveAfter(ptr)` | move a node after the current one | *O(1)* |
| `removeNode(ptr)` | remove a node | *O(1)* |
| `removeRange(ptrRange, drop)` | remove a range of nodes | |
| `removeRange(ptrRange, false)` | remove a range of nodes | *O(1)* |
| `removeRange(ptrRange, true)` | remove and isolate nodes | *O(k)* |
| `extractRange(ptrRange)` | extract a range of nodes | *O(1)* |

### Cache

This is the class that is used for caching values using simple unique keys (numbers, strings or symbols).
It defines a capacity and when it is full, it removes the least recently used value.

Internally it is based on `List`.

```js
import Cache from 'list-toolkit/Cache.js';
// or
// const Cache = require('list-toolkit/Cache.js').default; // CJS

const cache = new Cache(1000);

const processRequest = key => {
  let data = cache.get(key);
  if (!data) {
    data = new DataObject();
    cache.register(key, data);
  }
  // continue processing
};
```

The main operations are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new Cache(capacity = 10)` | create a new cache | *O(1)* |
| `size` | get the number of values in the cache | *O(1)* |
| `capacity` | get the capacity of the cache | *O(1)* |
| `find(key)` | find a value by its key and return it or `undefined` | *O(1)* |
| `remove(key)` | remove a value by its key | *O(1)* |
| `register(key, value)` | register a value by its key | *O(1)* |
| `clear()` | clear the cache | *O(1)* |
| `getReverseIterable()` | get an iterable of the cache in reverse order | *O(1)* |

A `Cache` instance is iterable, so it can be used in loops:

```js
for (const value of cache) {
  console.log(value);
}
```

It iterates from the most recently used to the least recently used.

### MinHeap

`MinHeap` is a classic data structure: a priority queue. From the [Wikipedia article](https://en.wikipedia.org/wiki/Heap_(data_structure)):

> The heap is one maximally efficient implementation of an abstract data type called a priority queue, and in fact, priority queues are often referred to as "heaps", regardless of how they may be implemented. In a heap, the highest (or lowest) priority element is always stored at the root. However, a heap is not a sorted structure; it can be regarded as being partially ordered. A heap is a useful data structure when it is necessary to repeatedly remove the object with the highest (or lowest) priority, or when insertions need to be interspersed with removals of the root node.

```js
import MinHeap from 'list-toolkit/MinHeap.js';
// or
// const MinHeap = require('list-toolkit/MinHeap.js').default; // CJS

const heap = new MinHeap({less: (a, b) => a.priority > b.priority});

const enqueueTask = (priority, task) => {
  heap.push({priority, task});
};

const processTasks = () => {
  while (!heap.isEmpty) {
    const {priority, task} = heap.pop();
    // process the highest priority task
  }
}
```

The main operations are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new MinHeap({less = (a, b) => a < b, equal: (a, b) => a === b}, ...args)` | create a new heap and optionally populate it from iterables or other heaps | *O(k)* |
| `array` | get the underlying array organized as min heap | *O(1)* |
| `less` | get the comparison function | *O(1)* |
| `equal` | get the equality function | *O(1)* |
| `length` | get the number of elements in the heap | *O(1)* |
| `isEmpty` | check if the heap is empty | *O(1)* |
| `top` | get the top element | *O(1)* |
| `clear()` | clear the heap | *O(1)* |
| `pop()` | remove and return the top element | *O(log(n))* |
| `push(value)` | add new element | *O(log(n))* |
| `pushPop(value)` | add new element and then return the top element | *O(log(n))* |
| `replaceTop(value)` | return the top element and then add new element | *O(log(n))* |
| `has(value)` | check if the heap contains an element | *O(n)* |
| `remove(value)` | remove an element | *O(n)* |
| `replace(value, newValue)` | replace an element | *O(n)* |
| `releaseSorted()` | remove all elements and return them as an array in the reverse sorted order (the heap will be cleared) | *O(n)* |
| `merge(...args)` | add elements from iterables or other heaps | *O(k)* |
| `make(...args)` | return a new heap with the same options | *O(1)* |
| `clone()` | return a copy of the heap | *O(n)* |

`MinHeap` provides a number of static methods to create heaps on arrays (used internally):

| Method | Description | Complexity |
|------|-----------|-----|
| `MinHeap.build(array, less = (a, b) => a < b)` | create a new heap from an array | *O(n)* |
| `MinHeap.pop(heapArray, less = (a, b) => a < b)` | remove and return the top element | *O(log(n))* |
| `MinHeap.push(heapArray, value, less = (a, b) => a < b)` | add new element | *O(log(n))* |
| `MinHeap.pushPop(heapArray, value, less = (a, b) => a < b)` | add new element and then return the top element | *O(log(n))* |
| `MinHeap.replaceTop(heapArray, value, less = (a, b) => a < b)` | return the top element and then add new element | *O(log(n))* |
| `MinHeap.findIndex(heapArray, item, equal = (a, b) => a === b)` | return the index of an element or -1| *O(n)* |
| `MinHead.removeByIndex(heapArray, index, less = (a, b) => a < b, equal = (a, b) => a === b)` | remove an element by index | *O(log(n))* |
| `MinHeap.replaceByIndex(heapArray, index, value, less = (a, b) => a < b, equal = (a, b) => a === b)` | replace an element by index | *O(log(n))* |
| `MinHead.has(heapArray, item, equal = (a, b) => a === b)` | check if the heap contains an element | *O(n)* |
| `MinHeap.remove(heapArray, item, less = (a, b) => a < b, equal = (a, b) => a === b)` | remove an element | *O(n)* |
| `MinHeap.replace(heapArray, item, newItem, less = (a, b) => a < b, equal = (a, b) => a === b)` | replace an element | *O(n)* |
| `MinHeap.sort(heapArray, less = (a, b) => a < b)` | sort an array in place | *O(n * log(n))* |

## License

BSD 3-Clause "New" or "Revised" License. See the LICENSE file for details.

## Release History

* 1.0.1 *Fixed exports. Added more methods to `MinHeap`.*
* 1.0.1 *Initial release.*
