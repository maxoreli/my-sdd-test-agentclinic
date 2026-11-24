# Plan: MVP (Roadmap Phases 3–9)

Each task group is a roadmap phase. Finish a group with `npm run validate` passing (including end-to-end tests once group 1 adds them), mark the phase complete in `specs/roadmap.md`, and commit it on its own.

## 1. Phase 3: Dashboard shell, role toggle, and Playwright

1. **Playwright setup**
   - Install `@playwright/test` and add `playwright.config.ts`:
     - `testDir: "e2e"`
     - a `webServer` that runs `next start -p 3007` with `DATABASE_URL=data/e2e.db`
     - global setup that deletes, migrates, and seeds `data/e2e.db`
   - Add these projects:

     | Project | Browser | Viewport |
     | --- | --- | --- |
     | `chromium-mobile` | Chromium | 360×740 |
     | `chromium-tablet` | Chromium | 768×1024 |
     | `chromium-desktop` | Chromium | 1280×800 |
     | `firefox-desktop` (smoke only) | Firefox | 1280×800 |
     | `webkit-desktop` (smoke only) | WebKit | 1280×800 |

   - Add the `test:e2e` script (`playwright test`). Change `validate` to run typecheck, `test`, build, and then `test:e2e`.
   - Gitignore `test-results/`, `playwright-report/`, and `data/e2e.db*`.
2. **Tech stack:** install `zod`. Update `specs/tech-stack.md` to list Playwright and zod, and describe the `e2e/` folder and the new `validate`.
3. **Role**
   - Add `src/lib/role.ts`:
     - the `Role` type (`"staff" | "agent"`)
     - `parseRole(value)`, which defaults to `staff`
     - `getRole()`, which reads the cookie
     - `canManage(role)`, which is true for staff only
   - Add the `switchRole` Server Action in `src/app/actions.ts`. It sets the `agentclinic-role` cookie and revalidates the layout.
4. **Header**
   - Extend `Header` with `<nav class="site-nav">`, holding the five links and the role toggle (a form with one button: "Switch to agent view" or "Switch to staff view", plus a label for the current role).
   - Mark the current page with `aria-current="page"` from a small client `NavLink` component.
   - In `layout.css`, add only the wrapping rule needed for the nav, scoped to `.site-nav`. Links and buttons get a minimum 44px height through Pico's spacing variables.
5. **Dashboard:** turn `src/app/page.tsx` into the dashboard. It has a role-aware heading and a `<div class="grid">` of three `<article>` panels: Agents (the existing waiting room), Open ailments (placeholder), and Upcoming appointments (placeholder).
6. **Stub pages:** add `/agents`, `/ailments`, `/therapies`, and `/appointments`, each with a heading and a "coming soon" line. Later groups replace them, but every link in the nav works from this group on.
7. **Vitest**
   - Unit tests: `parseRole` and `canManage`, and `switchRole` with `next/headers` and `next/cache` mocked.
   - Header: the nav renders five links and the role toggle label changes with the role.
   - Dashboard: three panels, a role-aware heading, and the waiting room still works.
   - Replace the Phase 1–2 assertions that say "no navigation or links".
8. **Playwright** (`e2e/shell.spec.ts`)
   - Every nav link loads its page.
   - Switching the role changes the label and the dashboard heading, and the role survives a reload.
   - At every width: no horizontal scrolling, nav links are at least 44×44px, and dashboard panels stack below 768px and sit side by side from 768px up.
9. Mark Phase 3 complete.

## 2. Phase 4: Agents

1. **Data access:** add `createAgent(db, input)` to `src/db/agents.ts`. It returns the new agent, or a `duplicate-name` result when the name is taken.
2. **Validation:** add `agentSchema` (name 1–60 characters, model 1–60, both trimmed) to `src/lib/validation.ts`.
3. **Route handler:** `GET /api/agents` in `src/app/api/agents/route.ts` returns `{ agents }`, with dates as ISO strings.
4. **Server Action:** `addAgent` in `src/app/agents/actions.ts`. It checks the role (staff only), validates, creates the agent, and revalidates `/agents` and `/`.
5. **Page**
   - `/agents` shows the agents table (name, model, joined) inside `overflow-auto`.
   - The `AddAgentForm` client component appears only for staff. It shows field errors and keeps values, and shows a success message after adding.
6. **Vitest**
   - `createAgent`: success and duplicate name.
   - `agentSchema` edge cases.
   - The route handler's JSON.
   - `addAgent`: success, validation errors, duplicate, and refusal in the agent role.
   - Page rendering for each role.
7. **Playwright** (`e2e/agents.spec.ts`)
   - Staff add an agent and it appears in the list and on the dashboard.
   - A duplicate name shows an error.
   - The agent role sees no add form.
   - The table doesn't make the page scroll sideways at 360px.
8. Mark Phase 4 complete.

## 3. Phase 5: Ailments

1. **Schema and migration:** add the `ailments` table and the `Severity` type to the schema, then run `db:generate` to create the migration.
2. **Data access:** `src/db/ailments.ts` with `listAilments(db)` (newest first, joined with the agent's name), `countAilments(db)`, and `createAilment(db, input)`.
3. **Validation:** `ailmentSchema`. The agent id must exist, name 1–80 characters, severity is one of the three values, and the description is optional (up to 500 characters).
4. **Route handler:** `GET /api/ailments`.
5. **Server Action:** `recordAilment`, open to both roles. It validates, rejects an unknown agent, inserts, and revalidates `/ailments` and `/`.
6. **Page:** `/ailments` shows the table and a `RecordAilmentForm` (agent select, name, severity select, description).
7. **Seed:** add ailments for the seeded agents. They're inserted only when the `ailments` table is empty.
8. **Vitest:**
   - the migration's columns and foreign key
   - data access
   - schema validation
   - the route handler
   - the action (success, unknown agent, invalid input)
   - the page
   - the seed being safe to re-run
9. **Playwright** (`e2e/ailments.spec.ts`)
   - Recording an ailment in each role shows it in the list.
   - Validation errors appear when fields are empty.
   - The form is usable at 360px.
10. Mark Phase 5 complete.

## 4. Phase 6: Therapies

1. **Schema and migration:** add the `therapies` and `ailment_therapies` tables.
2. **Data access:** `src/db/therapies.ts` with:
   - `listTherapies(db)`, which includes each therapy's linked ailments
   - `linkTherapy(db, ailmentId, therapyId)`, which reports `linked`, `already-linked`, or `not-found`
3. **Validation:** `linkSchema`.
4. **Route handler:** `GET /api/therapies`.
5. **Server Action:** `linkTherapyToAilment`, staff only. It validates, links, and revalidates `/therapies` and `/ailments`.
6. **Page:** `/therapies` lists the therapies with description, duration, and linked ailments. Staff also see a `LinkTherapyForm` (ailment select, therapy select).
7. **Ailments page:** add a "Therapies" column that lists each ailment's linked therapies.
8. **Seed:** add a therapy catalogue (for example "Context Window Decluttering", "Hallucination Grounding Session", "Prompt Detox", "Token Budget Counselling"), skipped by name when already there. Also seed links when the join table is empty.
9. **Vitest:**
   - the migration
   - the link results (`linked`, `already-linked`, `not-found`)
   - the route handler
   - the action, including its role check
   - the page for each role
   - the seed
10. **Playwright** (`e2e/therapies.spec.ts`)
    - Staff link a therapy, and it shows on both the therapies page and the ailments page.
    - Linking the same pair again says "already linked".
    - The agent role sees no link form.
11. Mark Phase 6 complete.

## 5. Phase 7: Appointments

1. **Schema and migration:** add the `appointments` table, with the unique (`agent_id`, `starts_at`) constraint.
2. **Data access:** `src/db/appointments.ts` with:
   - `listAppointments(db, { upcomingFrom? })`, ordered by start time and joined with agent and therapy names
   - `countUpcoming(db, now)`
   - `createAppointment(db, input)`, which reports `created`, `double-booked`, or `not-found`
3. **Validation:** `appointmentSchema`.
   - Agent and therapy are required.
   - `startsAt` is parsed from `datetime-local` as UTC and must be in the future, with the current time passed in so tests can control it.
   - Notes are optional, up to 300 characters.
4. **Route handler:** `GET /api/appointments`, which supports `?upcoming=1`.
5. **Server Action:** `bookAppointment`, open to both roles. It returns friendly errors for a time in the past, a double booking, or an unknown agent or therapy.
6. **Page:** `/appointments`
   - The schedule is a list of cards below 768px and a table from 768px up. Use semantic markup for both, with the switch done by a scoped class rule in `layout.css`.
   - It has a `BookAppointmentForm` (agent, therapy, `datetime-local` labelled "UTC", notes).
7. **Seed:** add upcoming appointments relative to the time of seeding, only when the `appointments` table is empty.
8. **Vitest:**
   - the migration and its unique constraint
   - ordering and upcoming filtering, using a fixed time
   - the schema's past and future checks
   - the route handler with and without `upcoming`
   - the action's results
   - the page
9. **Playwright** (`e2e/appointments.spec.ts`)
   - Both roles book an appointment and see it in the schedule.
   - A time in the past is rejected.
   - A double booking is rejected.
   - The schedule shows cards at 360px and a table at 1280px, with no horizontal scrolling.
10. Mark Phase 7 complete.

## 6. Phase 8: Dashboard data

1. **Data:** `src/db/dashboard.ts` with `getDashboardSummary(db, now)`. It returns the agent count and names, the ailment count and the three latest ailments, and the upcoming-appointment count and the next three.
2. **Panels:** replace the placeholders with summary panels. Each shows a count, a short list, a link to its page, and a playful empty state. Errors from a missing database still show the Phase 2 fallback.
3. **Vitest:** the summary on an empty and a seeded database with a fixed time, and the panels for both data and empty states.
4. **Playwright** (`e2e/dashboard.spec.ts`)
   - The counts match the seeded data.
   - Adding an agent, ailment, or appointment updates the dashboard.
   - The panel grid stacks at 360px and sits side by side from 768px up.
5. Mark Phase 8 complete.

## 7. Phase 9: Polish

1. **Theme:** switch the import to `@picocss/pico/css/pico.jade.min.css`, and update `specs/tech-stack.md` and the layout test. Adjust `--pico-*` variables for spacing and focus styles only where needed.
2. **Copy:** a pass over headings, empty states, form help, success messages, and errors, so all of it is playful but clear.
3. **Error pages:** add `src/app/not-found.tsx` and `src/app/error.tsx`, styled with Pico and with a link back to the dashboard.
4. **Metadata:** each page sets its own `title` (for example "Agents · AgentClinic").
5. **Accessibility:**
   - Every form control has a label.
   - Errors are linked to their fields with `aria-describedby`.
   - Focus is visible.
   - Colour contrast passes in both themes.
6. **Vitest:** tests for the 404 page, the error page, and each page's metadata.
7. **Playwright** (`e2e/smoke.spec.ts`)
   - A smoke test across Chromium, Firefox, and WebKit: every page loads, and an appointment can be booked.
   - A 404 test.
   - At every width, a check for horizontal scrolling on every page.
   - In Chromium, the same checks with `colorScheme: "dark"`.
8. Mark Phase 9 complete.

## 8. Docs and merge readiness

1. **README:**
   - the role toggle
   - the five pages and four API endpoints
   - `npx playwright install` and `npm run test:e2e`
   - the new `validate`
   - a reminder that times are in UTC
2. Add MVP entries to `CHANGELOG.md`, using the `/changelog` format.
3. **Fresh-clone check:** run `npm install`, `npx playwright install`, `npm run db:migrate`, `npm run db:seed`, and `npm run validate`.
4. Work through `validation.md`, then mark the MVP complete in `specs/roadmap.md`.
