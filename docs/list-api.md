This document contains the API for the `list-toolkit` library.

# Concepts

The `list-toolkit` works with circular lists. It can convert NT (`null`-terminated) lists to circular lists and back. The toolkit provides the following types of lists:

* Doubly and singly linked lists:
  * Doubly linked lists: `List`, `ValueList`, `ExtList`, `ExtValueList`.
  * Singly linked lists: `SList`, `ValueSList`, `ExtSList`, `ExtValueSList`.
* List with an explicit header, or header-less circular lists:
  * Lists with a header: `List`, `ValueList`, `SList`, `ValueSList`.
  * Header-less lists: `ExtList`, `ExtValueList`, `ExtSList`, `ExtValueSList`.
    * Header-less lists are used to manipulate external lists. They are similar to pointers.
* Value lists are similar to containers for arbitrary values. Other lists are used to manipulate external objects by modifying them in-place.
  * Value lists: `ValueList`, `ValueSList`, `ExtValueList`, `ExtValueSList`.
  * Node lists: `List`, `SList`, `ExtList`, `ExtSList`.

All lists are customizable by options, which specify what string names or symbols should be used to link nodes.

The legend:

* Arguments:
  * `options` - an options object
    * for doubly linked lists it includes `nextName` and `prevName` with default values `"next"` and `"prev"`
    * for singly linked lists it includes `nextName` with default value `"next"`
  * `list` - a list of the same type
  * `node` - a node in the list, can be a pointer
  * `ptr` - a pointer in the list
  * `range` - a range in the list
  * `ptrRange` - a pointer range in the list
    * It is used with singly linked lists only.
  * `value` - a value or a value node
  * `values` - an iterable of values
  * `prev` - a previous node in the list
    * It is used with singly linked lists only to point to the next node.
* Complexity:
  * *O(1)* - constant time
  * *O(n)* - linear time on the length of the list
  * *O(k)* - linear time on the number of nodes specified by an argument

# Generic inspection API

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `constructor(options)` | create a new list | *O(1)* | ✔ | ✔ |
| `isNodeLike(node)` | check if a node is compatible with this list | *O(1)* | ✔ | ✔ |
| `isCompatible(list)` | check if a list is compatible with this list | *O(1)* | ✔ | ✔ |
| `isCompatibleNames(options)` | check if two lists have compatible link names | *O(1)* | ✔ | ✔ |
| `isCompatiblePtr(ptr)` | check if a pointer is compatible with this list | *O(1)* | ✔ | ✔ |
| `isCompatibleRange(range)` | check if a range is compatible with this list | *O(1)* | ✔ | ✔ |
| `isEmpty` | check if the list is empty | *O(1)* | ✔ | ✔ |
| `isOne` | check if the list has only one node | *O(1)* | ✔ | ✔ |
| `isOneOrEmpty` | check if the list has only one node or it is empty | *O(1)* | ✔ | ✔ |
| `front` | get the first node | *O(1)* | ✔ | ✔ |
| `back` | get the last node | *O(1)* | ✔ | ✔ |
| `range` | get the range of the list | *O(1)* | ✔ | ✔ |
| `ptrRange` | get the pointer range of the list | *O(1)* | | ✔ |
| `getLength()` | get the length of the list | *O(n)* | ✔ | ✔ |

# Helper methods API

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `adoptNode(node)` | adopt a node | *O(1)* | ✔ | ✔ |
| `adoptValue(value)` | adopt a value by creating a value node | *O(1)* | ✔ | ✔ |
| `normalizeNode(node)` | normalize a node | *O(1)* | ✔ | ✔ |
| `normalizeRange(range)` | normalize a range | *O(1)* | ✔ | ✔ |
| `normalizePtrRange(range)` | normalize a pointer range | *O(1)* | | ✔ |
| `syncLast()` | synchronize the reference of the last node | *O(n)* | | ✔ |

# Manipulation API

Both `List` and `SList` work with nodes, not values. All value-specific methods are aliased
to respective node-specific methods. If you want to work with

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `frontPtr` | get the front pointer | *O(1)* | ✔ | ✔ |
| `backPtr` | get the back pointer | *O(1)* | ✔ | |
| `makePtr(node)` | create a new pointer from a pointer | *O(1)* | ✔ | ✔* |
| `pushFrontNode(node)` | add a node to the front | *O(1)* | ✔ | ✔ |
| `pushBackNode(node)` | add a node to the back | *O(1)* | ✔ | ✔ |
| `pushFront(value)` | add a value to the front | *O(1)* | ✔ | ✔ |
| `pushBack(value)` | add a value to the back | *O(1)* | ✔ | ✔ |
| `popFrontNode()` | remove and return the first node | *O(1)* | ✔ | ✔ |
| `popBackNode()` | remove and return the last node | *O(1)* | ✔ | ✔ |
| `popFront()` | remove and return the first value | *O(1)* | ✔ | ✔ |
| `popBack()` | remove and return the last value | *O(1)* | ✔ | ✔ |
| `appendFront(list)` | add a list to the front | *O(1)* | ✔ | ✔ |
| `appendBack(list)` | add a list to the back | *O(1)* | ✔ | ✔ |
| `moveToFront(node)` | move a node to the front | *O(1)* | ✔ | ✔* |
| `moveToBack(node)` | move a node to the back | *O(1)* | ✔ | ✔* |
| `clear(drop)` | clear the list | | ✔ | ✔ |
| `clear(false)` | clear the list | *O(1)* | ✔ | ✔ |
| `clear(true)` | clear the list and isolate nodes | *O(n)* | ✔ | ✔ |
| `removeNode(node)` | remove a node | *O(1)* | ✔ | ✔* |
| `removeRange(range, drop)` | remove a range | | ✔ | ✔* |
| `removeRange(range, false)` | remove a range | *O(1)* | ✔ | ✔* |
| `removeRange(range, true)` | remove a range and isolate nodes | *O(k)* | ✔ | ✔* |
| `extractRange(range)` | extract a range | *O(1)* | ✔ | ✔* |
| `extractBy(condition)` | extract nodes by a condition | *O(n)* | ✔ | ✔ |
| `reverse()` | reverse the list | *O(n)* | ✔ | ✔ |
| `sort(lessFn)` | sort the list | *O(n log n)* | ✔ | ✔ |
| `releaseRawList()` | release the raw list | *O(1)* | ✔ | ✔ |
| `releaseAsPtrRange()` | release the raw list as a pointer range | *O(1)* | | ✔ |

Some methods are aliases:

| Method | Alias |
|--------|-------|
| `push(value)` | `pushBack(value)` |
| `pop()` | `popFront()` |
| `pushFront(value)` | `pushFrontNode(node)` |
| `pushBack(value)` | `pushBackNode(node)` |
| `popFront()` | `popFrontNode()` |
| `popBack()` | `popBackNode()` |
| `append(list)` | `appendBack(list)` |

`SList` implements some methods with a different signature (marked with an asterisk):

| List | SList |
|------|-------|
| `makePtr(node)` | `makePtr(prev)` |
| `moveToFront(node)` | `moveToFront(ptr)` |
| `moveToBack(node)` | `moveToBack(ptr)` |
| `removeNode(node)` | `removeNode(ptr)` |
| `removeRange(range, drop)` | `removeRange(ptrRange, drop)` |
| `extractRange(range)` | `extractRange(ptrRange)` |

# Iteration API

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `[Symbol.iterator]()` | get a default iterator | *O(1)* | ✔ | ✔ |
| `getIterator(range = {})` | get an iterator | *O(1)* | ✔ | ✔ |
| `getValueIterator(range = {})` | get a value iterator | *O(1)* | ✔ | ✔ |
| `getNodeIterator(range = {})` | get a node iterator | *O(1)* | ✔ | ✔ |
| `getPtrIterator(range = {})` | get a pointer iterator | *O(1)* | ✔ | ✔ |
| `getReverseIterator(range = {})` | get a reverse iterator | *O(1)* | ✔ | |
| `getReverseValueIterator(range = {})` | get a reverse value iterator | *O(1)* | ✔ | |
| `getReverseNodeIterator(range = {})` | get a reverse node iterator | *O(1)* | ✔ | |
| `getReversePtrIterator(range = {})` | get a reverse pointer iterator | *O(1)* | ✔ | |

All complexities reflect the creation of an iterator. Obviously iterating over a range or the whole list
will be linear on a number of nodes.

Some methods are aliases:

| Method | Alias |
|--------|-------|
| `getIterator(range)` | `getNodeIterator(range)` |
| `getReverseIterator(range)` | `getReverseNodeIterator(range)` |

# Meta helpers API

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `clone()` | clone the list | *O(n)* | ✔ | ✔ |
| `make()` | make a new compatible list | *O(1)* | ✔ | ✔ |
| `makeFrom(values)` | make a new compatible list from an iterable | *O(n)* | ✔ | ✔ |
| `makeFromRange(range)` | make a new compatible list from a range | *O(1)* | ✔ | ✔ |

# Static helpers API

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `from(values, options)` | make a new list from an iterable | *O(n)* | ✔ | ✔ |
| `fromRange(range, options)` | make a new list from a range | *O(1)* | ✔ | ✔ |
| `fromExtList(extList)` | make a new list from an external list | *O(1)* | ✔ | ✔ |
