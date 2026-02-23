---
description: Checklist for adding a new public module to list-toolkit
---

# Add a New Module

Follow these steps when adding a new public module.

## Implementation

1. Create `src/<name>.js` (or `src/<category>/<name>.js` for categorized modules) with the implementation.
   - ESM only. Use `.js` extensions in all imports.
   - No runtime dependencies.
2. Create `tests/test-<name>.js` with automated tests (tape-six).
   // turbo
3. Run the new test: `node tests/test-<name>.js`

## Wiring

4. If the module needs a short import path (e.g., `list-toolkit/<name>`), create a thin re-export module at `src/<name>.js` and add an entry to `exports` in `package.json`.
5. Create a wiki page following the existing naming conventions:
   - Lists: `wiki/DLL:-<name>.md` or `wiki/SLL:-<name>.md`
   - Heaps: `wiki/Heaps:-<name>.md`
   - Trees: `wiki/Trees:-<name>.md`
   - Adapters/utilities: `wiki/<Name>.md`
6. Add a link to the new wiki page in `wiki/Home.md` (both the main section and the "Direct links" sections).

## Documentation updates

7. Update `ARCHITECTURE.md` — add the module to the project layout tree and dependency graph if applicable.
8. Update `llms.txt` with a brief description of the new module.
9. Update `llms-full.txt` with the full API reference for the new module.
10. Update `AGENTS.md` if the module changes the architecture quick reference.

## Verification

    // turbo

11. Run the full test suite: `npm test`
