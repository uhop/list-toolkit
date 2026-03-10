# AGENTS.md — list-toolkit

> `list-toolkit` is a zero-dependency ESM JavaScript library providing list-based data structures. Works in Node.js, Bun, Deno, and browsers.

For project structure, core concepts, and the module dependency graph see [ARCHITECTURE.md](./ARCHITECTURE.md).
For detailed usage docs and API references see the [wiki](https://github.com/uhop/list-toolkit/wiki).

## Setup

```bash
git clone --recursive git@github.com:uhop/list-toolkit.git
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
- **Do not add comments or remove comments** unless explicitly asked.

## Code style

- Prettier: 160 char width, single quotes, no bracket spacing, no trailing commas, arrow parens "avoid" (see `.prettierrc`).
- 2-space indentation (`.editorconfig`).
- Imports at top of file. No dynamic imports unless necessary.

## When reading the codebase

- Start with [ARCHITECTURE.md](./ARCHITECTURE.md) for the module map and dependency graph.
- Wiki markdown files in `wiki/` contain detailed usage docs and API references.
- `list/nodes.js` and `slist/nodes.js` are the foundational modules — read them first to understand the class hierarchy.
