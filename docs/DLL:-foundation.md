This document describes the foundational classes and methods of the implementation of doubly linked lists.
Make sure to familiarize yourself with the [Backgrounder](./Backgrounder) and
[Concepts: list API](./Concepts:-list-API) first.

Legend for tables:

* `options` - options object, which contains `nextName` and `prevName` link names with default values `"next"` and `"prev"`.
* `node` - a node object in the list
* `head` - a node in the external list
* `list` - a list object
* `ptr` - a pointer to a node in the list
* `range` - a range of nodes in the list
* `nodeOrPtr` - a node or a pointer to a node
* `value` - a value

# [list/nodes.js](https://github.com/uhop/list-toolkit/blob/master/src/list/nodes.js)

Include:

```js
import {HeadNode} from 'list-toolkit/list/nodes.js';
```

## Stand-alone functions

| Function | Return Value | Description | *O* |
|------|-----------|-----|:-----:|
| `isNodeLike(options, node)` | truthy/falsy | Checks if `node` is a node-like object. | *O(1)* |
| `isStandAlone(options, node)` | truthy/falsy | Checks if `node` is a stand-alone node. | *O(1)* |
| `isCompatible(options1, options2)` | truthy/falsy | Checks if `options1` and `options2` have the same link names. | *O(1)* |

## Class `Node`

This class serves as a foundation for utility nodes for doubly linked lists.

| Member | Return Value | Description | *O* |
|------|-----------|-----|:-----:|
| `constructor(options)` | `this` | Creates a new node. | *O(1)* |
| `nextName` | string/symbol | The name of the next link. | *O(1)* |
| `prevName` | string/symbol | The name of the previous link. | *O(1)* |
| `[nextName]` | node | The next node. | *O(1)* |
| `[prevName]` | node | The previous node. | *O(1)* |
| `isStandAlone()` | boolean | Checks if the node is stand-alone. | *O(1)* |

The constructor creates a stand-alone node, which points to itself with both links.

## Class `HeadNode`

This class represent a head node of the list. Basically it hosts the list itself.
It extends `Node` described above and inherits all its methods and properties.
This class is used as the base for doubly linked lists.

| Member | Return Value | Description | *O* |
|------|-----------|-----|:-----:|
| `isNodeLike(node)` | truthy/falsy | Checks if `node` is a node-like object. | *O(1)* |
| `isCompatibleNames(options)` | truthy/falsy | Checks if `options` have the same link names. | *O(1)* |
| `isCompatible(list)` | truthy/falsy | Checks if `list` has the same link names. | *O(1)* |
| `isCompatiblePtr(ptr)` | truthy/falsy | Checks if `ptr` has the same link names. | *O(1)* |
| `isCompatibleRange(range)` | truthy/falsy | Checks if `range` has the same link names. | *O(1)* |
| `isEmpty` | truthy/falsy | Checks if the list is empty. | *O(1)* |
| `isOne` | truthy/falsy | Checks if the list has only one node. | *O(1)* |
| `isOneOrEmpty` | truthy/falsy | Checks if the list has only one node or empty. | *O(1)* |
| `head` | list | The list itself. | *O(1)* |
| `front` | node | The first node. | *O(1)* |
| `back` | node | The last node. | *O(1)* |
| `range` | range | The list range from the first to the last node or `null` if the list is empty. | *O(1)* |
| `getLength()` | number | The number of nodes in the list. | *O(n)* |
| `adoptNode(nodeOrPtr)` | node | Adopt a node. | *O(1)* |
| `adoptValue(value)` | node | Adopt a value. | *O(1)* |
| `normalizeNode(nodeOrPtr)` | node | Normalize a node. | *O(1)* |
| `normalizeRange(range)` | range | Normalize a range. | *O(1)* |

`adoptNode()` is used to verify and transform a node before including it in the list.

If `adoptNode()` receives a pointer to a node, it dereferences it. The node is checked for compatibility
with the list. If it has no required links, it is assumed to be a raw object and the necessary links
are created. If it already has the required links, and it is a stand-alone node, it is returned.
If an argument cannot be used as a node, an error is thrown.

`adoptValue()` is an alias of `adoptNode()` because nodes are values for node-based lists.

`normalizeNode()` dereferences a possible pointer, checks a node for compatibility with the list
and returns the normalized node. If the node is not compatible, an error is thrown.

`normalizeRange()` dereferences possible pointers and checks range for compatibility with the list.
If the range is not compatible, an error is thrown. The returned range is normalized to nodes.

## Class `ValueNode`

This class represents a value node used by value-based lists. It extends `Node` described above and
inherits all its methods and properties.

| Member | Return Value | Description | *O* |
|------|-----------|-----|:-----:|
| `constructor(value, options)` | `this` | Create a new value node with `value`. | *O(1)* |
| `value` | any | The value of the node. | *O(1)* |

The `value` property can be modified by a user.

## Class `PtrBase`

This class represents a basic pointer to a node in the list. It is used as a base for
pointers to doubly linked nodes.

| Member | Return Value | Description | *O* |
|------|-----------|-----|:-----:|
| `constructor(list, node, ListClass)` | `this` | Create a new pointer to a node. | *O(1)* |
| `list` | list | The list it belongs to. | *O(1)* |
| `node` | node | The node it points to. | *O(1)* |
| `nextNode` | node | The next node. | *O(1)* |
| `prevNode` | node | The previous node. | *O(1)* |
| `isPrevNodeValid()` | truthy/falsy | Checks if `prevNode` is valid. | *O(1)* |
| `next()` | `this` | Move the pointer to the next node. | *O(1)* |
| `prev()` | `this` | Move the pointer to the previous node. | *O(1)* |

`isPrevNodeValid()` is always `true` for doubly linked lists.

## Class `ExtListBase`

This list points to a node of an external list. It is a pointer-like object. It is used as a base
to represent external doubly linked lists. Many methods are the same as in `HeadNode` described above.

| Member | Return Value | Description | *O* |
|------|-----------|-----|:-----:|
| `constructor(head, options)` | `this` | Create a new listing optionally pointing to an external list. | *O(1)* |
| `nextName` | string/symbol | The name of the next property. | *O(1)* |
| `prevName` | string/symbol | The name of the previous property. | *O(1)* |
| `head` | node | The external list it points to or `null` if the list is empty. | *O(1)* |
| `isNodeLike(node)` | truthy/falsy | Checks if `node` is a node-like object. | *O(1)* |
| `isCompatibleNames(options)` | truthy/falsy | Checks if `options` have the same link names. | *O(1)* |
| `isCompatible(list)` | truthy/falsy | Checks if `list` is compatible with the list. | *O(1)* |
| `isCompatiblePtr(ptr)` | truthy/falsy | Checks if `ptr` is compatible with the list. | *O(1)* |
| `isCompatibleRange(range)` | truthy/falsy | Checks if `range` has the same link names. | *O(1)* |
| `isEmpty` | truthy/falsy | Checks if the list is empty. | *O(1)* |
| `isOne` | truthy/falsy | Checks if the list has only one node. | *O(1)* |
| `isOneOrEmpty` | truthy/falsy | Checks if the list has only one node or empty. | *O(1)* |
| `front` | node | The first node or `null` if the list is empty. | *O(1)* |
| `back` | node | The last node or `null` if the list is empty. | *O(1)* |
| `range` | range | The range of the list or `null` if the list is empty. | *O(1)* |
| `getLength()` | number | The length of the list or `0` if the list is empty. | *O(n)* |
| `adoptNode(nodeOrPtr)` | node | Adopt a node. | *O(1)* |
| `adoptValue(value)` | node | Adopt a value. | *O(1)* |
| `normalizeNode(nodeOrPtr)` | node | Normalize a node. | *O(1)* |
| `normalizeRange(range)` | range | Normalize a range. | *O(1)* |
| `attach(head)` | previous `head` | Attach the list to an external list. | *O(1)* |
| `detach()` | previous `head` | Detach the list from the external list and make it empty. | *O(1)* |
| `next()` | `this` | Move the pointer to the next node. | *O(1)* |
| `prev()` | `this` | Move the pointer to the previous node. | *O(1)* |

If the list is empty, `head` is `null`. If the list has only one node, `head` is the node.

The constructor without parameters is used to create an empty list with the default options.

The `attach()` method can accept `null` to detach the list from the external list. Its only parameter
is `null` by default. Essentially `attach()` is the same as `attach(null)` and they both are
equivalent to `detach()`.

Both `next()` and `prev()` do nothing for empty lists.
