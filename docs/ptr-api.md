This document contains the API for the `list-toolkit` library.

# Concepts

Pointers are used to manipulate nodes they point to: remove a node, insert nodes before/after it, move the pointer forward/backward, etc.

These pointers are essentially an API build around a node. A pointer can be constructed from a node.

# Minimally supported API

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `list` | return the list it points to | *O(1)* | ✔ | ✔ |
| `node` | return the node it points to | *O(1)* | ✔ | ✔ |
| `nextNode` | return the next node | *O(1)* | ✔ | ✔ |
| `previousNode` | return the previous node | *O(1)* | ✔ | ✔ |
| `isPreviousNodeValid` | return a boolean value indicating whether the previous node is available | *O(1)* | ✔ | ✔ |
| `next()` | move the pointer to the next node | *O(1)* | ✔ | ✔ |
| `prev()` | move the pointer to the previous node | *O(1)* | ✔ | ✔ |

This API is supported by all pointers that belong to: `List`, `SList`, `ExtList`, `ExtSList` and
their value-based variants.

# When pointers are invalidated

Pointers are invalidated when they point to a node that has been removed from the list or
moved to another list. It can happen when the list is modified using its API, the pointer or
another pointer pointing to the same list.

Pointers are never invalidated when the list was not modified.

When a list is manipulated using a node, it is updated correctly. Obviously, other pointers
are not updated. In most cases it works well, but in some cases it is not. Be vigilant when
updating lists.

# Singly linked list pointer notes

For many operations, the previous node is required. Usually it is supplied directly on
constructing a pointer and updated with some operations, but in some cases it is not.
In this case some operations will throw an error.

There is a getter that returns a boolean value indicating whether the previous node is available:
`isPreviousNodValid`.

If the previous node is invalid we cannot move backwards, insert nodes before the current, access the previous node, etc.

# Double linked list pointer nodes

`isPreviousNodeValid` is always `true`.

# Full API

The full API is supported by pointers of `List`, `SList` and their value-based variants:

| Method | Description | Complexity | List | SList |
|--------|-------------|:----------:|:----:|:-----:|
| `isHead` | return a boolean value indicating whether the pointer points to the head | *O(1)* | ✔ | ✔ |
| `clone()` | return a copy of the pointer | *O(1)* | ✔ | ✔ |
| `removeCurrent()` | remove the node the pointer points to | *O(1)* | ✔ | ✔ |
| `addBefore(value)` | insert a value/node before the current one | *O(1)* | ✔ | ✔ |
| `addAfter(value)` | insert a value/node after the current one | *O(1)* | ✔ | ✔ |
| `addNodeBefore(node)` | insert a node before the current one | *O(1)* | ✔ | ✔ |
| `addNodeAfter(node)` | insert a node after the current one | *O(1)* | ✔ | ✔ |
| `insertBefore(list)` | insert a compatible list before the current node | *O(1)* | ✔ | ✔ |
| `insertAfter(list)` | insert a compatible list after the current node | *O(1)* | ✔ | ✔ |

Pointers of external lists do not support this part of the API.
