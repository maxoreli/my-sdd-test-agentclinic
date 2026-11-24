// Rebuild the end-to-end test database from scratch: delete, migrate, seed.
// Playwright's webServer runs this before starting the app (see playwright.config.ts).
import { rmSync } from "node:fs";
import { createDb, databasePath } from "../src/db/client";
import { runMigrations } from "../src/db/migrate";
import { seedDatabase } from "../src/db/seed";

const path = databasePath();
if (path === "data/agentclinic.db") {
  throw new Error("Refusing to reset the development database; set DATABASE_URL to the e2e database.");
}

for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${path}${suffix}`, { force: true });
}

const db = createDb(path);
runMigrations(db);
seedDatabase(db);
db.$client.close();

console.log(`🧪 Fresh end-to-end database at ${path}`);
