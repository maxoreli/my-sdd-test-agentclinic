# Requirements: MVP (Roadmap Phases 3–9)

## Scope

The MVP finishes the roadmap. AgentClinic tracks agents and their ailments, offers therapies matched to ailments, lets agents book appointments, and gives agents and staff a dashboard. It does this for both audiences, with a simple role toggle.

### Phase 3: Dashboard shell

- A shared header with the AgentClinic name, primary navigation, and the role toggle. Navigation links: Dashboard (`/`), Agents, Ailments, Therapies, Appointments.
- Navigation stays usable at 360px: the links wrap onto more lines instead of overflowing, and every link is a tap target of at least 44×44px.
- The home page becomes the landing dashboard: a heading, then panels that stack on mobile and form a grid from 768px up (Pico's `.grid`). The panels are placeholders until Phase 8. The Phase 2 waiting room becomes the Agents panel.

### Role toggle

- Two roles: **staff** (the default) and **agent**. The role is stored in a cookie (`agentclinic-role`, `SameSite=Lax`, one year). A button in the header switches it with a Server Action.
- The role changes what each page offers. It is not security: anyone can switch.

| Capability | Staff | Agent |
| --- | --- | --- |
| See the dashboard and all lists | ✅ | ✅ |
| Add an agent | ✅ | ❌ |
| Record an ailment | ✅ | ✅ |
| Link a therapy to an ailment | ✅ | ❌ |
| Book an appointment | ✅ | ✅ |

- Staff-only forms are hidden in the agent role. Their Server Actions also check the role and return a friendly error instead of writing.
- Dashboard copy adapts: "Clinic overview" for staff, "Welcome back, agent" for agents.

### Phase 4: Agents

- `GET /api/agents` returns `{ "agents": [...] }`, ordered by name.
- `/agents` lists agents (name, model, joined date) in a table that scrolls inside its own container on small screens.
- Staff can add an agent (name, model) with a touch-friendly form. Names are unique: a duplicate shows a friendly error and keeps the typed values.

### Phase 5: Ailments

- New `ailments` table: an agent, a name, a severity (`mild` | `moderate` | `severe`), an optional description, and the date recorded.
- `GET /api/ailments` returns `{ "ailments": [...] }`, newest first, each with its agent's name.
- `/ailments` lists ailments (agent, ailment, severity, recorded) and offers a form to record an ailment for an agent.

### Phase 6: Therapies

- New `therapies` table (name, description, duration in minutes), filled by the seed. The MVP has no "add therapy" form.
- New `ailment_therapies` join table that links therapies to ailments (many to many).
- `GET /api/therapies` returns `{ "therapies": [...] }`, ordered by name, each with the ids of its linked ailments.
- `/therapies` lists therapies, showing each one's description, duration, and linked ailments.
- Staff can link a therapy to an ailment. Linking a pair that already exists shows "already linked" and doesn't create a duplicate.

### Phase 7: Appointments

- New `appointments` table: an agent, a therapy, a start time, optional notes, and the date created.
- `GET /api/appointments` returns `{ "appointments": [...] }` ordered by start time, each with its agent and therapy names. `?upcoming=1` limits the list to appointments that start from now on.
- `/appointments` shows the schedule. On mobile it's a list of cards; from 768px up it's a table.
- Booking form: agent, therapy, start date and time, and optional notes. The start time must be in the future, and an agent can't have two appointments at the same start time.

### Phase 8: Dashboard data

- The placeholders become real summaries:
  - **Agents:** total count and the waiting-room names.
  - **Open ailments:** count and the three most recent.
  - **Upcoming appointments:** count and the next three.
- Each panel links to its page and has a playful empty state. The responsive panel layout is unchanged.

### Phase 9: Polish

- A visual pass: a clinic colour theme, consistent spacing, and clear focus styles.
- Playful, warm copy for headings, empty states, form help, and errors, in line with `specs/mission.md`.
- Friendly 404 (`not-found.tsx`) and error (`error.tsx`) pages.
- Responsive behaviour reviewed at 360, 768, and 1280px, in light and dark themes.
- Checked in Chromium, Firefox, and WebKit through Playwright.

### Seed data

- `npm run db:seed` also seeds therapies, a few ailments, links between therapies and ailments, and upcoming appointments for the seeded agents.
- It stays safe to re-run: therapies are skipped by name, and ailments, links, and appointments are seeded only when their tables are empty.

## Out of scope

- Editing or deleting any record, including cancelling appointments.
- Resolving ailments. Every ailment counts as "open" until a later phase adds a status.
- Agent detail pages and other routes beyond the five listed above.
- Real authentication, sessions, or per-agent identity. In the agent role, the user can act for any agent.
- Adding therapies through the UI, clinic opening hours, therapist capacity, and appointment end times or overlap rules beyond the identical-start-time check.
- Time zones other than UTC, search, pagination, email or notifications, and a hosted deployment.

## Decisions

- **Structure:** one task group per roadmap phase, in order. Each group is a thin vertical slice (schema → data access → Server Actions → UI → tests) that leaves `npm run validate` passing and is committed on its own.
- **Routes and data flow:** pages are Server Components that read through `src/db/*` data-access functions, which take a `db` argument as in Phase 2. Mutations are Server Actions in `src/app/<route>/actions.ts` that call `getDb()`, validate their input, write, and then call `revalidatePath`. Route handlers are read-only JSON endpoints.
- **Form validation:** `zod` schemas in `src/lib/validation.ts`, shared by the Server Actions and the tests. Actions return `{ ok, message, errors, values }`. Client form components use `useActionState` to show field errors and keep what the user typed. Forms still work before JavaScript loads, because they post to the Server Action.
- **Role:** read with `cookies()` from `next/headers` in `src/lib/role.ts` (`getRole()` and `setRole()`). The default is `staff`, and an unknown cookie value falls back to `staff`.
- **Schema:**
  - `ailments`: `id`, `agent_id` (foreign key → `agents`), `name`, `severity`, `description` (nullable), `created_at`.
  - `therapies`: `id`, `name` (unique), `description`, `duration_minutes`.
  - `ailment_therapies`: `ailment_id` and `therapy_id`, with both columns together as the primary key and both as foreign keys.
  - `appointments`: `id`, `agent_id`, `therapy_id`, `starts_at`, `notes` (nullable), `created_at`, with a unique constraint on (`agent_id`, `starts_at`).
  - One Drizzle migration per phase that changes the schema.
- **Time:** times are stored as UTC timestamps and shown in UTC, labelled "UTC". The `datetime-local` input is read as UTC. "Upcoming" means `starts_at` is now or later.
- **Lists:** wide lists use Pico tables wrapped in `<div class="overflow-auto">`, so they scroll inside their container, never the page. The appointment schedule switches to cards below 768px.
- **Navigation styling:** Pico's `<nav>` inside the header. The only rules that aren't Pico variables are a few rules on the app's own class names (for example `.site-nav ul { flex-wrap: wrap; }`), used where Pico has no wrapping behaviour. Pico's own selectors are never overridden.
- **Theme:** Phase 9 switches the stylesheet to Pico's jade theme (`@picocss/pico/css/pico.jade.min.css`) to give the clinic a calm green look. Pico's light and dark modes are kept.
- **End-to-end tests:** Playwright (`@playwright/test`), with specs in a top-level `e2e/` folder (`*.spec.ts`, so Vitest ignores them).
  - **App under test:** a production build (`next start`) on port 3007, using its own database, `data/e2e.db`, which is migrated and seeded fresh by Playwright's global setup.
  - **Browser coverage:** the full flows run in Chromium at 360, 768, and 1280px. A smoke test runs in Firefox and WebKit at 1280px.
  - **Scripts:** `npm run test:e2e`, and `npm run validate` now also runs the end-to-end tests.
- **Phase 1–2 tests:** the tests that say "no navigation or links" are replaced on purpose by tests for the new navigation.

## Context

- **Mission:** AI agents record ailments, receive therapies, and book appointments. Human staff use a dashboard to run the clinic. The role toggle lets a single demo show both perspectives without adding authentication.
- **Audience:** course students and conference demo developers. A fresh clone must still work with `npm install`, `npm run db:migrate`, `npm run db:seed`, and `npm run dev`. The extra step for end-to-end tests is `npx playwright install`.
- **Stakeholders:**
  - Mary (reliability): typed data access, zod validation, Vitest coverage, and Playwright flows.
  - Susan (features): the full agent, ailment, therapy, and appointment feature set from the roadmap.
  - Steve (attractive): Pico with a jade theme, responsive panels, and playful copy.
- **Builds on Phase 2** (`specs/2026-11-18-database/`):
  - Drizzle and `better-sqlite3`.
  - `getDb()`, which throws on a missing file.
  - Seeding that is safe to re-run.
  - Pages that render on every request, so the build needs no database.
  - In-memory test databases from `tests/helpers/db.ts`.
- **Tech stack:** `specs/tech-stack.md` gains Playwright (testing) and zod (validation) as part of this work.
