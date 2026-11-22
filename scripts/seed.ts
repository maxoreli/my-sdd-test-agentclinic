import { createDb, databasePath } from "../src/db/client";
import { seedAgents } from "../src/db/seed";

const path = databasePath();
const db = createDb(path);

try {
  const added = seedAgents(db);
  console.log(
    added > 0
      ? `🛋️  Seeded ${added} agent${added === 1 ? "" : "s"} into ${path}`
      : `🛋️  Waiting room already full in ${path}; nothing new to seed`,
  );
} catch (error) {
  if (error instanceof Error && /no such table/.test(error.message)) {
    console.error(`🚑 ${path} has no agents table yet. Run \`npm run db:migrate\` first.`);
    process.exitCode = 1;
  } else {
    throw error;
  }
} finally {
  db.$client.close();
}
