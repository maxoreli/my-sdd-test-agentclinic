# Plan: Skeleton (Roadmap Phase 1)

## 1. Scaffold the app

1. Create the Next.js (App Router) app with TypeScript in `my-agentclinic/`.
2. Enable strict mode in `tsconfig.json`.
3. Use npm; remove default boilerplate content and assets that are not needed.

## 2. Minimal AgentClinic home page

1. Replace the default home page with a Server Component showing the AgentClinic name and a playful tagline.
2. Set the page title and description metadata to AgentClinic.
3. Keep it minimal: no navigation, no data, no links to future features.
4. Keep styling to plain CSS only, written mobile-first, using a fluid content width, mobile-friendly spacing, and readable typography.
5. Export a device-width `viewport` from `src/app/layout.tsx`.

## 3. Main layout component

1. Add a `MainLayout` component in `src/components/layout/` composed of three subcomponents: `Header`, `Main`, and `Footer`.
   - Each component lives in its own file: `MainLayout.tsx`, `Header.tsx`, `Main.tsx`, and `Footer.tsx`, all in `src/components/layout/`.
2. Header shows the AgentClinic name; Footer shows a short plain line of text; Main wraps the page content. No navigation or links to future features.
3. Put layout styles in `src/components/layout/layout.css`, imported by `MainLayout` so Next.js links the stylesheet in the page head.
4. Confirm the shared layout does not overflow horizontally at narrow viewport widths.
5. Wrap the app in `MainLayout` from `src/app/layout.tsx`, and keep the home page content inside Main.

## 4. Health route handler

1. Add `GET /api/health` as a Route Handler returning `{ "status": "ok" }` with HTTP 200.

## 5. Tests and scripts

1. Add Vitest with a `vitest.config.mts` that resolves the `@/` path alias and picks up `tests/**/*.test.{ts,tsx}`.
2. Add `test` (`vitest run`) and `test:watch` (`vitest`) scripts.
3. Write Vitest tests in a top-level `tests/` folder that mirrors `src/`, importing code via `@/`:
   - `tests/app/api/health/route.test.ts`: the health route returns 200 with `{ "status": "ok" }` as JSON, and only exposes `GET`.
   - `tests/app/page.test.tsx`: the home page shows the name and tagline, has no navigation or links, its metadata sets the title and description, and the viewport is set to device width.
   - `tests/components/layout/MainLayout.test.tsx`: Header, Main, and Footer render in order with the expected content and no navigation.
   - `Header.test.tsx`, `Main.test.tsx`, `Footer.test.tsx` in `tests/components/layout/`: each component on its own (markup, content, no navigation; Main wraps any children).
4. Add a `typecheck` script.
5. Add a `validate` script that runs typecheck, tests, and build.
6. Add run instructions (install, dev, build, test, validate) to the project README.

## 6. Responsive verification

1. Inspect the home page at the reference widths from `specs/tech-stack.md`: 360px (mobile), 768px (tablet), and 1280px (desktop).
2. Confirm the content remains readable, the layout fits the viewport, and there is no horizontal scrolling.
