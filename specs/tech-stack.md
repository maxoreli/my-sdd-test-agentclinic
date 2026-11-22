# Tech Stack

Server-side TypeScript everywhere, using popular and well-supported tools.

| Layer | Choice |
| --- | --- |
| Language | TypeScript (strict) |
| Framework | Next.js (App Router), server-rendered with React Server Components |
| Server logic | Server Components, Server Actions, and Route Handlers running on Node.js |
| Styling | PicoCSS v2 (`@picocss/pico`), semantic HTML with small `--pico-*` variable overrides |
| Database | SQLite (single local file, no separate database server) |
| Target browsers | Modern evergreen browsers |
| Testing | Vitest |

## Web UI requirements

- Style with PicoCSS: import `@picocss/pico/css/pico.min.css` once in the root layout, prefer semantic elements and Pico's `container` class over custom class names, and customise only through `--pico-*` CSS variables, never by overriding Pico's selectors. Keep Pico's automatic light and dark colour schemes. Do not add a second CSS framework.
- Build responsive layouts that work on narrow mobile screens, tablets, and desktop screens.
- Write mobile-first CSS: base styles target small screens, and `min-width` media queries add layout for wider screens.
- Reference widths for verification: 360px (mobile), 768px (tablet), and 1280px (desktop).
- Include the device-width viewport declaration and use fluid widths, spacing, and typography (`clamp()`, `min()`, `%`, `rem`) instead of fixed desktop dimensions.
- No horizontal page scrolling at any reference width. Long text wraps, and images and media scale down to fit their container.
- Wide content such as tables reflows on small screens or scrolls inside its own container, never the whole page.
- Keep content readable and controls usable at small widths: body text at least 16px, and tap targets at least 44×44px.
- Verify each UI feature at all three reference widths before its phase is merged.

## Testing and validation

- Every phase is validated with automated Vitest tests, alongside the checks in that phase's `validation.md`.
- Tests run through npm scripts in `package.json`: `npm test` (`vitest run`) and `npm run test:watch` (`vitest`).
- `npm run validate` runs typecheck, tests, and build; it must pass before a phase is merged.
- Test files live in a top-level `tests/` folder that mirrors the `src/` structure (e.g. `src/components/layout/Header.tsx` → `tests/components/layout/Header.test.tsx`), and import code through the `@/` alias. Components are tested by rendering them to static markup with `react-dom/server`.
- New features ship with Vitest tests covering their route handlers, server logic, and data access.

## Why Next.js

- **Server-side TypeScript:** pages render on the server and data access happens in server code, so there is one language and one deployable app.
- **Reliable and popular (Mary):** the most widely used TypeScript web framework, with a large ecosystem and long-term support.
- **Dashboard-friendly:** layouts and nested routing suit a dashboard shell with agents, ailments, therapies, and appointments.
- **Attractive (Steve):** pairs well with modern CSS tooling and renders fast in modern browsers.

## Why PicoCSS

- **Attractive by default:** well-designed typography, forms, and spacing from plain semantic HTML, with light and dark themes built in.
- **Responsive and mobile-first:** fluid containers and type scale help meet the Web UI requirements with little custom CSS.
- **Lightweight and simple:** a single stylesheet with no build plugin or class soup, so it's easy to follow in a course or a live demo.

## Notes

- No separate API package; mutations go through Server Actions, and Route Handlers cover anything that needs an HTTP endpoint.
- Types are shared naturally between server and UI code.
