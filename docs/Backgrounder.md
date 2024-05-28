This document contains the API for the `list-toolkit` library.

# Concepts

Lists are simple linear data structures that are used to store an ordered sequence of nodes
that can hold values or represent such values. It is one of the simplest possible
abstract data structure. See the Wikipedia article on [Lists](https://en.wikipedia.org/wiki/List_(abstract_data_type)).


The list can be empty or not. If it is empty, it has no value nodes.

Conceptually the non-empty list supports the following set of axioms:

* The list is arbitrary ordered. The order is preserved unless the list is modified.
* There are the first node and the last node, which can be the same.
* A node should include a link/pointer to the next node.
  * Singly linked lists have only a "next" link and can be efficiently traversed in one direction only.
  * Doubly linked lists have another link/pointer to the previous node.
  They can be efficiently traversed in both directions.
* Nodes can be removed from the list.
* New nodes can be added to the list.
* The list is circular or not.
  * In circular lists the last node points to the first one.
  * Non-circular lists are usually `null`-terminated to indicate that there is no next/previous node.

Let's assume that we have the following definitions:

* `list` - a doubly linked list
* `slist` - a singly linked list
* Lists have the following properties:
  * `front` - the first node
  * `back` - the last node
* Nodes are represented as objects with the following properties:
  * `next` - the next node
  * `prev` - the previous node in doubly linked lists
* `node` - a node in the list of type `Node`

In this case for `null`-terminated lists we have the following axioms:

```js
// for an arbitrary node:
node.next === null || node.next instanceof Node;

// for an arbitrary doubly linked list node:
node.next === null || node.next.prev === node;
node.prev === null || node.prev.next === node;

// traverse forwards:
for (let node = list.front; node !== null; node = node.next) {
  // do something with node
}

// traverse backwards for doubly linked lists:
for (let node = list.back; node !== null; node = node.prev) {
  // do something with node
}
```

There are two types of circular lists: with a special head node, which usually represents the list itself,
and without a head node with a pointer/link to the actual list.

Axioms for the circular lists with head nodes:

```js
// for an arbitrary node:
node.next instanceof Node;

// for an arbitrary doubly linked list node:
node.next.prev === node;
node.prev.next === node;

// traverse forwards:
for (let node = list.front; node !== list; node = node.next) {
  // do something with node
}

// traverse backwards:
for (let node = list.back; node !== list; node = node.prev) {
  // do something with node
}
```

Axioms for the circular lists without head nodes:

```js
// for an arbitrary node:
node.next instanceof Node;

// for an arbitrary doubly linked list node:
node.next.prev === node;
node.prev.next === node;

// traverse forwards:
let node = list.front;
do {
  // do something with node
  node = node.next;
} while (node !== list.back);

// traverse backwards:
node = list.back;
do {
  // do something with node
  node = node.prev;
} while (node !== list.front);
```

Complexity-wise circular lists are more efficient because they don't have checks for `null`
in their operations.

# Singly linked lists

Singly linked lists can support the following operations efficiently in *O(1)* time:

* Create a list.
* Add a node to the front.
* Add a node to the back (providing that the list maintains the explicit link to the last node).
* Remove a node from the front.

The forward traversal is trivial and can be done efficiently in *O(n)* time.

## Popping a node

Removal of an arbitrary node can be done in *O(1)* time, if we know its previous node in the list:

```js
// for null-terminated lists:
const pop = prev => {
  if (!prev) return null;
  const node = prev.next;
  if (!node) return null;
  prev.next = node.next;
  node.next = null;
  return {extracted: node, rest: prev.next};
};

// for circular lists:
const pop = prev => {
  const node = prev.next;
  prev.next = node.next;
  node.next = node;
  return {extracted: node, rest: prev.next};
};
```

## Appending a range

Appending a range of nodes to a node can be done in *O(1)* time if we know its previous node in the list:

```js
// for null-terminated lists:
const appendRange = (target, prevFrom, to) => {
  if (!target || !prevFrom || !to) return null;
  const from = prevFrom.next;
  if (!from) return null;

  // properly extract the range
  prevFrom.next = to.next;

  // append the range
  to.next = target.next;
  target.next = from;

  return target;
};

// for circular lists:
const appendRange = (target, prevFrom, to) => {
  const from = prevFrom.next;

  // properly extract the range
  prevFrom.next = to.next;

  // append the range
  to.next = target.next;
  target.next = from;

  return target;
};
```

You probably noted that it is all predicated on the knowledge of the previous node. It should be
tracked somehow because there is no efficient way to get it from the node itself.

## Appending a list

Assuming that a list can be represented as a range `{from, to}`, which is already properly terminated,
appending a list to a list can be done in *O(1)* time:

```js
// for null-terminated lists:
const appendListFront = ({from: targetFrom, to: targetTo}, {from, to}) => {
  if (!targetFrom || !targetTo || !from || !to) return null;
  to.next = targetFrom;
  return {from, to: targetTo};
};
const appendListBack = ({from: targetFrom, to: targetTo}, {from, to}) => {
  if (!targetFrom || !targetTo || !from || !to) return null;
  targetTo.next = from;
  return {from: targetFrom, to};
};

// for circular lists:
const appendListFront = ({from: targetFrom, to: targetTo}, {from, to}) => {
  to.next = targetFrom;
  targetTo.next = from;
  return {from, to: targetTo};
};
const appendListBack = ({from: targetFrom, to: targetTo}, {from, to}) => {
  targetTo.next = from;
  to.next = targetFrom;
  return {from: targetFrom, to};
}
```

No need for the knowledge of the previous node.

# Doubly linked lists

Doubly linked lists support efficiently the same operations as singly linked lists and more:

* Add a node to the back.
* Remove a node from the back.

Both forward and backward traversals are trivial and can be done efficiently in *O(n)* time.

## Popping a node

Removal of an arbitrary node can be always done in *O(1)* time:

```js
// for null-terminated lists:
const pop = node => {
  if (!node) return null;
  const next = node.next,
    prev = node.prev;
  if (next) next.prev = prev;
  if (prev) prev.next = next;
  node.next = node.prev = null;
  return {extracted: node, rest: next};
};

// for circular lists:
const pop = node => {
  const next = node.next,
    prev = node.prev;
  next.prev = prev;
  prev.next = next;
  node.next = node.prev = node;
  return {extracted: node, rest: next};
};
```

## Appending a range

Appending a range is always done in *O(1)* time:

```js
// for null-terminated lists:
const appendRange = (target, from, to) => {
  if (!target || !from || !to) return null;

  // properly extract the range
  const prev = from.prev,
    next = to.next;
  if (prev) prev.next = next;
  if (next) next.prev = prev;

  // append the range
  to.next = target.next;
  target.next = from;
  from.prev = target;

  return target;
};

// for circular lists:
const appendRange = (target, from, to) => {
  // properly extract the range
  from.prev.next = to.next;
  to.next.prev = from.prev;

  // append the range
  to.next = target.next;
  to.next.prev = to;
  target.next = from;
  from.prev = target;

  return target;
};
```

## Appending a list

Assuming that a list can be represented as a range `{from, to}`, which is already properly terminated,
appending a list to a list can be done in *O(1)* time:

```js
// for null-terminated lists:
const appendListFront = ({from: targetFrom, to: targetTo}, {from, to}) => {
  if (!targetFrom || !targetTo || !from || !to) return null;
  to.next = targetFrom;
  targetFrom.prev = to;
  return {from, to: targetTo};
};
const appendListBack = ({from: targetFrom, to: targetTo}, {from, to}) => {
  if (!targetFrom || !targetTo || !from || !to) return null;
  targetTo.next = from;
  from.prev = targetTo;
  return {from: targetFrom, to};
};

// circular lists can be represented by a (head) node:
const appendListFront = (targetHead, head) => {
  targetHead.prev.next = head;
  head.prev = targetHead.prev;
  targetHead.prev = head;
  head.next = targetHead;
  return head;
};
const appendListBack = (targetHead, head) => {
  appendListFront(targetHead, head);
  return targetHead;
};
```

Appending a list to the front or the back is the same for circular lists.

# Design decisions

## Circular lists vs. `null`-terminated lists

`null`-terminated lists (NT lists) have usually more operations with branching.
The focus of this toolkit will be on circular lists.

Conversions between circular lists and NT lists are not trivial and provided as auxiliary functions (`nt-utils.js`).

## Parametrization

Traditionally `next` and `prev` properties are used to point to the next and previous nodes.
But sometimes we may want different names because they are not available or we want to work with
a list produced by a different library, which used different names or symbols.

All lists and related objects should support a way to specify actual names of
the `next` and `prev` properties.

Typically lists accept names when constructed as an options object:

* `nextName` - a string a or symbol to link to the next node.
* `prevName` - a string a or symbol to link to the previous node. It is used only in doubly linked lists.

The same properties are exposed as properties of list objects:

```js
const list = new List({nextName: 'next', prevName: 'prev'});
const compatibleList = new List(list);
const compatibleSList = new SList(list);
const compatibleExternalList = new ExtList(null, list);

const uniqueList = new List({nextName: Symbol(), prevName: Symbol()});
const compatibleUniqueList = new List(uniqueList);
```

## Node-based lists vs. value-based lists

No need to use special node objects for node-based lists. If we keep track of modifiable
objects, we can inject necessary links at any time. It allows us to include the same
object in different lists and use objects directly for node manipulations.

To avoid possible name clashes when we insert the same node in different lists,
we can use the parametrization of the `next` and `prev` properties discussed above.

Value-based lists are just node-based lists with special value nodes. A value node supports
the `value` property that is an actual value of the node.

Value-based lists should support special operations as a convenience:

* Adding values to a list.
* Iterating over values in a list.

## Doubly linked lists vs. singly linked lists

### The previous node problem

Singly linked lists appears to be more efficient but less flexible. Some important algorithms
require a knowledge of the previous node, which is difficult to calculate from a given node
(generally in *O(n)* time).

To support such algorithms, we can introduce a notion of a pointer, which keeps track of
the previous node. Such pointer can be used to add nodes before and after the current node and
it can be efficiently iterated forward.

### The last node problem

Singly linked lists have a special last node. It is used to support important operations at
the back of the list. It can be calculated in *O(n)* time. Given that the last node should be
tracked by the list itself so it is available in *O(1)* time.

## Hosted lists vs. headless lists

Hosted lists are lists that serve as a head node for the list. This design simplifies
iterations and provides a persistent place to keep some lists state.

Headless lists are similar to pointers. They are used to manipulate external lists.
A headless list object has the `head` property that points to the first node in the list.

Headless lists cannot be truly empty. They always have one or more nodes.
To represent an empty list the `head` property should be set to `null`.

### Headless singly linked lists

Headless singly linked lists cannot track the last node because it is
an extra-band knowledge, which is not kept in the list itself.

The same goes for previous nodes of singly linked lists. For example, we cannot provide
the previous node of the first node in the list in *O(1)* time. It will take *O(n)* time.

Given all that we restrict operations of headless singly linked lists only to efficient
operations and modify a semantics of some algorithms such as a list appending.

### Headless doubly linked lists

Headless doubly linked lists have no problems with previous nodes.
Circular doubly linked lists have no problems with last nodes, which supports our decision
to use circular lists instead of `null`-terminated lists.

### Hosted singly linked lists

Singly linked lists can be efficiently implemented as a circular list where
the list object serves as a head node.
This way it solves a problem of a previous node for the front node in *O(1)* time. Additionally,
it can keep a track of the last node as the `last` property.

### Hosted doubly linked lists with

Doubly linked lists are efficient with and without a head node, but having a list object
as a head node simplifies traversing the list for users. A trivial `for` loop suffices.

# Implementation details

The `list-toolkit` provides the following lists:

* Doubly linked lists:
  * `List` - a hosted list.
  * `ValueList` - a hosted list with support for values.
  * `ExtList` - a headless list.
  * `ExtValueList` - a headless list with support for values.
* Singly linked lists:
  * `SList` - a hosted list.
  * `ValueSList` - a hosted list with support for values.
  * `ExtSList` - a headless list.
  * `ExtValueSList` - a headless list with support for values.

We can classify them along the "node vs. value" lists:

* Node-based lists: `List`, `SList`, `ExtList`, `ExtSList`.
* Value-based (container) lists: `ValueList`, `ValueSList`, `ExtValueList`, `ExtValueSList`.

We can classify them as hosted vs. headless lists:

* Hosted lists: `List`, `SList`, `ValueList`, `ValueSList`.
* Headless lists: `ExtList`, `ExtSList`, `ExtValueList`, `ExtValueSList`.

## Pointers

All lists support pointers.

Hosted lists have rich pointers that support various operations in *O(1)* time.

Headless lists are pointers themselves. So their pointers are used mostly for iterating
and for keeping track of nodes. All operations should be done through their lists.

## Ranges

All lists support ranges. Ranges are naked objects with the following properties:

* `from` - the first node in the range
* `to` - the last node in the range
* `list` - the list that contains the range (optional)

All ranges are iterable and should be traversed in *O(k)* time, where *k* is the number
of nodes in the range.

## Algorithms

All lists support a rich set of efficient algorithms.

On top of already mentioned manipulations hosted lists provide the following algorithms:

* Frequently used operations:
  * Moving a node to the front of the list in *O(1)* time. Effectively it is removing a node
  from the list and pushing it to the front.
  * Moving a node to the back of the list in *O(1)* time.
* Removals:
  * Extracting a range of nodes in *O(1)* time.
  * Removing a range of nodes in *O(1)* time. Effectively it is the same as extracting and
  dropping the result.
    * Optionally making them disconnected in *O(k)* time.
  * Clearing the list in *O(1)* time.
    * Optionally making all nodes disconnected in *O(n)* time.
* Complex algorithms:
  * Reversing in *O(n)* time.
  * Sorting in *O(n log n)* time.

# Auxiliary classes

The `list-toolkit` provides the following auxiliary classes:

* `Cache` - a class that stores a value in a cache based on the [LRU](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU) policy.
  * Implemented using `List`.
* `MinHeap` - a class that stores a value in a [heap](https://en.wikipedia.org/wiki/Heap_(data_structure)).
It implements a min-heap variant of a binary heap.
