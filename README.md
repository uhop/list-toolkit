# List toolkit [![NPM version][npm-img]][npm-url]

[npm-img]: https://img.shields.io/npm/v/list-toolkit.svg
[npm-url]: https://npmjs.org/package/list-toolkit

List-based **efficient** data structures to organize your objects.
This is a pure JavaScript module with no dependencies
suitable to use in all environments including browsers.

The toolkit provides the following data structures with a full set of efficiently implemented operations:

* Converters for `null`-terminated (NT) lists, both singly and doubly linked. They convert in place from NT lists to circular lists and back.
* Various lists:
  * Doubly linked circular lists (DLL) and singly linked circular lists (SLL).
  * Value-based lists, where a list serves as a container for external objects, and node-based lists, where a list uses custom properties on external objects to link them around.
  * Hosted lists, which use a special head node to manage nodes, and headless lists, which point to an external list without including any headers.
* Heaps:
  * Priority queues: min heap, leftist heap, skew heap.
* Various list-based data structures:
  * Caches with various eviction algorithms: least recently used (LRU), least frequently used (LFU), first in first out (FIFO), and random.
    * A decorator is provided to decorate functions, methods, and getters with a cache of your choice.
  * Queue: an adapter for lists.
* Numerous list utilities.

All lists can be used without the toolkit. Your existing lists, either doubly or singly linked,
can be used. The toolkit provides a few utilities that you would write yourself if you wanted to use them.

The implementation philosophy was very simple:

* Flexibility, efficiency, and simplicity.
* No dependencies. No unexpected surprises.
* You never pay for what you don't use.
* Suitable for all environments.
* Should be usable with already existing lists.
* Could be used as a foundation for other list-based data structures.

**Read all about the implemented ideas in the [Backgrounders](./Backgrounder).**

All lists support similar intuitive interfaces:

* Creating from existing objects.
* Adding, inserting, extracting and removing nodes.
* Forward and reverse iterators.
* General manipulations like reversing and sorting.
* Link names for the next and previous links (for doubly linked lists) are customizable.

All facilities are efficient, well-debugged, and battle-tested.

**All documentation is in the [wiki](https://github.com/uhop/list-toolkit/wiki).**

## Installation

```bash
npm install list-toolkit
```

## Introduction

The full documentation is available in the project's [wiki](https://github.com/uhop/list-toolkit/wiki). Below is a cheat sheet of the API.

Value lists are containers for arbitrary values:

```js
import ValueList from 'list-toolkit/value-list.js';

const list = ValueList.from([1, 2, 3]);

// iterate over the list manually
for (let node = list.front; node !== list; node = node.next) {
  console.log(node.value); // 1, 2, 3
}

// iterate over the list with an iterator
for (const value of list) {
  console.log(value); // 1, 2, 3
}

// add more values:
list.pushBack(4);
list.pushFront(0);

console.log(list.popFront().value); // 0
console.log(list.front.value); // 1
```

Lists can be made of arbitrary objects:

```js
import List from 'list-toolkit/list.js';

class Person {
  constructor(name) {
    this.name = name;
  }
};

const john = new Person('John'),
  jane = new Person('Jane'),
  jim = new Person('Jim'),
  jill = new Person('Jill');

const people = List.from([john, jane, jim, jill]);

// iterate over the list manually:
for (let node = people.front; node !== people; node = node[people.nextName]) {
  console.log(node.name); // John, Jane, Jim, Jill
}
// yes, the link names are customizable, can be strings or symbols, for example:

const ladies = List.from([jane, jill], {nextName: 'n', prevName: 'p'});

// iterate over ladies
for (let node = ladies.front; node !== ladies; node = node.n) {
  console.log(node.name); // Jane, Jill
}

// let's move Jim to the front and John to the back:
people.moveToFront(jim);
people.moveToBack(john);

// sort the list
people.sort((a, b) => a.name.localeCompare(b.name) < 0);

for (const node of people) {
  console.log(node.name); // Jane, Jill, Jim, John
}

// let's extract all people from Jill to Jim
const ji = people.extract({from: jill, to: jim});
for (const node of people) console.log(node.name); // Jane, John
for (const node of ji) console.log(node.name); // Jim, Jill

// add them back:
people.append(ji);
for (const node of people.getReverseIterator()) {
  console.log(node.name); // Jill, Jim, John, Jane
}
ji.isEmpty === true;

// BTW, the list `ladies` is unchanged
```

## License

BSD 3-Clause "New" or "Revised" License. See the LICENSE file for details.

## Release History

* 2.2.3 *Updated dev dependencies.*
* 2.2.2 *Updated dev dependencies.*
* 2.2.1 *Technical release: updated deps, added more tests.*
* 2.2.0 *Added leftist and skew heaps.*
* 2.1.1 *Allowed functions to be used as nodes. Updated deps.*
* 2.1.0 *Added splay tree. Updated deps.*
* 2.0.0 *New major release.*

For more info consult full [release notes](https://github.com/uhop/list-toolkit/wiki/Release-notes).
