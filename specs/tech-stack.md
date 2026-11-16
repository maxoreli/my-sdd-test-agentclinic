# Tech Stack

Server-side TypeScript everywhere, using popular and well-supported tools.

| Layer | Choice |
|-------|--------|
| Language | TypeScript (strict) |
| Framework | Next.js (App Router), server-rendered with React Server Components |
| Server logic | Server Components, Server Actions, and Route Handlers running on Node.js |
| Database | SQLite (single local file, no separate database server) |
| Target browsers | Modern evergreen browsers |

## Why Next.js

- **Server-side TypeScript:** pages render on the server and data access happens in server code, so there is one language and one deployable app.
- **Reliable and popular (Mary):** the most widely used TypeScript web framework, with a large ecosystem and long-term support.
- **Dashboard-friendly:** layouts and nested routing suit a dashboard shell with agents, ailments, therapies, and appointments.
- **Attractive (Steve):** pairs well with modern CSS tooling and renders fast in modern browsers.

## Notes

- No separate API package; mutations go through Server Actions, and Route Handlers cover anything that needs an HTTP endpoint.
- Types are shared naturally between server and UI code.
