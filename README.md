# AgentClinic

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.

## Run it

Requires Node.js 20+ and npm.

```bash
npm install        # install dependencies
npm run db:migrate # create data/agentclinic.db and apply migrations
npm run db:seed    # add a few agents to the waiting room (safe to re-run)
npm run dev        # start the dev server at http://localhost:3005
npm run build      # production build
npm test           # run tests once (Vitest)
npm run test:watch # run tests in watch mode
npm run typecheck  # TypeScript check
npm run validate   # typecheck + tests + build: run before merging a phase
```

Health check: `GET http://localhost:3005/api/health` returns `{ "status": "ok" }`.

## Database

AgentClinic stores its data in a local SQLite file, using [Drizzle ORM](https://orm.drizzle.team) with `better-sqlite3`. There is no database server to install.

- **Location:** `data/agentclinic.db` by default. Set `DATABASE_URL` to use another file, for example `DATABASE_URL=/tmp/clinic.db npm run db:migrate`. The migrate and seed scripts and the app all read it.
- **Schema:** defined in `src/db/schema.ts`. Migrations are generated into `drizzle/` and committed.
- **Changing the schema:** edit `src/db/schema.ts`, run `npm run db:generate` to create a new migration, then `npm run db:migrate`.
- **Seeding:** `npm run db:seed` adds the sample agents and skips any that already exist.
- **Reset:** delete `data/agentclinic.db` (and any `-wal`/`-shm` files next to it), then run `npm run db:migrate` and `npm run db:seed` again.

If the database is missing or empty, the home page shows an empty waiting room with these commands instead of an error. Tests never touch this file: each one uses a fresh in-memory database.

## Styling

The UI uses [PicoCSS](https://picocss.com) v2: semantic HTML with Pico's `container` class, and automatic light and dark themes. App-specific tweaks go in `src/components/layout/layout.css`, only as `--pico-*` variable overrides. See `specs/tech-stack.md`.
