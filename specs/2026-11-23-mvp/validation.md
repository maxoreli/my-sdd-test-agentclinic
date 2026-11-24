# Validation: MVP (Roadmap Phases 3–9)

The MVP can be merged when all of these pass.

## Automated

`npm run validate` runs typecheck, Vitest, build, and then Playwright, in that order.

- [ ] `npm run typecheck` passes with no errors.
- [ ] `npm run build` completes with no database file present.

### Vitest (`npm test`)

All Vitest tests run against fresh in-memory databases, with fixed times wherever time matters.

- [ ] **Role**
  - [ ] `parseRole` defaults to `staff`, including for unknown values.
  - [ ] `canManage` is true for staff only.
  - [ ] `switchRole` sets the `agentclinic-role` cookie.
- [ ] **Layout**
  - [ ] The header nav has links to Dashboard, Agents, Ailments, Therapies, and Appointments.
  - [ ] The role toggle shows the current role and the opposite action.
- [ ] **Agents**
  - [ ] `createAgent` adds an agent and reports duplicate names.
  - [ ] `GET /api/agents` returns `{ agents }`, ordered by name.
  - [ ] `addAgent` validates input, keeps the typed values on error, and refuses the agent role.
  - [ ] `/agents` shows the add form to staff only.
- [ ] **Ailments**
  - [ ] The migration creates `ailments` with a foreign key to `agents`.
  - [ ] `listAilments` is newest first, with agent names.
  - [ ] `recordAilment` works in both roles and rejects invalid input and unknown agents.
  - [ ] `GET /api/ailments` returns `{ ailments }`.
- [ ] **Therapies**
  - [ ] The migrations create `therapies` and `ailment_therapies`.
  - [ ] `linkTherapy` reports `linked`, `already-linked`, and `not-found`.
  - [ ] `linkTherapyToAilment` is staff only.
  - [ ] `GET /api/therapies` includes linked ailment ids.
- [ ] **Appointments**
  - [ ] The migration enforces the unique (`agent_id`, `starts_at`) constraint.
  - [ ] Listing is ordered by start time, and `upcoming` filters on a given time.
  - [ ] `appointmentSchema` rejects a time in the past.
  - [ ] `bookAppointment` reports a double booking and an unknown agent or therapy.
  - [ ] `GET /api/appointments` supports `?upcoming=1`.
- [ ] **Dashboard**
  - [ ] `getDashboardSummary` returns correct counts and lists for an empty and a seeded database.
  - [ ] The panels render their data and their empty states.
  - [ ] A missing database still shows the friendly fallback.
- [ ] **Seed:** `db:seed` adds agents, therapies, ailments, links, and upcoming appointments. Running it twice adds no duplicates.
- [ ] **Polish:** the 404 and error pages render, and every page sets its own title.

### Playwright (`npm run test:e2e`)

These run against a production build on port 3007 with a freshly seeded `data/e2e.db`.

- [ ] **Shell:** every nav link loads its page, and the role toggle switches the label and dashboard heading and survives a reload.
- [ ] **Agents:** staff add an agent and it appears on `/agents` and the dashboard. A duplicate name shows an error, and the agent role sees no add form.
- [ ] **Ailments:** both roles record an ailment, and empty required fields show errors.
- [ ] **Therapies:** staff link a therapy, and it shows on `/therapies` and `/ailments`. Linking again says "already linked", and the agent role sees no link form.
- [ ] **Appointments:** both roles book an appointment, and a time in the past and a double booking are rejected.
- [ ] **Dashboard:** the counts match the data and update after new records are added.
- [ ] **Responsive** (Chromium at 360, 768, and 1280px):
  - [ ] No page scrolls sideways.
  - [ ] Nav links and form controls are at least 44×44px.
  - [ ] Dashboard panels stack below 768px and sit side by side from 768px up.
  - [ ] The appointment schedule is cards at 360px and a table at 1280px.
- [ ] **Dark mode:** the responsive checks pass in Chromium with `colorScheme: "dark"`.
- [ ] **Browsers:** the smoke test (every page loads, booking works, 404) passes in Chromium, Firefox, and WebKit.

## Manual

- [ ] On a fresh clone: `npm install`, `npx playwright install`, `npm run db:migrate`, `npm run db:seed`, and `npm run dev`. The app starts on `http://localhost:3005` with seeded data on every page.
- [ ] Do the whole flow as staff: add an agent, record an ailment for it, link a therapy, book an appointment, and see all four on the dashboard.
- [ ] Switch to the agent role: the staff-only forms disappear, and you can still record an ailment and book an appointment.
- [ ] Forms are comfortable to use on a phone-sized screen: inputs don't zoom in, the keyboard doesn't hide the submit button, and errors are easy to see.
- [ ] Every page reads well in light and dark mode. The jade theme is applied and focus outlines are visible.
- [ ] Every page's copy is playful but clear, with no jokes in error messages that hide what went wrong.
- [ ] The 404 page shows for an unknown URL and links back to the dashboard.
- [ ] Each `GET /api/agents`, `/api/ailments`, `/api/therapies`, and `/api/appointments` returns JSON matching the UI. `GET /api/health` still returns `{ "status": "ok" }`.
- [ ] Times are labelled UTC everywhere they appear.

## Hygiene

- [ ] There's one migration per phase that changes the schema, all committed, and `npm run db:generate` reports no changes.
- [ ] Data-access functions take `db` as an argument, and only server code imports `src/db/*`.
- [ ] Mutations only go through Server Actions, and route handlers are read-only.
- [ ] Staff-only actions check the role on the server, not only by hiding the form.
- [ ] `layout.css` contains only `--pico-*` variables and minimal rules on the app's own class names. Pico's selectors aren't overridden and there are no fixed desktop widths.
- [ ] Vitest tests live in `tests/` and mirror `src/`. Playwright specs live in `e2e/`.
- [ ] `specs/tech-stack.md` lists Playwright, zod, and the jade Pico theme.
- [ ] The README covers the role toggle, pages, API, end-to-end setup, and UTC times.
- [ ] `CHANGELOG.md` has the MVP entries, and `specs/roadmap.md` marks Phases 3–9 complete.
- [ ] Nothing out of scope has been added: no editing or deleting, no authentication, and no detail pages.
