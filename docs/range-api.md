This document contains the API for the `list-toolkit` library.

# Concepts

Ranges are collections of nodes. They are used to iterate over a portion of a list,
to extract or to remove nodes.

A range is defined as a simple "naked" object with the following properties:

* `from`: the first node in the range
* `to`: the last node in the range
* `list`: the list that owns the range (optional)

Ranges are inclusive: `from` and `to` are included in the range. The direction of a range
is from `from` to `to` using the `nextName` property defined by a list.

If `from` or `to` are not specified the interpretation is up to a specific method that uses the range.
In most cases the missing `from` is assumed the beginning of the list and
the missing `to` is assumed the end of the list.

Both `from` and `to` can be specified as nodes or pointers.

There are two types of ranges: `range` (node range) and `ptrRange` (pointer range).
A node range is defined by two nodes, while a pointer range is defined by
a pointer as `from` and a node as `to`. The initial `from` pointer should have a valid previous node
(see [Pointer API](./ptr-api.md) for more information). Pointer ranges are used with
singly linked lists only.

If `from` is missing in a pointer range usually `fromPtr` is assumed by most methods.
Note that `ExtSList` and `ExtValueSList` do not provide `fromPtr` by default.
