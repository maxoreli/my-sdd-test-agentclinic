---
name: changelog
description: Update CHANGELOG.md from git history before merging a branch.
disable-model-invocation: true
---

# Changelog

`CHANGELOG.md` lives in the repo root (`git rev-parse --show-toplevel`) and records the project's history as bullets under one heading per date. Run this before merging, so the changelog update lands with the merge.

## Format

```markdown
# Changelog

## 2026-11-16

- Add responsive design requirements to the specs and layout CSS

## 2026-11-11

- Add the Phase 1 skeleton: home page, health route, main layout, and Vitest tests
```

- One `# Changelog` title, then `## YYYY-MM-DD` headings, newest date first.
- A commit's date is its author date: `git log --date=short`.
- Each bullet is one line in the imperative mood, written for someone reading the project's history. Start from the commit subject and reword it when the subject is terse or cryptic.
- Fold fixup commits (typos, review tweaks, test fixes for the same change) into the bullet for the change they fix. Every other commit gets its own bullet.

## Steps

1. **Find the commits to log.** List the current branch's history with `git log --no-merges --date=short --format='%h %ad %s'`, using `git show --stat <hash>` when a subject doesn't tell you what changed. Skip commits that only touch `CHANGELOG.md`.
   - No `CHANGELOG.md`: every commit is in scope.
   - `CHANGELOG.md` exists: take the newest date heading. Commits on that date or later are in scope, minus any an existing bullet under that date already covers.

   Done when every in-scope commit either maps to an existing bullet or is queued for a new one.

2. **Check for uncommitted work.** If `git status` shows changes other than `CHANGELOG.md`, list them for the user: the changelog covers commits only, so they need committing first to be included.

3. **Write the entries.** Create the file with its title if it's missing. Add each new bullet under its date heading, creating the heading in date order when it doesn't exist yet. Existing entries stay exactly as written.

4. **Report.** Show the user the lines you added. The user commits the changelog.
