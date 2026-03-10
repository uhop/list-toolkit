---
description: Pre-release verification checklist for list-toolkit
---

# Release Check

Run through this checklist before publishing a new version.

## Steps

1. Check that `ARCHITECTURE.md` reflects any structural changes.
2. Check that `AGENTS.md` is up to date with any rule or workflow changes.
3. Check that `.windsurfrules`, `.clinerules`, `.cursorrules` are in sync with `AGENTS.md`.
4. Check that `wiki/Home.md` links to all module wiki pages (both main sections and "Direct links").
5. Check that `wiki/Release-notes.md` is updated with the new version.
6. Check that `llms.txt` and `llms-full.txt` are up to date with any new or changed modules.
7. Verify `package.json`:
   - `files` array includes all necessary entries (`/src`, `llms.txt`, `llms-full.txt`).
   - `exports` map covers any new modules added since the last release.
8. Bump `version` in `package.json`.
9. Update release history in `README.md`.
10. Run `npm install` to regenerate `package-lock.json`.
    // turbo
11. Run the full test suite with Node: `npm test`
    // turbo
12. Run tests with Bun: `npm run test:bun`
    // turbo
13. Run tests with Deno: `npm run test:deno`
    // turbo
14. Run TypeScript typing tests (Node): `npm run ts-test`
    // turbo
15. Run TypeScript type checking: `npm run ts-check`
    // turbo
16. Run lint: `npm run lint`
    // turbo
17. Dry-run publish to verify package contents: `npm pack --dry-run`
