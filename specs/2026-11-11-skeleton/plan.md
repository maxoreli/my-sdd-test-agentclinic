# Plan: Skeleton (Roadmap Phase 1)

## 1. Scaffold the app

1. Create the Next.js (App Router) app with TypeScript in `my-agentclinic/`.
2. Enable strict mode in `tsconfig.json`.
3. Use npm; remove default boilerplate content and assets that are not needed.

## 2. Minimal AgentClinic home page

1. Replace the default home page with a Server Component showing the AgentClinic name and a playful tagline.
2. Set the page title and description metadata to AgentClinic.
3. Keep it minimal: no navigation, no data, no links to future features.
4. Keep styling to plain CSS only.

## 3. Main layout component

1. Add a `MainLayout` component in `src/components/layout/` composed of three subcomponents: `Header`, `Main`, and `Footer`.
   - Each component lives in its own file: `MainLayout.tsx`, `Header.tsx`, `Main.tsx`, and `Footer.tsx`, all in `src/components/layout/`.
2. Header shows the AgentClinic name; Footer shows a short plain line of text; Main wraps the page content. No navigation or links to future features.
3. Put layout styles in `src/components/layout/layout.css`, imported by `MainLayout` so Next.js links the stylesheet in the page head.
4. Wrap the app in `MainLayout` from `src/app/layout.tsx`, and keep the home page content inside Main.

## 4. Health route handler

1. Add `GET /api/health` as a Route Handler returning `{ "status": "ok" }` with HTTP 200.

## 5. Tests and scripts

1. Add Vitest and a `test` script.
2. Write an automated test for the health route handler.
3. Add a `typecheck` script.
4. Add run instructions (install, dev, build, test) to the project README.
