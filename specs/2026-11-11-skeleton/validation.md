# Validation: Skeleton (Roadmap Phase 1)

The work can be merged when all of these pass.

## Automated

`npm run validate` runs all of these:

- [ ] `npm run typecheck` passes with no errors.
- [ ] `npm test` passes all Vitest tests:
  - [ ] Health route returns status 200 and body `{ "status": "ok" }` as JSON, and exposes only `GET`.
  - [ ] Home page shows the AgentClinic name and tagline.
  - [ ] Home page has no navigation or links to future features.
  - [ ] Page metadata sets the title to AgentClinic and a description.
  - [ ] The root layout exports a device-width viewport (`width: device-width`, `initialScale: 1`).
  - [ ] MainLayout renders Header, Main (wrapping page content), and Footer in order, with no navigation.
  - [ ] Header, Main, and Footer each pass their own tests: Header shows the name, Footer shows its line of text, Main wraps any children, and none has navigation.
- [ ] `npm run build` completes successfully.

## Manual

- [ ] `npm run dev` starts without errors on `http://localhost:3005`.
- [ ] The home page loads in a modern browser and shows the AgentClinic name and tagline.
- [ ] At 360px (mobile), 768px (tablet), and 1280px (desktop) widths, the page is readable and usable without horizontal scrolling.
- [ ] Viewing the page source shows the content server-rendered in the HTML.
- [ ] `GET http://localhost:3005/api/health` returns 200 with `{ "status": "ok" }`.
- [ ] Page source includes a device-width viewport declaration.

## Hygiene

- [ ] TypeScript strict mode is enabled.
- [ ] README explains how to install, run, build, test, and validate.
- [ ] No unused default Next.js boilerplate remains.
- [ ] `Header`, `Main`, and `Footer` are each in their own file in `src/components/layout/`, separate from `MainLayout`.
- [ ] All test files live in `tests/`, mirroring the `src/` structure; none remain in `src/`.
- [ ] Layout CSS is mobile-first and uses fluid sizing, with no fixed desktop widths.
