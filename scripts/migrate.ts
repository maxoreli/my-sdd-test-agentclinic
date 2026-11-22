import { createDb, databasePath } from "../src/db/client";
import { runMigrations } from "../src/db/migrate";

const path = databasePath();
const db = createDb(path);

runMigrations(db);
db.$client.close();

console.log(`🩺 Migrations applied to ${path}`);
