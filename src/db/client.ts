import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/** Drizzle client for the AgentClinic schema; `$client` is the underlying SQLite connection. */
export type Db = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

export const DEFAULT_DATABASE_PATH = "data/agentclinic.db";

/** Path of the app's database file: `DATABASE_URL`, or `data/agentclinic.db`. */
export function databasePath(): string {
  return process.env.DATABASE_URL || DEFAULT_DATABASE_PATH;
}

/**
 * Open a SQLite database at `path` (a file path or `":memory:"`) and wrap it
 * in a Drizzle client. Used directly by tests and scripts.
 */
export function createDb(path: string): Db {
  const inMemory = path === ":memory:";
  if (!inMemory) {
    mkdirSync(dirname(path), { recursive: true });
  }

  const sqlite = new Database(path);
  sqlite.pragma("foreign_keys = ON");
  if (!inMemory) {
    sqlite.pragma("journal_mode = WAL");
  }

  return drizzle({ client: sqlite, schema });
}

let shared: Db | undefined;

/** The app's shared database client, opened on first use. Server code only. */
export function getDb(): Db {
  shared ??= createDb(databasePath());
  return shared;
}
