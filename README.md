# List toolkit

List-based **efficient** data structures to organize your objects.
This is a pure JavaScript module with no dependencies
suitable to use in all environments including browsers.

The toolkit provides the following data structures with a full set of efficiently implemented operations:

* **List**: a doubly linked list implemented as a container.
* **ListHead**: a doubly linked list that uses custom properties on external objects to link them around.
  * Using different custom properties the same object can be linked in different ways.
* **SList**: a singly linked list implemented as a container.
  * Using different custom properties the same object can be linked in different ways.
* **Cache**: a List-based container with a limited capacity and an LRU policy of evicting old entries.
* **Heap**: a classic heap data structure.

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
| `List.from(values)` | create a new List from an iterable or an array | *O(n)* |
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
| `remove(from, to = from)` | remove a range of elements | *O(1)* |
| `extract(from, to)` | remove and return a range of elements as a new List | *O(1)* |
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
| `makeFrom(values)` | (a meta helper) create a new List from an iterable or an array | *O(n)* |
| `pushValuesFront(values)` | add values at the beginning | *O(n)* |
| `pushValuesBack(values)` | add values at the end | *O(n)* |
| `appendValuesFront(values)` | add values as a list at the beginning | *O(n)* |
| `appendValuesBack(values)` | add values as a list at the end | *O(n)* |

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
| `List.extract(from, to)` | remove nodes from their list and return the first node of the extracted list | *O(1)* |
| `List.splice(head1, head2)` | combine two lists and return the first node of the combined list | *O(1)* |

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

```js
import ListHead from 'list-toolkit/ListHead.js';
// or
// const List = require('list-toolkit/ListHead.js').default; // CJS

const list1 = new ListHead();
const list2 = new ListHead(null, Symbol('next'), Symbol('prev'));

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
| `new ListHead(head = null, next = 'next', prev = 'prev')` | create a new List optionally adopting a list by `head` | *O(1)* |
| `ListHead.from(values, next, prev)` | create a new List from an iterable | *O(n)* |
| `ListHead.pop({nextName, prevName}, node)` | remove the node from its list and return `{node, list}` | *O(1)* |
| `ListHead.extract({nextName, prevName}, from, to)` | remove nodes from their list and return the first node of the extracted list | *O(1)* |
| `ListHead.splice({nextName, prevName}, head1, head2)` | combine two lists and return the first node of the combined list | *O(1)* |
| `makeNode()` | return an otherwise empty object with proper `next` and `prev` properties as circular doubly linked list node | *O(1)* |
| `adopt(node)` | make sure that a node is already a circular doubly linked list or make it so | *O(1)* |
| `makeList(head)` | return a new list pointing to `head` with the same `nextName` and `prevName` properties as this list | *O(1)* |

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

Main operations are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new SList()` | create a new List | *O(1)* |
| `SList.from(values)` | create a new List from an iterable or an array | *O(n)* |
| `isEmpty` | check if the list is empty | *O(1)* |
| `front` | get the first element | *O(1)* |
| `getBack()` | get the last element | *O(n)* |
| `getLength()` | get the length of the list | *O(n)* |
| `getPtr()` | get a special pointer value (see below) | *O(1)* |
| `popFront()` | remove and return the first element | *O(1)* |
| `popBack()` | remove and return the last element | *O(n)* |
| `pushFront(value)` | add a new element at the beginning | *O(1)* |
| `pushBack(value)` | add a new element at the end | *O(n)* |
| `appendFront(list)` | add a list at the beginning | *O(n)* |
| `appendBack(list)` | add a list at the end | *O(n)* |
| `moveToFront(node)` | move a node to the front | *O(n)* |
| `moveToFront(ptr)` | move a node by pointer (see below) to the front | *O(1)* |
| `moveToBack(node)` | move a node to the back | *O(n)* |
| `moveToBack(ptr)` | move a node by pointer (see below) to the back | *O(1)* |
| `clear()` | remove all elements | *O(1)* |
| `remove(from, to = from)` | remove a range of elements | *O(n)* |
| `remove(fromPtr, to = from)` | remove a range of elements using a pointer (see below) | *O(1)* |
| `extract(from, to)` | remove and return a range of elements as a new list | *O(n)* |
| `extract(fromPtr, to)` | remove and return a range of elements as a new list using a pointer (see below) | *O(1)* |
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
| `getPtrIterable(from, to)` | get an iterable of a range using a pointer (see below) | *O(1)* |

Helper methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `makeFrom(values)` | (a meta helper) create a new list from an iterable or an array | *O(n)* |
| `pushValuesFront(values)` | add values at the beginning | *O(n)* |
| `appendValuesFront(values)` | add values as a list at the beginning | *O(n)* |

Value node (`SList.ValueNode`) methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `pop()` | remove and return the value | *O(1)* |
| `popNode()` | remove and return the node | *O(1)* |
| `addAfter(value)` | add a new value after the current node | *O(1)* |
| `insertAfter(list)` | insert a list after the current node | *O(n)* |

Stand-alone methods for nodes (`SList.Node`) are:

| Method | Description | Complexity |
|------|-----------|-----|
| `SList.pop(node)` | remove the node from its list and return `{node, list}` | *O(1)* |
| `SList.extract(from, to)` | remove nodes from their list and return `{prev, node}`, where `node` is the first node of the extracted list, and `prev` is the previous node | *O(1)* |
| `SList.splice(prev1, {prev, node})` | combine two lists and return the first node of the combined list | *O(1)* |
| `SList.getPrev(list, node)` | get a previous node of the given node | *O(n)* |

`SList` provides a special pointer: `SList.SListPtr`. It can be used to create a pointer to a node in a list. It is constructed using a previous node, which makes some operations more efficient.

Its methods are:

| Method | Description | Complexity |
|------|-----------|-----|
| `new SList.SListPtr(list, prev = list)` | create a new pointer | *O(1)* |
| `prev` | get the previous node | *O(1)* |
| `node` | get the current node | *O(1)* |
| `value` | get the value of the current node | *O(1)* |
| `isHead` | check if the pointer is at the head of the list | *O(1)* |
| `next()` | move the pointer to the next node | *O(1)* |
| `clone()` | make a copy of the pointer | *O(1)* |
