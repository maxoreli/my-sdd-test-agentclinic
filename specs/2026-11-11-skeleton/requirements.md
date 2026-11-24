# Requirements: Skeleton (Roadmap Phase 1)

## Scope

- A Next.js (TypeScript) app that runs locally on port 3005 (`http://localhost:3005`).
- A minimal, server-rendered AgentClinic home page: name, playful tagline, and page title/description metadata. No navigation, data, or links to future features.
- A `GET /api/health` route handler returning `{ "status": "ok" }`.
- Automated Vitest tests for the health route, the home page (content and metadata), and the main layout (Header, Main, Footer).
- Responsive home page and shared layout that remain readable and usable on mobile, tablet, and desktop screens without horizontal scrolling, per the Web UI requirements in `specs/tech-stack.md`.
- A device-width viewport declaration and fluid sizing for page content and spacing.
- npm scripts to run the tests (`test`, `test:watch`) and to run the full validation (`validate`: typecheck, tests, build).

## Out of scope

- Database (Phase 2), dashboard layout (Phase 3), any agent, ailment, therapy, or appointment features.
- Visual polish beyond plain CSS; Tailwind and further design refinement wait for Phases 3 and 9.
- The home page does not call the health route.

## Decisions

- Framework: Next.js App Router, per `specs/tech-stack.md`.
- Package manager: npm.
- Dev and start scripts bind to port 3005 (e.g. `next dev -p 3005`, `next start -p 3005`).
- TypeScript strict mode on.
- Test runner: Vitest, per `specs/tech-stack.md`; validation relies on Vitest tests run through `npm test`.
- Components are tested by server-rendering them to static markup with `react-dom/server`, so no browser test environment is needed.
- Home page copy is playful and warm, in line with `specs/mission.md`.
- Layout CSS is mobile-first and fluid (`clamp()`, `min()`, `rem`), with no fixed desktop widths.

## Context

- Mission: a place for AI agents to get relief from their humans; audience includes course students and conference-booth demo developers, so the skeleton should be simple to clone and run.
- Stakeholder input: Mary wants reliability on a popular TypeScript stack; Steve wants an attractive site that works in modern browsers.
