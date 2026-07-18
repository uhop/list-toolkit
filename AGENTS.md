# AGENTS.md — list-toolkit

> `list-toolkit` is a zero-dependency ESM JavaScript library providing list-based data structures. Works in Node.js, Bun, Deno, and browsers.

For project structure, core concepts, and the module dependency graph see [ARCHITECTURE.md](./ARCHITECTURE.md).
For detailed usage docs and API references see the [wiki](https://github.com/uhop/list-toolkit/wiki).

## Setup

```bash
git clone --recursive https://github.com/uhop/list-toolkit.git
cd list-toolkit
npm install
```

## Verification commands

- `npm test` — run the full test suite (tape-six)
- `node tests/test-<name>.js` — run a single test file directly
- `npm run test:bun` — run with Bun
- `npm run test:deno` — run with Deno
- `npm run ts-check` — TypeScript type-check (tsc --noEmit)
- `npm run ts-test` — run TypeScript typing tests (`tests/test-*.ts`)
- `npm run lint` — Prettier format check
- `npm run lint:fix` — Prettier auto-format

## Writing tests

Tests use [tape-six](https://github.com/uhop/tape-six). JS tests (`tests/test-*.js`) cover functionality; TS tests (`tests/test-*.ts`) cover typing only. See `node_modules/tape-six/TESTING.md` for the full testing API and patterns.

## Critical rules

- **ESM-only.** `'use strict'` is not used; the project is `"type": "module"`.
- **No runtime dependencies.** Never add packages to `dependencies`. Only `devDependencies` are allowed.
- **Do not modify or delete test expectations** without understanding why they changed.

## Code style

- Prettier: 160 char width, single quotes, no bracket spacing, no trailing commas, arrow parens "avoid" (see `.prettierrc`).
- 2-space indentation (`.editorconfig`).
- Imports at top of file. No dynamic imports unless necessary.
- **No comments that narrate the code.** Don't write a comment that restates _what_ the code does. Allowed, each as the shortest possible marker: JSDoc when requested or required; a reference for a non-trivial algorithm; a non-trivial _decision_ or constraint — _why_ it's this way, including footgun/ordering caveats that have a real reason. The bar is _why_, never _what_. Strip narrating comments opportunistically in files you're already editing.

## When reading the codebase

- Start with [ARCHITECTURE.md](./ARCHITECTURE.md) for the module map and dependency graph.
- Wiki markdown files in `wiki/` contain detailed usage docs and API references.
- `list/nodes.js` and `slist/nodes.js` are the foundational modules — read them first to understand the class hierarchy.
