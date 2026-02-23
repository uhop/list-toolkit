# Contributing to list-toolkit

## Prerequisites

- Node.js 16 or later
- npm

## Setup

```bash
git clone --recursive git@github.com:uhop/list-toolkit.git
cd list-toolkit
npm install
```

The `--recursive` flag is needed to clone the wiki submodule under `wiki/`.

## Project structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed module map and dependency graph.

- `src/` — all source code (ESM)
- `cjs/` — CommonJS build output (generated, gitignored)
- `tests/` — automated tests (`test-*.js`)
- `bench/` — benchmarks
- `wiki/` — GitHub wiki (git submodule)

## Development workflow

### Running tests

```bash
npm test                          # Run all tests (tape-six, parallel workers)
node tests/test-<name>.js        # Run a single test file directly
npm run test:bun                  # Run with Bun
npm run test:deno                 # Run with Deno
npm run test:seq                  # Run sequentially (no workers)
npm run test:proc                 # Run using subprocesses
```

### Building CJS

```bash
npm run build                     # Babel transpile src/ → cjs/
```

## Coding conventions

### General

- **ESM-only**: use `import`/`export` syntax.
- **No runtime dependencies**: do not add any packages to `dependencies`.
- **Formatting**: Prettier — 160 char width, single quotes, no bracket spacing, no trailing commas, arrow parens "avoid".
- **Indentation**: 2 spaces.

### Patterns

- All lists are **circular** — the last node links back to the head.
- **Hosted lists** use a `HeadNode` sentinel. **External lists** are headless.
- **Value lists** wrap values in `ValueNode`. **Node lists** use link properties on user objects.
- Method aliases are created via `addAlias`/`addAliases` from `meta-utils.js`.
- Top-level modules (e.g., `list.js`, `cache.js`) are thin re-exports of implementations in subdirectories.

### Adding new features

1. Add implementation in the appropriate `src/` subdirectory.
2. Add a top-level re-export module if needed.
3. Add tests to `tests/test-<name>.js`.
4. Run `npm test` to verify.

## AI agents

If you are an AI coding agent, see [AGENTS.md](./AGENTS.md) for detailed project conventions, commands, and architecture.
