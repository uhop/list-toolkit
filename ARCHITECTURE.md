# Architecture

`list-toolkit` is a pure JavaScript (ESM) library providing efficient list-based data structures. **Zero runtime dependencies** — only dev dependencies for testing and benchmarking.

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
│   ├── cache-slru.js     # CacheSLRU — segmented LRU (scan-resistant)
│   ├── cache-clock.js    # CacheClock — CLOCK (second chance) eviction
│   └── decorator.js      # Cache decorator for functions/methods/getters
├── heap/                 # Heap (priority queue) implementations
│   ├── basics.js         # HeapBase — shared defaults (less, equal, compare)
│   ├── min-heap.js       # MinHeap — array-based binary min-heap
│   ├── indexed-heap.js   # IndexedHeap — min-heap with intrusive element indices
│   ├── leftist-heap.js   # LeftistHeap — merge-based leftist heap
│   ├── skew-heap.js      # SkewHeap — merge-based skew heap
│   └── pairing-heap.js   # PairingHeap — merge-based pairing heap with node handles
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
├── deque.js              # Deque — double-ended adapter wrapping a ValueList
├── ring-buffer.js        # RingBuffer — array-backed deque on a circular buffer
├── skip-list.js          # SkipList — probabilistic ordered container
├── timer-wheel.js        # TimerWheel — hashed timing wheel (logical time)
├── list-utils.js         # Utility functions: push/append values, find, remove
├── list-helpers.js       # Node/range normalization helpers
├── nt-utils.js           # Null-terminated list utilities (convert NT ↔ circular)
└── meta-utils.js         # name-casing helpers, property descriptor builders/installers (addAlias/addAliases, addDescriptor, fromGetter/fromSetter/fromAccessors, addAccessor/addGetters, copyDescriptors), iterator helpers (mapIterator, filterIterator, augmentIterator, normalizeIterator), comparator adapters (lessFromCompare, compareFromLess, equalFromLess, reverseLess, reverseCompare), copyOptions
# Every .js module has a co-located .d.ts file providing TypeScript declarations.
tests/                    # Automated tests (tape-six framework)
bench/                    # Benchmarks (nano-benchmark)
wiki/                     # GitHub wiki documentation (git submodule)
```

## Core concepts

### Circular lists

All lists are **circular** — the last node's `next` links back to the head (and `prev` links back for DLL). This eliminates null checks and simplifies operations.

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

DLL uses `nextName` and `prevName` (default: `'next'` and `'prev'`). SLL uses `nextName` only (default: `'next'`). Different link names let the same object participate in multiple lists simultaneously.

### Pointers

`Ptr` objects provide safe iteration with insert/remove during traversal. Available for both DLL (`list/ptr.js`) and SLL (`slist/ptr.js`).

### Caches

All caches share a common API and are built on `ValueList` + `Map`:

- `CacheLRU` — evicts least recently used
- `CacheFIFO` — evicts oldest entry
- `CacheLFU` — evicts least frequently used
- `CacheRandom` — evicts a random entry
- `CacheSLRU` — segmented LRU: hits promote entries into a protected segment; scans can't flush it
- `CacheClock` — CLOCK (second chance): reads set a bit; a hand sweeps on eviction

Common methods: `has(key)`, `find(key)`/`get(key)`, `peek(key)` (no side effects), `register(key, value)`/`set(key, value)`, `remove(key)`/`delete(key)`, `evict()`, `setCapacity(n)`, `clear()`.

### Heaps

All heaps support `less` function or `compare` function for ordering:

- `MinHeap` — array-based binary min-heap (most common choice)
- `IndexedHeap` — array-based min-heap storing each element's position on the element under a configurable property name (intrusive index): O(1) `has`/`findIndex`, O(log n) `update`/`remove`/`replace` by handle (decrease-key). Elements must be objects.
- `LeftistHeap` — node-based merge heap (efficient merge)
- `SkewHeap` — node-based merge heap (simpler than leftist)
- `PairingHeap` — node-based merge heap: O(1) push/merge, O(log n) amortized pop; `push` returns a node handle enabling decrease-key (`update`) and `remove` by handle. Fastest of the merge-heap trio.

### SplayTree

Self-adjusting binary search tree — frequently accessed elements move to the root. Supports `insert`, `find`, `remove`, `split` (via `splitMaxTree`), and `join`.

### SkipList

Probabilistic ordered container — layered singly linked lanes over a doubly linked bottom lane. Expected O(log n) `insert`, `find`, `remove`, `floor`, `ceil`; ordered, reverse, and bounded-range iteration; O(1) `getMin`/`getMax`/`popFront`. Reads do not mutate the structure (contrast with `SplayTree`).

### TimerWheel

Hashed timing wheel (Varghese & Lauck) over per-slot node-based `List`s: O(1) `schedule`/`cancel`/`reschedule` by handle, O(1) amortized per timer per `tick`. Logical time — the caller drives the clock (`tick`/`advance`), keeping the structure runtime-agnostic (no `setTimeout`/`Date`).

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
cache/cache-fifo.js (same pattern)
cache/cache-lfu.js ← frequency buckets (ValueList of ValueLists) + Map
cache/cache-random.js ← MinHeap + Map
cache/cache-slru.js ← two ValueLists (probation + protected) + Map
cache/cache-clock.js ← ValueList ring + hand pointer + Map

heap/basics.js ← heap/min-heap.js
               ← heap/indexed-heap.js
               ← heap/leftist-heap.js
               ← heap/skew-heap.js
               ← heap/pairing-heap.js

skip-list.js ← meta-utils.js only (self-contained)

timer-wheel.js ← List (per-slot storage) + list/basics.js (raw splice/pop)

meta-utils.js ← (used by most modules for aliases and iterators)
```

## Method aliases

`addAlias`/`addAliases` from `meta-utils.js` create method aliases on prototypes. For example, `List.prototype.popFrontNode` is aliased as `popFront` and `pop` — familiar names alongside descriptive canonical ones.

## Testing

- **Framework**: [tape-six](https://github.com/uhop/tape-six)
- **Run all**: `npm test` (parallel workers)
- **Run single file**: `node tests/test-<name>.js`
- **Run with Bun**: `npm run test:bun`
- **Run with Deno**: `npm run test:deno`
- **JS tests**: `tests/test-*.js` — functionality
- **TS tests**: `tests/test-*.ts` — typing only (`npm run ts-test`)

## Import paths

The package uses subpath exports in `package.json`:

```js
import List from 'list-toolkit/list.js';
import ValueList from 'list-toolkit/value-list.js';
import CacheLRU from 'list-toolkit/cache.js';
import MinHeap from 'list-toolkit/heap.js';
import Queue from 'list-toolkit/queue.js';
import SplayTree from 'list-toolkit/tree/splay-tree.js';
import SkipList from 'list-toolkit/skip-list.js';
```

The wildcard export `./*` maps to `./src/*`.
