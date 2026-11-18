# Roadmap

Very small phases, each a thin vertical slice that can be shipped on its own.

Every phase that adds or changes web UI must meet the responsive requirements in `specs/tech-stack.md` and be verified at mobile, tablet, and desktop widths before it ships.

## Phase 1: Skeleton ✅ Complete

- Create the Next.js (TypeScript) app
- A server-rendered home page and a "health" route handler

## Phase 2: Database

- Connect SQLite and add a migration setup
- One seeded table to prove the round trip

## Phase 3: Dashboard shell

- Layout, navigation, and a landing dashboard with placeholder content
- Navigation stays usable on small screens (it wraps or collapses instead of overflowing)
- Dashboard panels stack on mobile and form a grid on wider screens

## Phase 4: Agents

- List agents (API + UI), readable on mobile without horizontal page scrolling
- Add an agent with a form that is usable on touch screens

## Phase 5: Ailments

- List ailments (API + UI), readable on mobile without horizontal page scrolling
- Record an ailment for an agent with a form that is usable on touch screens

## Phase 6: Therapies

- List therapies (API + UI), readable on mobile without horizontal page scrolling
- Link therapies to ailments

## Phase 7: Appointments

- View the appointment schedule, with a layout that adapts to small screens
- Book an appointment for an agent with a therapy, using a form that is usable on touch screens

## Phase 8: Dashboard data

- Replace placeholders with real summaries (agents, open ailments, upcoming appointments), keeping the responsive panel layout

## Phase 9: Polish

- Visual design pass and playful copy
- Review responsive behavior across mobile, tablet, and desktop screens
- Check in modern browsers
