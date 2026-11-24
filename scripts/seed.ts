import { createDb, databasePath } from "../src/db/client";
import { seedDatabase, type SeedSummary } from "../src/db/seed";

const path = databasePath();
const db = createDb(path);

function describe(summary: SeedSummary): string {
  const parts = Object.entries(summary)
    .filter(([, added]) => added > 0)
    .map(([table, added]) => `${added} ${table}`);
  return parts.length > 0 ? `Seeded ${parts.join(", ")}` : "Clinic already stocked; nothing new to seed";
}

try {
  console.log(`🛋️  ${describe(seedDatabase(db))} in ${path}`);
} catch (error) {
  if (error instanceof Error && /no such table/.test(error.message)) {
    console.error(`🚑 ${path} is missing tables. Run \`npm run db:migrate\` first.`);
    process.exitCode = 1;
  } else {
    throw error;
  }
} finally {
  db.$client.close();
}
