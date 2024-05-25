This document contains the API for the `list-toolkit` library.

# Concepts

`ExtList`, `ExtSList`, `ExtValueList`, `ExtValueSList` are all objects used to manipulate external lists.
External lists are defined as a data structure that is a circular doubly or singly linked list.
Unlike `List` or `SList`, they do not have a header node. Essentially `ExtList`, `ExtSList` and
their value-based versions are similar to pointers and can point to any node in the list.

It is possible to have several external lists pointing to the same list, even the same node. Of course,
it is subject of possible invalidation rules similar to pointers. See [Pointer API](./ptr-api.md) for details.

# Generic inspection API

This API is modelled after the corresponding [List API](./list-api.md).

| Method | Description | Complexity | ExtList | ExtSList |
|--------|-------------|:----------:|:-------:|:--------:|
| `constructor(head = null, options)` | create a new list | *O(1)* | ✔ | ✔ |
| `isNodeLike(node)` | check if a node is compatible with this list | *O(1)* | ✔ | ✔ |
| `isCompatible(list)` | check if a list is compatible with this list | *O(1)* | ✔ | ✔ |
| `isCompatibleNames(options)` | check if two lists have compatible link names | *O(1)* | ✔ | ✔ |
| `isCompatiblePtr(ptr)` | check if a pointer is compatible with this list | *O(1)* | ✔ | ✔ |
| `isCompatibleRange(range)` | check if a range is compatible with this list | *O(1)* | ✔ | ✔ |
| `isEmpty` | check if the list is empty | *O(1)* | ✔ | ✔ |
| `isOne` | check if the list has only one node | *O(1)* | ✔ | ✔ |
| `isOneOrEmpty` | check if the list has only one node or it is empty | *O(1)* | ✔ | ✔ |
| `head` | actual pointer to a list node or `null` | *O(1)* | ✔ | ✔ |
| `front` | get the first node (an alias to `head`) | *O(1)* | ✔ | ✔ |
| `back` | get the last node | *O(1)* | ✔ | ✔ |
| `range` | get the range of the list | *O(1)* | ✔ | ✔ |
| `ptrRange` | get the pointer range of the list | *O(1)* | | ✔ |
| `getLength()` | get the length of the list | *O(n)* | ✔ | ✔ |

`head`, `front`, `back`, `range` and `ptrRange` can return `null` if the external list is unattached.
The external list is empty if `head` is `null`. Otherwise, the external list is never empty.

# Head manipulation API

| Method | Description | Complexity | ExtList | ExtSList |
|--------|-------------|:----------:|:-------:|:--------:|
| `attach(head)` | attach an external circular list | *O(1)* | ✔ | ✔ |
| `detach()` | detach the list | *O(1)* | ✔ | ✔ |

# Helper methods API

Helper methods

This API is modelled after the corresponding [List API](./list-api.md).

| Method | Description | Complexity | ExtList | ExtSList |
|--------|-------------|:----------:|:-------:|:--------:|
| `makePtr(node)` | create a new pointer | *O(1)* | ✔ | ✔ |
| `adoptNode(node)` | adopt a node | *O(1)* | ✔ | ✔ |
| `adoptValue(value)` | adopt a value by creating a value node | *O(1)* | ✔ | ✔ |
| `normalizeNode(node)` | normalize a node | *O(1)* | ✔ | ✔ |
| `normalizeRange(range)` | normalize a range | *O(1)* | ✔ | ✔ |
| `normalizePtrRange(range)` | normalize a pointer range | *O(1)* | | ✔ |
| `syncPrev()` | synchronize the reference of the previous node | *O(n)* | | ✔ |

`ExtSList` implements some methods with a different signature (marked with an asterisk):

| ExtList | ExtSList |
|---------|----------|
| `makePtr(node)` | `makePtr(prev)` |

# Pointer-like API

This API is modelled after the corresponding [Pointer API](./ptr-api.md).

| Method | Description | Complexity | ExtList | ExtSList |
|--------|-------------|:----------:|:-------:|:--------:|
| `isPrevNodeValid()` | return a boolean value indicating whether the previous node is available | *O(1)* | ✔ | ✔ |
| `next()` | move the pointer to the next node | *O(1)* | ✔ | ✔ |
| `prev()` | move the pointer to the previous node | *O(1)* | ✔ | ✔ |
| `removeCurrent()` | remove the node the pointer points to | *O(1)* | ✔ | ✔ |
| `addBefore(value)` | insert a value/node before the current one | *O(1)* | ✔ | ✔ |
| `addAfter(value)` | insert a value/node after the current one | *O(1)* | ✔ | ✔ |
| `addNodeBefore(node)` | insert a node before the current one | *O(1)* | ✔ | ✔ |
| `addNodeAfter(node)` | insert a node after the current one | *O(1)* | ✔ | ✔ |
| `insertBefore(extList)` | insert a compatible list before the current node | *O(1)* | ✔ | ✔ |
| `insertAfter(extList)` | insert a compatible list after the current node | *O(1)* | ✔ | ✔ |

# Additional pointer-like API

| Method | Description | Complexity | ExtList | ExtSList |
|--------|-------------|:----------:|:-------:|:--------:|
| `removeNodeBefore(node)` | remove a node before the current one | *O(1)* | | ✔ |
| `removeNodeAfter(node)` | remove a node after the current one | *O(1)* | ✔ | ✔ |
| `moveBefore(node)` | move a node before the current one | *O(1)* | ✔ | ✔ |
| `moveAfter(node)` | move a node after the current one | *O(1)* | ✔ | ✔ |

# List-like API

This API is modelled after the corresponding [List API](./list-api.md).

| Method | Description | Complexity | ExtList | ExtSList |
|--------|-------------|:----------:|:-------:|:--------:|
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

# Iteration API

This API is modelled after the corresponding [List API](./list-api.md).

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

# Meta helpers API

This API is modelled after the corresponding [List API](./list-api.md).

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `clone()` | clone the list | *O(n)* | ✔ | ✔ |
| `make()` | make a new compatible list | *O(1)* | ✔ | ✔ |
| `makeFrom(values)` | make a new compatible list from an iterable | *O(n)* | ✔ | ✔ |
| `makeFromRange(range)` | make a new compatible list from a range | *O(1)* | ✔ | ✔ |

# Static helpers API

This API is modelled after the corresponding [List API](./list-api.md).

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `from(values, options)` | make a new list from an iterable | *O(n)* | ✔ | ✔ |
| `fromRange(range, options)` | make a new list from a range | *O(1)* | ✔ | ✔ |
