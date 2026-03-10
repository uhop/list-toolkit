---
description: Update AI-facing documentation files after API or architecture changes
---

# AI Documentation Update

Update all AI-facing files after changes to the public API or project structure.

## Steps

1. Read source files in `src/` to identify the current public API.
2. Read `AGENTS.md` and `ARCHITECTURE.md` for current state.
3. Update `llms.txt`:
   - Ensure the module list and API summaries match the source and `.d.ts` files.
   - Update key concepts if new features were added.
   - Keep it concise — this is for quick LLM consumption.
4. Update `llms-full.txt`:
   - Full API reference with all methods, options, and examples.
5. Update `ARCHITECTURE.md` if project structure or module dependencies changed.
6. Update `AGENTS.md` if critical rules, commands, or architecture references changed.
7. Sync `.windsurfrules`, `.cursorrules`, `.clinerules` if `AGENTS.md` critical rules or code style changed:
   - These three files should be identical copies.
8. Update `wiki/Home.md` if the overview needs to reflect new features.
9. Track progress with the todo list and provide a summary when done.
