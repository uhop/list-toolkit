# List toolkit [![NPM version][npm-img]][npm-url]

[npm-img]: https://img.shields.io/npm/v/list-toolkit.svg
[npm-url]: https://npmjs.org/package/list-toolkit

List-based **efficient** data structures to organize your objects.
This is a pure JavaScript module with no dependencies
suitable to use in all environments including browsers.

The toolkit provides the following data structures with a full set of efficiently implemented operations:

* **List**: a doubly linked list implemented as a container.
* **ListHead**: a doubly linked list that uses custom properties on external objects to link them around.
  * Using different custom properties the same object can be linked in different ways.
* **SList**: a singly linked list implemented as a container.
* **SListHead**: a singly linked list that uses custom properties on external objects to link them around.
  * Using different custom properties the same object can be linked in different ways.
* **Cache**: a List-based container with a limited capacity and an LRU policy of evicting old entries.
* **MinHeap**: a classic heap data structure (a priority queue).

## Installation

```bash
npm install list-toolkit
```

## Usage

The full documentation is available in the project's [wiki](https://github.com/uhop/list-toolkit/wiki). Below is a cheat sheet of the API.

### List

`List` implements a circular doubly linked list. Its head is a node with two properties: `next` and `prev`.
Other nodes of the list are value nodes (`List.ValueNode`) that have a `value` property.

```js
import List from 'list-toolkit/List.js';
// or
// const List = require('list-toolkit/List.js').default; // CJS

const list1 = new List();
const list2 = List.from([1, 2, 3]);
```

Main operations are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new List()` | create a new List | *O(1)* |
| `List.from(values)` | create a new List from an iterable or an array | *O(k)* |
| `isEmpty` | check if the list is empty | *O(1)* |
| `front` | get the first element | *O(1)* |
| `back` | get the last element | *O(1)* |
| `getLength()` | get the length of the list | *O(n)* |
| `popFront()` | remove and return the first element | *O(1)* |
| `popBack()` | remove and return the last element | *O(1)* |
| `pushFront(value)` | add a new element at the beginning | *O(1)* |
| `pushBack(value)` | add a new element at the end | *O(1)* |
| `appendFront(list)` | add a list at the beginning | *O(1)* |
| `appendBack(list)` | add a list at the end | *O(1)* |
| `moveToFront(node)` | move a node to the front | *O(1)* |
| `moveToBack(node)` | move a node to the back | *O(1)* |
| `clear()` | remove all elements | *O(1)* |
| `findNodeBy(condition)` | find the first node that satisfies the condition | *O(n)* |
| `remove(from, to = from)` | remove a range of elements | *O(1)* |
| `removeNodeBy(condition)` | remove and return the first node that satisfies the condition | *O(n)* |
| `extract(from, to)` | remove and return a range of elements as a new List | *O(1)* |
| `extractBy(condition)` | remove and return elements as a new List that satisfy the condition | *O(n)* |
| `reverse()` | reverse the list inline | *O(n)* |
| `sort(compareFn)` | sort the list inline | *O(n * log(n))* |

Here and everywhere `n` is a number of elements in the list, while `k` is the size of an argument.

Useful aliases are:

| Method | Alias of |
|------|-----------|
| `pop()` | `popFront()` |
| `push()` | `pushFront()` |
| `append()` | `appendBack()` |

List can be used as an iterable:

```js
const list = List.from([1, 2, 3]);

for (const value of list) {
  console.log(value);
}
```

Additional iterator-related methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `getIterable(from, to)` | get an iterable of a range | *O(1)* |
| `getReverseIterable(from, to)` | get an iterable of a range in reverse order | *O(1)* |
| `getNodeIterable(from, to)` | get an iterable of a range by nodes | *O(1)* |
| `getNodeReverseIterable(from, to)` | get an iterable of a range by nodes in reverse order | *O(1)* |

Helper methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `make()` | (a meta helper) create a new List | *O(1)* |
| `makeFrom(values)` | (a meta helper) create a new list from an iterable or an array | *O(k)* |
| `clone()` | (a meta helper) clone the list | *O(n)* |
| `pushValuesFront(values)` | add values at the beginning | *O(k)* |
| `pushValuesBack(values)` | add values at the end | *O(k)* |
| `appendValuesFront(values)` | add values as a list at the beginning | *O(k)* |
| `appendValuesBack(values)` | add values as a list at the end | *O(k)* |

Value node (`List.ValueNode`) methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `pop()` | remove and return the value | *O(1)* |
| `addBefore(value)` | add a new value before the current node | *O(1)* |
| `addAfter(value)` | add a new value after the current node | *O(1)* |
| `insertBefore(list)` | insert a list before the current node | *O(1)* |
| `insertAfter(list)` | insert a list after the current node | *O(1)* |

Stand-alone methods for nodes (`List.Node`) are:

| Method | Description | Complexity |
|------|-----------|-----|
| `List.pop(node)` | remove the node from its list and return `{node, list}` | *O(1)* |
| `List.extract(from, to = from)` | remove nodes from their list and return the first node of the extracted list | *O(1)* |
| `List.splice(head1, head2)` | combine two lists and return the first node of the combined list | *O(1)* |
| `List.move(target, from, to = from)` | move a range of nodes to another list after a target node | *O(1)* |

### ListHead

`ListHead` implements a circular doubly linked list. Its head is an object with the following properties:

* `nextName`: the property name of the next node. It can be a string or a symbol. Default: `"next"`.
* `prevName`: the property name of the previous node. It can be a string or a symbol. Default: `"prev"`.
* `head`: the head node of a circular doubly linked list. Default: `{}`.

All values of the list are objects that can be used as nodes. When adopted by a list,
objects are modified in-place by adding the properties defined by `nextName` and `prevName`.

While a value can belong to multiple `List` instances, we never know which one it belongs to.
If we know `nextName` and `prevName`, we can always find its `ListHead` instances from the value,
and we can manipulate the node without accessing its lists directly.

Because lists are circular structures, we can have multiple `ListHead` instances pointing to
different nodes of the same list. In fact, creating a new `ListHead` instance is cheap and can be done
when needed using any node/value.

An empty `ListHead` instance is created with an empty node that plays the role of a head of the list.
Alternatively a `ListHead` can be created by pointing to an existing node. In this case,
any valid node can be used as a head.

Some methods use nodes to manipulate the list. In `List`, they are usually found by iterations.
`ListHead` methods can use named objects for that.

```js
import ListHead from 'list-toolkit/ListHead.js';
// or
// const ListHead = require('list-toolkit/ListHead.js').default; // CJS

const list1 = new ListHead();
const list2 = new ListHead(null, {nextName: Symbol('next'), prevName:Symbol('prev')});

const value = {a: 1};

list1.push(value);
list2.push(value);

ListHead.pop({nextName: 'next', prevName: 'prev'}, value);
ListHead.pop(list2, value);
```

Almost all APIs are the same as for `List` and have the same semantics and complexity.
The differences are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new ListHead(head = null, {nextName = 'next', prevName = 'prev'})` | create a new List optionally adopting a list by `head` | *O(1)* |
| `ListHead.from(values, next, prev)` | create a new List from an iterable | *O(k)* |
| `ListHead.pop({nextName, prevName}, node)` | remove the node from its list and return `{node, list}` | *O(1)* |
| `ListHead.extract({nextName, prevName}, from, to)` | remove nodes from their list and return the first node of the extracted list | *O(1)* |
| `ListHead.splice({nextName, prevName}, head1, head2)` | combine two lists and return the first node of the combined list | *O(1)* |
| `makeNode()` | return an otherwise empty object with proper `next` and `prev` properties as circular doubly linked list node | *O(1)* |
| `adopt(node)` | make sure that a node is already a circular doubly linked list or make it so | *O(1)* |
| `makeList(head)` | return a new list pointing to `head` with the same `nextName` and `prevName` properties as this list | *O(1)* |
| `clear(true)` | remove all elements and breaks circular references | *O(n)* |
| `clear()` | remove all elements | *O(1)* |

`ListHead` defines a helper class `ListHead.Unsafe` that can be used to create lists without checking
their `nextName` and `prevName` properties:

```js
const item1 = {a: 1}, item2 = {b: 2};
item1.next = item2;
item2.prev = item1;
item1.prev = item2;
item2.next = item1;

const list = new ListHead(new ListHead.Unsafe(item1));
```

### SList

`SList` implements a circular singly linked list. Its head is a node with one property: `next`.
Other nodes of the list are value nodes (`SList.ValueNode`) that have a `value` property.

```js
import SList from 'list-toolkit/SList.js';
// or
// const SList = require('list-toolkit/SList.js').default; // CJS

const list1 = new SList();
const list2 = SList.from([1, 2, 3]);
```

`SList` API is modelled on `List`. The main difference is that `SList` is cheaper in general
but some operations have higher complexity, e.g., any operations that need to access the back of the list.
`SList` does not implement some operations, e.g., a reverse iterator, due to their complexity.
If you need these operations frequently, use `List` instead.

Note that for efficiency reasons some methods accept a previous node as a pointer to a required node.

Main operations are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new SList()` | create a new List | *O(1)* |
| `SList.from(values)` | create a new List from an iterable or an array | *O(k)* |
| `isEmpty` | check if the list is empty | *O(1)* |
| `front` | get the first element | *O(1)* |
| `getBack()` | get the last element | *O(n)* |
| `getLength()` | get the length of the list | *O(n)* |
| `getPtr()` | get a special pointer value (see below) | *O(1)* |
| `popFront()` | remove and return the first element | *O(1)* |
| `popBack()` | remove and return the last element | *O(n)* |
| `pushFront(value)` | add a new element at the beginning | *O(1)* |
| `pushBack(value)` | add a new element at the end | *O(n)* |
| `appendFront(list)` | add a list at the beginning | *O(nk* |
| `appendBack(list)` | add a list at the end | *O(n + k)* |
| `moveToFront(node)` | move a node to the front | *O(n)* |
| `moveToFront(ptr)` | move a node by pointer (see below) to the front | *O(1)* |
| `moveToBack(node)` | move a node to the back | *O(n)* |
| `moveToBack(ptr)` | move a node by pointer (see below) to the back | *O(1)* |
| `clear()` | remove all elements | *O(1)* |
| `findPtrBy(condition)` | find a pointer to the first node that satisfies the condition | *O(n)* |
| `remove(from, to = from)` | remove a range of elements | *O(n)* |
| `remove(fromPtr, to = from)` | remove a range of elements using a pointer (see below) | *O(1)* |
| `removeNodeBy(condition)` | remove the first node that satisfies the condition | *O(n)* |
| `extract(from, to)` | remove and return a range of elements as a new list | *O(n)* |
| `extract(fromPtr, to)` | remove and return a range of elements as a new list using a pointer (see below) | *O(1)* |
| `extractBy(condition)` | remove and return elements as a new List that satisfy the condition | *O(n)* |
| `reverse()` | reverse the list inline | *O(n)* |
| `sort(compareFn)` | sort the list inline | *O(n * log(n))* |

Useful aliases are:

| Method | Alias of |
|------|-----------|
| `pop()` | `popFront()` |
| `push()` | `pushFront()` |
| `append()` | `appendBack()` |

List can be used as an iterable:

```js
const list = SList.from([1, 2, 3]);

for (const value of list) {
  console.log(value);
}
```

Additional iterator-related methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `getIterable(from, to)` | get an iterable of a range | *O(1)* |
| `getPtrIterable(from, to)` | get an iterable of a range using a pointer (see below) | *O(n)* |
| `getPtrIterable(fromPtr, to)` | get an iterable of a range using a pointer (see below) | *O(1)* |

Helper methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `make()` | (a meta helper) create a new list | *O(1)* |
| `makeFrom(values)` | (a meta helper) create a new list from an iterable or an array | *O(k)* |
| `clone()` | (a meta helper) clone a list | *O(n)* |
| `pushValuesFront(values)` | add values at the beginning | *O(k)* |
| `appendValuesFront(values)` | add values as a list at the beginning | *O(k)* |

Value node (`SList.ValueNode`) methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `addAfter(value)` | add a new value after the current node | *O(1)* |
| `insertAfter(list)` | insert a list after the current node | *O(k)* |

Stand-alone methods for nodes (`SList.Node`) are:

| Method | Description | Complexity |
|------|-----------|-----|
| `SList.pop(prev)` | remove the node from its list and return `{node, list}` | *O(1)* |
| `SList.extract(prevFrom, nodeTo)` | remove nodes from their list and return `{prev, node}`, where `node` is the first node of the extracted list, and `prev` is the previous node | *O(1)* |
| `SList.splice(prev1, {prev, node})` | combine two lists and return the first node of the combined list | *O(1)* |
| `SList.move(target, prevFrom, nodeTo)` | move a range of nodes to another list after a target node | *O(1)* |
| `SList.getPrev(list, node)` | get a previous node of the given node | *O(n)* |

`SList` provides a special pointer: `SList.SListPtr`. It can be used to create a pointer to a node in a list. It is constructed using a previous node, which makes some operations more efficient.

Its methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new SList.SListPtr(list, prev = list)` | create a new pointer | *O(1)* |
| `list` | the head node | *O(1)* |
| `prev` | the previous node | *O(1)* |
| `isHead` | check if the pointer is at the head of the list | *O(1)* |
| `next()` | move the pointer to the next node | *O(1)* |
| `clone()` | make a copy of the pointer | *O(1)* |

Every method of `SList` that accepts a node can accept a pointer too.
Using pointers is frequently more efficient than using nodes directly.

### SListHead

`SListHead` is modelled after `ListHead` but it is specialized for `SList` instances.
Just like `ListHead`, it works with naked objects.

`SListHead` implements a circular singly linked list. Its head is an object with the following properties:

* `nextName`: the property name of the next node. It can be a string or a symbol. Default: `"next"`.
* `head`: the head node of a circular singly linked list. Default: `{}`.

All notes related to `ListHead` apply here too.

```js
import SListHead from 'list-toolkit/SListHead.js';
// or
// const SListHead = require('list-toolkit/SListHead.js').default; // CJS

const list1 = new SListHead();
const list2 = new SListHead(null, {nextName: Symbol('next')});

const value = {a: 1};

list1.push(value);
list2.push(value);

SListHead.pop({nextName: 'next'}, value);
SListHead.pop(list2, value);
```

Almost all APIs are the same as for `SList` and have the same semantics and complexity.
The differences are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new SListHead(head = null, next = 'next')` | create a new `SListHead` optionally adopting a list by `head` | *O(1)* |
| `SListHead.from(values, next)` | create a new `SListHead` from an iterable | *O(k)* |
| `SListHead.pop({nextName}, prev)` | remove the node by its previous node from its list and return `{node, list}` | *O(1)* |
| `SListHead.extract({nextName}, prevFrom, nodeTo)` | remove nodes from its list and return `{prev, node}` | *O(1)* |
| `SListHead.splice({nextName}, prev1, {prev, node})` | combine two lists and return the first node of the combined list | *O(1)* |
| `SListHead.getPrev({nextName}, list, node)` | get a previous node of the given node | *O(n)* |
| `make(newHead = null)` | return a new `SListHead` pointing to `newHead` with the same `nextName` property as this list | *O(1)* |
| `makeFrom(values)` | (a meta helper) create a new `SListHead` from an iterable with the same `nextName` property as this list | *O(k)* |
| `clear(true)` | remove all elements and breaks circular references | *O(n)* |
| `clear()` | remove all elements | *O(1)* |

`SListHead.SListPtr` is a pointer-like class similar to `SList.SListPtr`
but specialized for `SListHead` instances. It has the same API and the same semantics.

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
