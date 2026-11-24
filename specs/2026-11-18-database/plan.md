# Plan: Database (Roadmap Phase 2)

## 1. Dependencies and configuration

1. Install `drizzle-orm` and `better-sqlite3`, plus the dev dependencies `drizzle-kit` and `@types/better-sqlite3`.
2. Add `drizzle.config.ts` at the project root: dialect `sqlite`, schema `src/db/schema.ts`, output `drizzle/`, database URL from `DATABASE_URL`, defaulting to `data/agentclinic.db`.
3. Create `data/.gitkeep` and gitignore `data/*.db*`.
4. Confirm that Next.js treats `better-sqlite3` as a server external package. If the build fails, add it to `serverExternalPackages` in `next.config.ts`.

## 2. Schema and migration

1. Define the `agents` table in `src/db/schema.ts`: `id`, `name` (unique), `model`, `created_at`, as described in `requirements.md`.
2. Export the inferred types `Agent` and `NewAgent`.
3. Add the `db:generate` script (`drizzle-kit generate`) and generate the first migration into `drizzle/`. Commit the SQL and metadata.

## 3. Database client and migration runner

1. Add `src/db/client.ts`:
   - `createDb(path)` opens a `better-sqlite3` connection, enables `foreign_keys`, and returns a Drizzle instance.
   - A lazily created shared `db` uses `DATABASE_URL` or `data/agentclinic.db`.
2. Add `src/db/migrate.ts`, which exports `runMigrations(db)` using Drizzle's `better-sqlite3` migrator with the `drizzle/` folder.
3. Add the `db:migrate` script, which runs the migrator against the configured file (for example via `tsx scripts/migrate.ts`, adding `tsx` as a dev dependency).

## 4. Seed

1. Add `src/db/seed.ts`, which exports `seedAgents(db)` and inserts three or four playful agents, ignoring conflicts on `name`.
2. Add the `db:seed` script (for example `tsx scripts/seed.ts`), which runs `seedAgents` against the configured file.
3. Running `db:seed` twice must leave the same number of rows.

## 5. Agent data access

1. Add `src/db/agents.ts` with `countAgents(db)` and `listAgents(db)`. `listAgents` returns agents ordered by name.
2. Keep these functions server-only, so they are never imported from client components.

## 6. Adopt PicoCSS

1. Install `@picocss/pico` (v2) as a dependency.
2. Import `@picocss/pico/css/pico.min.css` in `src/app/layout.tsx`, before the `layout.css` import that `MainLayout` makes.
3. Update `Header`, `Main`, and `Footer` to use semantic elements with Pico's `container` class, so content is centred and sized fluidly.
4. Cut `src/components/layout/layout.css` down to overrides of Pico CSS variables (`--pico-*`). Remove plain-CSS rules that Pico already covers, such as typography, spacing, and container width.
5. Follow the PicoCSS rules in `specs/tech-stack.md`, which already lists Pico as the styling layer.

## 7. Home page shows the seeded agents

1. Make `src/app/page.tsx` dynamic (`export const dynamic = "force-dynamic"`) and read the agents through the shared `db`.
2. Below the tagline, render the waiting room as a Pico `<article>` with a heading line for the count and a plain `<ul>` of agent names. Don't add links or navigation.
3. If the database is missing, not migrated, or empty, render a friendly fallback line in the same `<article>` (for example "The waiting room is empty. Run `npm run db:seed`."). Don't throw.
4. Rely on Pico's responsive defaults. Add a variable override only if a reference width needs one, for example to make long names wrap. Don't add fixed widths.

## 8. Tests

1. `tests/db/client.test.ts`: `createDb(":memory:")` returns a working Drizzle instance.
2. `tests/db/migrate.test.ts`: after `runMigrations`, the `agents` table exists with the expected columns and the unique constraint on `name`.
3. `tests/db/seed.test.ts`: `seedAgents` inserts the expected agents. Running it twice does not duplicate rows.
4. `tests/db/agents.test.ts`: `countAgents` and `listAgents` return the seeded data, with the list ordered by name. Both return 0 and an empty list on an empty, migrated database.
5. Update `tests/app/page.test.tsx`: mock `@/db/client` with a migrated and seeded in-memory database. Assert that the waiting-room `<article>`, count, and names render, that the fallback renders when the database is empty, and that the existing assertions still pass (name, tagline, metadata, viewport, and no navigation or links).
6. Update the layout component tests: `Header`, `Main`, and `Footer` render their semantic elements with the Pico `container` class.
7. Add `tests/app/layout.test.ts`, which checks that `src/app/layout.tsx` imports the Pico stylesheet (read the source file and assert on the import, since Vitest does not render CSS).
8. Add a shared test helper in `tests/helpers/db.ts` that returns a fresh migrated (and optionally seeded) in-memory database.

## 9. Docs and validation

1. Update the README with the database setup: `npm run db:migrate`, `npm run db:seed`, `DATABASE_URL`, and how to reset by deleting `data/agentclinic.db`. Note that styling uses PicoCSS.
2. Add a Phase 2 entry to `CHANGELOG.md` covering the database and the PicoCSS adoption.
3. Run `npm run validate` and make sure the build succeeds with no `data/agentclinic.db` file present.
4. Check the home page at 360px, 768px, and 1280px widths, in both light and dark colour schemes.
5. Mark Phase 2 complete in `specs/roadmap.md`.
