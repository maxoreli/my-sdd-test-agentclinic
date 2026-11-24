# Changelog

## 2026-11-24

- Add the MVP spec for roadmap Phases 3–9
- Add the dashboard shell: header navigation, a staff/agent role toggle, dashboard panels, and Playwright end-to-end tests at mobile, tablet, and desktop widths
- Add the agents page and `GET /api/agents`, with a staff-only form to check in new agents
- Add ailments: the table, `GET /api/ailments`, and a form to record an ailment for an agent
- Add therapies: the menu, `GET /api/therapies`, and a staff-only form to link therapies to ailments
- Add appointments: the schedule, `GET /api/appointments`, and a booking form that rejects past times and double bookings
- Replace the dashboard placeholders with real summaries of agents, open ailments, and upcoming appointments
- Polish the clinic with Pico's jade theme, friendly 404 and error pages, an app icon, and cross-browser smoke tests
- Document the pages, role toggle, API, and end-to-end tests in the README
- Keep the severity list out of database code so the ailment form doesn't ship server-only modules to the browser
- Skip the Firefox end-to-end project on macOS 27, where Playwright's Firefox build won't launch, and mark the MVP complete

## 2026-11-23

- Show the seeded agents on the home page in a waiting room, with a friendly fallback when the database is missing or empty
- Add Vitest tests for the database client, migrations, seed, agent queries, home page waiting room, and the PicoCSS import
- Document database setup, `DATABASE_URL`, resetting, and PicoCSS styling in the README, and mark Phase 2 complete

## 2026-11-22

- Add the Phase 2 database spec and adopt PicoCSS in the tech stack
- Add Drizzle ORM and `better-sqlite3`, with a Drizzle config and a gitignored `data/` folder
- Add the `agents` table schema and its first migration, with the `db:generate` script
- Add the database client, migration runner, and `db:migrate` script
- Add an agent seed that is safe to re-run, and the `db:seed` script
- Add agent count and list queries, ordered by name
- Adopt PicoCSS for the layout, replacing the plain layout CSS

## 2026-11-18

- Add mobile-first responsive design requirements to the specs and layout CSS, Vitest tests for the home page, layout components, and health route, the `test:watch` and `validate` scripts, and the `/changelog` skill
- Move the health route test into the top-level `tests/` folder

## 2026-11-16

- Add the Phase 1 skeleton: specs, Next.js home page, main layout, and `GET /api/health` route
