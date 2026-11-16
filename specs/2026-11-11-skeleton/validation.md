# Validation: Skeleton (Roadmap Phase 1)

The work can be merged when all of these pass.

## Automated

- [ ] `npm run typecheck` passes with no errors.
- [ ] `npm run build` completes successfully.
- [ ] `npm test` passes, including the health route test asserting status 200 and body `{ "status": "ok" }`.

## Manual

- [ ] `npm run dev` starts without errors.
- [ ] The home page loads in a modern browser and shows the AgentClinic name and tagline.
- [ ] The browser tab title is AgentClinic.
- [ ] Viewing the page source shows the content server-rendered in the HTML.
- [ ] The home page is minimal: no navigation, data, or links to future features.
- [ ] `GET /api/health` returns 200 with `{ "status": "ok" }`.

## Hygiene

- [ ] TypeScript strict mode is enabled.
- [ ] README explains how to install, run, build, and test.
- [ ] No unused default Next.js boilerplate remains.
- [ ] `Header`, `Main`, and `Footer` are each in their own file in `src/components/layout/`, separate from `MainLayout`.
