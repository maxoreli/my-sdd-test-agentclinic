# Validation: Database (Roadmap Phase 2)

The work can be merged when all of these pass.

## Automated

`npm run validate` runs all of these:

- [ ] `npm run typecheck` passes with no errors.
- [ ] `npm test` passes all Vitest tests, each using a fresh in-memory database:
  - [ ] `createDb(":memory:")` returns a working Drizzle client.
  - [ ] Migrations create the `agents` table with `id`, `name` (unique), `model`, and `created_at`.
  - [ ] `seedAgents` inserts the expected agents, and running it twice does not create duplicates.
  - [ ] `countAgents` and `listAgents` return the seeded data, with the list ordered by name. On an empty, migrated database they return 0 and an empty list.
  - [ ] The home page renders the waiting-room count and the seeded agent names.
  - [ ] The home page renders the friendly fallback when the database is empty, without throwing.
  - [ ] The home page renders the waiting room inside an `<article>`, with the names in a `<ul>`.
  - [ ] `src/app/layout.tsx` imports the Pico stylesheet `@picocss/pico/css/pico.min.css`.
  - [ ] `Header`, `Main`, and `Footer` render their semantic elements with the Pico `container` class.
  - [ ] The Phase 1 tests still pass: health route, home page name, tagline, metadata, viewport, no navigation or links, and the layout components.
- [ ] `npm run build` completes successfully when no `data/agentclinic.db` file is present.

## Manual

- [ ] On a fresh clone: `npm install`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`. The app starts without errors on `http://localhost:3005`.
- [ ] `data/agentclinic.db` exists after `db:migrate`, and git does not track it.
- [ ] Running `npm run db:seed` a second time succeeds and the agent count on the home page stays the same.
- [ ] The home page shows the waiting-room line and agent names. Viewing the page source shows them server-rendered in the HTML.
- [ ] Deleting `data/agentclinic.db` and reloading the home page shows the friendly fallback, not an error page.
- [ ] Setting `DATABASE_URL` to another path makes migrate, seed, and the app use that file.
- [ ] The page source links the Pico stylesheet, and the page shows Pico's typography and spacing.
- [ ] Switching the OS or browser between light and dark mode switches Pico's colour scheme, and the text stays readable in both.
- [ ] At 360px (mobile), 768px (tablet), and 1280px (desktop) widths, the home page and waiting room are readable, long names wrap, body text is at least 16px, and there is no horizontal scrolling.
- [ ] `GET http://localhost:3005/api/health` still returns 200 with `{ "status": "ok" }`.

## Hygiene

- [ ] The generated migration in `drizzle/` is committed and matches `src/db/schema.ts`. Running `npm run db:generate` produces no new changes.
- [ ] The database client and data access are imported only from server code, never from client components.
- [ ] Test files live in `tests/`, mirroring `src/`, and import code through `@/`.
- [ ] The README documents database setup, seeding, `DATABASE_URL`, and how to reset.
- [ ] `CHANGELOG.md` has a Phase 2 entry, and `specs/roadmap.md` marks Phase 2 complete.
- [ ] `specs/tech-stack.md` lists PicoCSS as the styling layer.
- [ ] `layout.css` contains only `--pico-*` variable overrides (plus any minimal rule a reference width needs), with no fixed desktop widths and no overrides of Pico's own selectors.
- [ ] PicoCSS is the only CSS framework; no Tailwind or other UI library has been added.
- [ ] No other tables or features beyond Phase 2 have been added.
