import { createDb, type Db } from "@/db/client";
import { runMigrations } from "@/db/migrate";
import { seedDatabase } from "@/db/seed";

/** A fresh in-memory database with the real migrations applied, optionally seeded with everything. */
export function createTestDb({ seed = false }: { seed?: boolean } = {}): Db {
  const db = createDb(":memory:");
  runMigrations(db);
  if (seed) {
    seedDatabase(db);
  }
  return db;
}
