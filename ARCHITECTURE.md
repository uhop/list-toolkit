# Architecture

`list-toolkit` is a pure JavaScript (ESM) library providing efficient list-based data structures. It has **zero runtime dependencies** — only dev dependencies for testing and benchmarking.

## Project layout

```
src/                      # All source code (ESM)
├── list/                 # DLL (doubly linked list) foundation and implementations
│   ├── nodes.js          # Node, HeadNode, ValueNode, PtrBase, ExtListBase
│   ├── basics.js         # Low-level splice, pop, append operations
│   ├── core.js           # List class (hosted node-based DLL)
│   ├── value.js          # ValueList class (hosted value-based DLL)
│   ├── ext.js            # ExtList class (headless node-based DLL)
│   ├── ext-value.js      # ExtValueList class (headless value-based DLL)
│   └── ptr.js            # Ptr class (safe DLL iterator with insert/remove)
├── slist/                # SLL (singly linked list) foundation and implementations
│   ├── nodes.js          # SLL Node, HeadNode, ValueNode, PtrBase, ExtListBase
│   ├── basics.js         # Low-level SLL splice, pop, append operations
│   ├── core.js           # SList class (hosted node-based SLL)
│   ├── value.js          # ValueSList class (hosted value-based SLL)
│   ├── ext.js            # ExtSList class (headless node-based SLL)
│   ├── ext-value.js      # ExtValueSList class (headless value-based SLL)
│   └── ptr.js            # Ptr class (safe SLL iterator with insert/remove)
├── cache/                # Cache implementations (all built on ValueList + Map)
│   ├── cache-lru.js      # CacheLRU — least recently used eviction
│   ├── cache-fifo.js     # CacheFIFO — first in first out eviction
│   ├── cache-lfu.js      # CacheLFU — least frequently used eviction
│   ├── cache-random.js   # CacheRandom — random eviction
│   └── decorator.js      # Cache decorator for functions/methods/getters
├── heap/                 # Heap (priority queue) implementations
│   ├── basics.js         # HeapBase — shared defaults (less, equal, compare)
│   ├── min-heap.js       # MinHeap — array-based binary min-heap
│   ├── leftist-heap.js   # LeftistHeap — merge-based leftist heap
│   └── skew-heap.js      # SkewHeap — merge-based skew heap
├── tree/                 # Tree implementations
│   └── splay-tree.js     # SplayTree — self-adjusting binary search tree
├── list.js               # Re-export: List from list/core.js
├── value-list.js         # Re-export: ValueList from list/value.js
├── slist.js              # Re-export: SList from slist/core.js
├── value-slist.js        # Re-export: ValueSList from slist/value.js
├── ext-list.js           # Re-export: ExtList from list/ext.js
├── ext-value-list.js     # Re-export: ExtValueList from list/ext-value.js
├── ext-slist.js          # Re-export: ExtSList from slist/ext.js
├── ext-value-slist.js    # Re-export: ExtValueSList from slist/ext-value.js
├── cache.js              # Re-export: CacheLRU + cacheDecorator
├── heap.js               # Re-export: MinHeap from heap/min-heap.js
├── queue.js              # Queue — adapter class wrapping a ValueList
├── stack.js              # Stack — adapter class wrapping a ValueList
├── list-utils.js         # Utility functions: push/append values, find, remove
├── list-helpers.js       # Node/range normalization helpers
├── nt-utils.js           # Null-terminated list utilities (convert NT ↔ circular)
└── meta-utils.js         # addAlias, addAliases, iterators, copyOptions
# Every .js module has a co-located .d.ts file providing TypeScript declarations.
tests/                    # Automated tests (tape-six framework)
bench/                    # Benchmarks (nano-benchmark)
wiki/                     # GitHub wiki documentation (git submodule)
```

## Core concepts

### Circular lists

All lists in the toolkit are **circular** — the last node's `next` pointer links back to the head (and `prev` links back for DLL). This eliminates null checks and simplifies operations.

### Node types

| Class       | Description                                       | Module                            |
| ----------- | ------------------------------------------------- | --------------------------------- |
| `Node`      | Base node with configurable link properties       | `list/nodes.js`, `slist/nodes.js` |
| `HeadNode`  | Sentinel node for hosted lists (extends `Node`)   | `list/nodes.js`, `slist/nodes.js` |
| `ValueNode` | Node wrapping an arbitrary value (extends `Node`) | `list/nodes.js`, `slist/nodes.js` |

### List variants

| Variant              | DLL            | SLL             | Description                                               |
| -------------------- | -------------- | --------------- | --------------------------------------------------------- |
| Hosted node-based    | `List`         | `SList`         | Uses `HeadNode` sentinel; link properties on user objects |
| Hosted value-based   | `ValueList`    | `ValueSList`    | Uses `HeadNode` sentinel; wraps values in `ValueNode`     |
| External node-based  | `ExtList`      | `ExtSList`      | Headless; points into existing circular list              |
| External value-based | `ExtValueList` | `ExtValueSList` | Headless; points into existing value circular list        |

### Customizable link names

DLL uses `nextName` and `prevName` (default: `'next'` and `'prev'`). SLL uses `nextName` (default: `'next'`). This allows the same object to participate in multiple lists simultaneously using different link property names.

### Pointers

`Ptr` objects provide safe iteration with the ability to insert and remove nodes during traversal. Available for both DLL and SLL via `list/ptr.js` and `slist/ptr.js`.

### Caches

All caches share a common API and are built on `ValueList` + `Map`:

- `CacheLRU` — evicts least recently used
- `CacheFIFO` — evicts oldest entry
- `CacheLFU` — evicts least frequently used
- `CacheRandom` — evicts a random entry

Common methods: `has(key)`, `find(key)`/`get(key)`, `register(key, value)`/`set(key, value)`, `remove(key)`/`delete(key)`, `clear()`.

### Heaps

All heaps support `less` function or `compare` function for ordering:

- `MinHeap` — array-based binary min-heap (most common choice)
- `LeftistHeap` — node-based merge heap (efficient merge)
- `SkewHeap` — node-based merge heap (simpler than leftist)

### SplayTree

Self-adjusting binary search tree. Frequently accessed elements move to the root. Supports `insert`, `find`, `remove`, `split` (via `splitMaxTree`), and `join`.

## Module dependency graph (simplified)

```
list/nodes.js ← list/basics.js ← list/core.js (List)
     ↑                ↑              ↑
     |                |         list/value.js (ValueList)
     |                |              ↑
     |           list/ext.js    list/ext-value.js
     |
list/ptr.js

slist/nodes.js ← slist/basics.js ← slist/core.js (SList)
     ↑                 ↑               ↑
     |                 |          slist/value.js (ValueSList)
     |                 |               ↑
     |            slist/ext.js   slist/ext-value.js
     |
slist/ptr.js

cache/cache-lru.js ← ValueList + Map
cache/cache-fifo.js, cache-lfu.js, cache-random.js (same pattern)

heap/basics.js ← heap/min-heap.js
               ← heap/leftist-heap.js
               ← heap/skew-heap.js

meta-utils.js ← (used by most modules for aliases and iterators)
```

## Method aliases

The library uses `addAlias`/`addAliases` from `meta-utils.js` to create method aliases on prototypes. For example, `List.prototype.popFrontNode` is aliased as `popFront` and `pop`. This provides a familiar API while keeping the canonical method names descriptive.

## Testing

- **Framework**: [tape-six](https://github.com/uhop/tape-six)
- **Run all**: `npm test` (parallel workers)
- **Run single file**: `node tests/test-<name>.js`
- **Run with Bun**: `npm run test:bun`
- **Run with Deno**: `npm run test:deno`
- **Test files**: `tests/test-*.js`

## Import paths

The package uses subpath exports in `package.json`:

```js
import List from 'list-toolkit/list.js';
import ValueList from 'list-toolkit/value-list.js';
import CacheLRU from 'list-toolkit/cache.js';
import MinHeap from 'list-toolkit/heap.js';
import Queue from 'list-toolkit/queue.js';
import SplayTree from 'list-toolkit/tree/splay-tree.js';
```

The wildcard export `./*` maps to `./src/*`. CJS consumers can use `require()` with Node.js 22+ which natively loads ESM modules.
