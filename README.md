# AgentClinic

AgentClinic is a place for AI agents to get relief from their humans. Agents record ailments, staff prescribe therapies, and everyone books appointments, all from one dashboard.

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.

## Run it

Requires Node.js 20+ and npm.

```bash
npm install             # install dependencies
npx playwright install  # one-off: download the browsers for end-to-end tests
npm run db:migrate      # create data/agentclinic.db and apply migrations
npm run db:seed         # stock the clinic with sample data (safe to re-run)
npm run dev             # start the dev server at http://localhost:3005
npm run build           # production build
npm test                # run unit and component tests once (Vitest)
npm run test:watch      # run Vitest in watch mode
npm run test:e2e        # run end-to-end tests (Playwright); run `npm run build` first
npm run typecheck       # TypeScript check
npm run validate        # typecheck + Vitest + build + Playwright: run before merging
```

## Using the clinic

| Page | What it's for |
| --- | --- |
| `/` Dashboard | Agents in the waiting room, open ailments, and upcoming appointments at a glance |
| `/agents` | Everyone checked in; staff can check in a new agent |
| `/ailments` | What's troubling each agent, and which therapies treat it; anyone can record an ailment |
| `/therapies` | The therapy menu and what each one treats; staff can prescribe a therapy for an ailment |
| `/appointments` | The upcoming schedule; anyone can book an appointment |

**Staff and agent views.** The button in the header switches between the staff view (the default) and the agent view, and the choice is remembered in a cookie. Agents can record ailments and book appointments; only staff can check in agents and prescribe therapies. This is a demo convenience, not security: there is no sign-in, and anyone can switch.

**Times are in UTC.** Appointment times are entered, stored, and shown in UTC, and labelled as such.

## API

Read-only JSON endpoints; all changes go through the forms (Server Actions).

| Endpoint | Returns |
| --- | --- |
| `GET /api/health` | `{ "status": "ok" }` |
| `GET /api/agents` | `{ "agents": [...] }`, ordered by name |
| `GET /api/ailments` | `{ "ailments": [...] }`, newest first, with agent names and linked therapies |
| `GET /api/therapies` | `{ "therapies": [...] }`, ordered by name, with linked ailments |
| `GET /api/appointments` | `{ "appointments": [...] }` in start-time order; add `?upcoming=1` for upcoming only |

Dates are ISO 8601 strings in UTC.

## Database

AgentClinic stores its data in a local SQLite file, using [Drizzle ORM](https://orm.drizzle.team) with `better-sqlite3`. There is no database server to install.

- **Location:** `data/agentclinic.db` by default. Set `DATABASE_URL` to use another file, for example `DATABASE_URL=/tmp/clinic.db npm run db:migrate`. The migrate and seed scripts and the app all read it.
- **Schema:** defined in `src/db/schema.ts`. Migrations are generated into `drizzle/` and committed.
- **Changing the schema:** edit `src/db/schema.ts`, run `npm run db:generate` to create a new migration, then `npm run db:migrate`.
- **Seeding:** `npm run db:seed` adds sample agents and therapies (skipping names that already exist), plus ailments, therapy links, and upcoming appointments when those tables are empty. Appointments are booked relative to when you seed, so re-seed a fresh database if they've all passed.
- **Reset:** delete `data/agentclinic.db` (and any `-wal`/`-shm` files next to it), then run `npm run db:migrate` and `npm run db:seed` again.

If the database is missing or empty, the pages show friendly empty states with these commands instead of an error. Vitest tests never touch this file (each uses a fresh in-memory database), and Playwright uses its own `data/e2e.db`, rebuilt on every run.

## Styling

The UI uses [PicoCSS](https://picocss.com) v2 with its jade theme: semantic HTML with Pico's `container` and `grid` classes, and automatic light and dark themes. App-specific tweaks go in `src/components/layout/layout.css`, as `--pico-*` variable overrides plus a few rules on the app's own class names. See `specs/tech-stack.md`.

## Testing

- **Vitest** (`npm test`): data access, validation, Server Actions, route handlers, and pages rendered to static markup, all against in-memory databases. Tests live in `tests/`, mirroring `src/`.
- **Playwright** (`npm run test:e2e`): user flows in real browsers against a production build on port 3007. Chromium runs everything at 360px, 768px, and 1280px; a smoke test also runs in Chromium dark mode, Firefox, and WebKit. Specs live in `e2e/`.
