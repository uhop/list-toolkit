# List toolkit [![NPM version][npm-img]][npm-url]

[npm-img]: https://img.shields.io/npm/v/list-toolkit.svg
[npm-url]: https://npmjs.org/package/list-toolkit

Efficient list-based data structures for JavaScript.
Pure ESM, zero dependencies, works in Node.js, Bun, Deno, and browsers.

Data structures included:

- **Linked lists** — doubly and singly linked, circular. Node-based (link properties on your objects) or value-based (wraps values in nodes). Hosted (sentinel head) or headless (external pointer).
- **NT list converters** — convert null-terminated lists to/from circular lists in place.
- **Heaps** — min heap, leftist heap, skew heap.
- **Caches** — LRU, LFU, FIFO, random eviction. Includes a decorator for functions, methods, and getters.
- **Queue and Stack** — list-backed adapters.
- **Splay tree** — self-adjusting binary search tree.
- **Utilities** — push/append values, find, remove, validate, and more.

Works with your existing linked lists — no wrapper objects required.

- Flexible, efficient, simple.
- Zero dependencies, no surprises.
- Pay only for what you use.
- Usable as a foundation for other data structures.

**Read all about the implemented ideas in the [Backgrounder](https://github.com/uhop/list-toolkit/wiki/Backgrounder).**

All lists share a consistent API: create from iterables, push/pop, insert/extract/remove, forward and reverse iterators, sort, reverse, and customizable link names.

**Full documentation: [wiki](https://github.com/uhop/list-toolkit/wiki).**

## Installation

```bash
npm install list-toolkit
```

## Introduction

See the [wiki](https://github.com/uhop/list-toolkit/wiki) for full documentation. Quick examples below.

Value lists wrap arbitrary values:

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

console.log(list.popFront()); // 0
console.log(list.front.value); // 1
```

Lists can be made of arbitrary objects:

```js
import List from 'list-toolkit/list.js';

class Person {
  constructor(name) {
    this.name = name;
  }
}

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
const ji = people.extractRange({from: jill, to: jim});
for (const node of people) console.log(node.name); // Jane, John
for (const node of ji) console.log(node.name); // Jill, Jim

// add them back:
people.append(ji);
for (const node of people.getReverseIterator()) {
  console.log(node.name); // Jim, Jill, John, Jane
}
ji.isEmpty === true;

// BTW, the list `ladies` is unchanged
```

## License

BSD 3-Clause "New" or "Revised" License. See the LICENSE file for details.

## Release History

- 2.3.1 _Bugfixes. Improved TS typing tests. Updated docs. Updated dev dependencies._
- 2.3.0 _Added TypeScript declarations for all modules. Added JSDoc. Removed CJS build. Bugfixes. Added missing methods._
- 2.2.6 _Updated dev dependencies._
- 2.2.5 _Updated dev dependencies._
- 2.2.4 _Updated dev dependencies._
- 2.2.3 _Updated dev dependencies._
- 2.2.2 _Updated dev dependencies._
- 2.2.1 _Technical release: updated deps, added more tests._
- 2.2.0 _Added leftist and skew heaps._
- 2.1.1 _Allowed functions to be used as nodes. Updated deps._
- 2.1.0 _Added splay tree. Updated deps._
- 2.0.0 _New major release._

For more info consult full [release notes](https://github.com/uhop/list-toolkit/wiki/Release-notes).
