# AgentClinic

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.

## Run it

Requires Node.js 20+ and npm.

```bash
npm install        # install dependencies
npm run dev        # start the dev server at http://localhost:3005
npm run build      # production build
npm test           # run tests once (Vitest)
npm run test:watch # run tests in watch mode
npm run typecheck  # TypeScript check
npm run validate   # typecheck + tests + build: run before merging a phase
```

Health check: `GET http://localhost:3005/api/health` returns `{ "status": "ok" }`.
