This document contains the API for the `list-toolkit` library.

# Concepts

`List` and `SList` work with objects by injecting link properties to organize a list.
If we need to keep in a list primitive values or don't want to modify our objects, we can use
special nodes as objects that keep our values.

Here are lists and their "value" counterparts:

| List | Value list |
|------|------------|
| `List` | `ValueList` |
| `SList` | `ValueSList` |
| `ExtList` | `ExtValueList` |
| `ExtSList` | `ExtValueSList` |

They all use `ValueNode` as their nodes. It stores the value in its `value` property.

The regular value lists use the following special methods:

| Method | Description | Complexity | `ValueList` | `ValueSList` |
|--------|-------------|:----------:|:-----------:|:------------:|
| `pushFront(value)` | add a new node at the beginning | *O(1)* | ✔ | ✔ |
| `pushBack(value)` | add a new node at the end | *O(1)* | ✔ | |
| `popFront()` | remove and return the value of first node | *O(1)* | ✔ | ✔ |
| `popBack()` | remove and return the value of last node | *O(1)* | ✔ | |

The external lists use the following special methods:

| Method | Description | Complexity | `ExtValueList` | `ExtValueSList` |
|--------|-------------|:----------:|:--------------:|:---------------:|
| `addBack(value)` | add a new node before the current head | *O(1)* | ✔ | |
| `addAfter(value)` | add a new node after the current head | *O(1)* | ✔ | ✔ |

All value lists use the following methods:

| Method | Description | Complexity | `ValueList` | `ValueSList` | `ExtValueList` | `ExtValueSList` |
|--------|-------------|:----------:|:-----------:|:------------:|:--------------:|:---------------:|
| `adoptValue(value)` | adopt a value by creating a value node | *O(1)* | ✔ | ✔ | ✔ | ✔ |
| `[Symbol.iterator]()` | create a value iterator | *O(n)* | ✔ | ✔ | ✔ | ✔ |
| `getValueIterator()` | create a value iterator | *O(n)* | ✔ | ✔ | ✔ | ✔ |
| `getReverseValueIterator()` | create a reversed value iterator | *O(n)* | ✔ | | ✔ | |

Short methods names are aliased to the corresponding value methods:

| Method | Alias |
|--------|-------|
| `push(value)` | `pushBack(value)` |
| `pop()` | `popFront()` |
| `add(value)` | `addAfter(value)` |
| `getIterator()` | `getValueIterator()` |
| `getReverseIterator()` | `getReverseValueIterator()` |

# Adopting a value

The `adoptValue(value)` method checks if the value is a `ValueNode` and if not, creates a new one.
Its `value` property is set to the given value.

If it was already a `ValueNode`, the `value` property is left unchanged, and it tries to adopt it
as a node with `adoptNode(node)`.

# Aliasing for node-base lists

For convenience, all lists provide value methods but in node-based lists they are aliased to
the corresponding node methods:

| Method | Alias |
|--------|-------|
| `pushFront(value)` | `pushFrontNode(node)` |
| `pushBack(value)` | `pushBackNode(node)` |
| `popFront()` | `popFrontNode()` |
| `popBack()` | `popBackNode()` |
| `addBefore(value)` | `addNodeBefore(node)` |
| `addAfter(value)` | `addNodeAfter(node)` |
| `adoptValue(value)` | `adoptNode(node)` |
| `getValueIterator()` | `getNodeIterator()` |
| `getReverseValueIterator()` | `getReverseNodeIterator()` |
