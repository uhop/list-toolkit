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

```js
import List from 'list-toolkit/List.js';
// or
// const List = require('list-toolkit/List.js').default; // CJS

const list1 = new List();
const list2 = List.from([1, 2, 3]);
```

Main operations:

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

Useful aliases:

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

Additional iterator-related methods:

| Method | Description | Complexity |
|------|-----------|-----|
| `getIterable(from, to)` | get an iterable of a range | *O(1)* |
| `getReverseIterable(from, to)` | get an iterable of a range in reverse order | *O(1)* |
| `getNodeIterable(from, to)` | get an iterable of a range by nodes | *O(1)* |
| `getNodeReverseIterable(from, to)` | get an iterable of a range by nodes in reverse order | *O(1)* |

Helper methods:

| Method | Description | Complexity |
|------|-----------|-----|
| `pushValuesFront(values)` | add values at the beginning | *O(n)* |
| `pushValuesBack(values)` | add values at the end | *O(n)* |
| `appendValuesFront(values)` | add values as a list at the beginning | *O(n)* |
| `appendValuesBack(values)` | add values as a list at the end | *O(n)* |

Value node (`List.ValueNode`) methods:

| Method | Description | Complexity |
|------|-----------|-----|
| `pop()` | remove and return the value | *O(1)* |
| `addBefore(value)` | add a new value before the current node | *O(1)* |
| `addAfter(value)` | add a new value after the current node | *O(1)* |
| `insertBefore(list)` | insert a list before the current node | *O(1)* |
| `insertAfter(list)` | insert a list after the current node | *O(1)* |

Stand-alone methods for nodes (`List.Node`):

| Method | Description | Complexity |
|------|-----------|-----|
| `List.pop(node)` | remove the node from its list and return `{node, list}` | *O(1)* |
| `List.extract(from, to)` | remove nodes from their list and return the first node of the extracted list | *O(1)* |
| `List.splice(head1, head2)` | combine two lists and return the first node of the combined list | *O(1)* |

