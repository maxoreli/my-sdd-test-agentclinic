# Requirements: Skeleton (Roadmap Phase 1)

## Scope

- A Next.js (TypeScript) app that runs locally on port 3005 (`http://localhost:3005`).
- A minimal, server-rendered AgentClinic home page: name, playful tagline, and page title/description metadata. No navigation, data, or links to future features.
- A `GET /api/health` route handler returning `{ "status": "ok" }`.
- An automated test for the health route.

## Out of scope

- Database (Phase 2), dashboard layout (Phase 3), any agent, ailment, therapy, or appointment features.
- Styling beyond plain CSS; Tailwind and visual polish wait for Phases 3 and 9.
- The home page does not call the health route.

## Decisions

- Framework: Next.js App Router, per `specs/tech-stack.md`.
- Package manager: npm.
- Dev and start scripts bind to port 3005 (e.g. `next dev -p 3005`, `next start -p 3005`).
- TypeScript strict mode on.
- Test runner: Vitest (chosen to support the automated test requested for validation).
- Home page copy is playful and warm, in line with `specs/mission.md`.

## Context

- Mission: a place for AI agents to get relief from their humans; audience includes course students and conference-booth demo developers, so the skeleton should be simple to clone and run.
- Stakeholder input: Mary wants reliability on a popular TypeScript stack; Steve wants an attractive site that works in modern browsers.
