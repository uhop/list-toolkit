# AGENTS.md — list-toolkit

> `list-toolkit` is a zero-dependency ESM JavaScript library providing list-based data structures: doubly and singly linked circular lists, caches (LRU, LFU, FIFO, random), heaps (min, leftist, skew), queues, stacks, splay trees, and null-terminated list utilities. Works in Node.js, Bun, Deno, and browsers.

## Setup

This project uses git submodules (wiki):

```bash
git clone --recursive git@github.com:uhop/list-toolkit.git
cd list-toolkit
npm install
```

## Commands

- **Install:** `npm install`
- **Test (Node):** `npm test` (runs `tape6 --flags FO`)
- **Test (Bun):** `npm run test:bun`
- **Test (Deno):** `npm run test:deno`
- **Test (sequential):** `npm run test:seq`
- **Test (subprocesses):** `npm run test:proc`

## Project structure

```
list-toolkit/
├── src/                  # Source code (ESM)
│   ├── list/             # DLL foundation, core, pointers, ext, value
│   │   ├── nodes.js      # Node, HeadNode, ValueNode, PtrBase, ExtListBase
│   │   ├── basics.js     # Low-level splice/pop/append
│   │   ├── core.js       # List class (hosted node-based DLL)
│   │   ├── value.js      # ValueList class (hosted value-based DLL)
│   │   ├── ext.js        # ExtList class (headless node-based DLL)
│   │   ├── ext-value.js  # ExtValueList class (headless value-based DLL)
│   │   └── ptr.js        # Ptr class for DLL
│   ├── slist/            # SLL foundation, core, pointers, ext, value
│   │   ├── nodes.js      # SLL Node, HeadNode, ValueNode, PtrBase, ExtListBase
│   │   ├── basics.js     # Low-level SLL splice/pop/append
│   │   ├── core.js       # SList class (hosted node-based SLL)
│   │   ├── value.js      # ValueSList class (hosted value-based SLL)
│   │   ├── ext.js        # ExtSList class (headless node-based SLL)
│   │   ├── ext-value.js  # ExtValueSList class (headless value-based SLL)
│   │   └── ptr.js        # Ptr class for SLL
│   ├── cache/            # Cache implementations
│   │   ├── cache-lru.js  # CacheLRU (least recently used)
│   │   ├── cache-fifo.js # CacheFIFO (first in first out)
│   │   ├── cache-lfu.js  # CacheLFU (least frequently used)
│   │   ├── cache-random.js # CacheRandom (random eviction)
│   │   └── decorator.js  # Cache decorator for functions/methods
│   ├── heap/             # Heap implementations
│   │   ├── basics.js     # HeapBase with defaults
│   │   ├── min-heap.js   # MinHeap (array-based binary heap)
│   │   ├── leftist-heap.js # LeftistHeap (merge-based)
│   │   └── skew-heap.js  # SkewHeap (merge-based)
│   ├── tree/             # Tree implementations
│   │   └── splay-tree.js # SplayTree
│   ├── list.js           # Re-export of list/core.js
│   ├── value-list.js     # Re-export of list/value.js
│   ├── slist.js          # Re-export of slist/core.js
│   ├── value-slist.js    # Re-export of slist/value.js
│   ├── ext-list.js       # Re-export of list/ext.js
│   ├── ext-value-list.js # Re-export of list/ext-value.js
│   ├── ext-slist.js      # Re-export of slist/ext.js
│   ├── ext-value-slist.js# Re-export of slist/ext-value.js
│   ├── cache.js          # Re-export of cache/cache-lru.js + decorator
│   ├── heap.js           # Re-export of heap/min-heap.js
│   ├── queue.js          # Queue adapter class
│   ├── stack.js          # Stack adapter class
│   ├── list-utils.js     # List utility functions
│   ├── list-helpers.js   # Node/range normalization helpers
│   ├── nt-utils.js       # Null-terminated list utilities
│   └── meta-utils.js     # addAlias, addAliases, iterators, copyOptions
├── tests/                # Test files (test-*.js)
├── bench/                # Benchmarks
├── wiki/                 # GitHub wiki documentation (submodule)
```

## Code style

- **ES modules** throughout (`"type": "module"` in package.json).
- **`'use strict'`** at the top of every source file.
- **Prettier** for formatting (see `.prettierrc`): 160 char width, single quotes, no bracket spacing, no trailing commas, arrow parens "avoid".
- 2-space indentation (`.editorconfig`).
- Imports at top of file, using `import` syntax.
- **No runtime dependencies.** Only `devDependencies` are allowed.
- **Do not modify or delete test expectations** without understanding why they changed.
- **Do not add comments or remove comments** unless explicitly asked.

## Architecture

- All lists are **circular**: the last node links back to the head.
- **DLL** (doubly linked lists) use customizable `nextName`/`prevName` link properties (default: `next`/`prev`).
- **SLL** (singly linked lists) use a customizable `nextName` link property (default: `next`).
- **Hosted lists** (`List`, `ValueList`, `SList`, `ValueSList`) use a `HeadNode` as the sentinel.
- **External (headless) lists** (`ExtList`, `ExtValueList`, `ExtSList`, `ExtValueSList`) point into an existing circular list without a sentinel.
- **Value lists** wrap arbitrary values in `ValueNode` containers. **Node lists** use custom link properties directly on user objects.
- **Pointers** (`Ptr`) provide safe iteration with insert/remove during traversal.
- **Caches** are built on top of `ValueList` + `Map`. All share the same API: `has`, `find`/`get`, `register`/`set`, `remove`/`delete`, `clear`.
- **Heaps** support `less` function or `compare` function for ordering. `MinHeap` is array-based; `LeftistHeap` and `SkewHeap` are node-based merge heaps.
- **SplayTree** is a self-adjusting binary search tree with `insert`, `find`, `remove`, `split`, `join`.
- Method aliases are created via `addAlias`/`addAliases` from `meta-utils.js`.

## Key conventions

- Do not add dependencies unless absolutely necessary — the library is intentionally zero-dependency.
- Top-level modules (e.g., `list.js`, `cache.js`, `heap.js`) are thin re-exports of the actual implementations in subdirectories.
- Wiki documentation lives in the `wiki/` submodule.
- Test files follow the naming convention `test-*.js` in `tests/`.

## When reading the codebase

- Start with `ARCHITECTURE.md` for the module map and dependency graph.
- Wiki markdown files in `wiki/` contain detailed usage docs and API references.
- `list/nodes.js` and `slist/nodes.js` are the foundational modules — read them first to understand the class hierarchy.
