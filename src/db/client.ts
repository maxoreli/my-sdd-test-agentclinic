import { existsSync, mkdirSync } from "node:fs";
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

export interface CreateDbOptions {
  /** Throw if the file does not exist, instead of creating an empty database. */
  fileMustExist?: boolean;
}

/**
 * Open a SQLite database at `path` (a file path or `":memory:"`) and wrap it
 * in a Drizzle client. Used directly by tests and scripts.
 */
export function createDb(path: string, { fileMustExist = false }: CreateDbOptions = {}): Db {
  const inMemory = path === ":memory:";
  if (!inMemory && !fileMustExist) {
    mkdirSync(dirname(path), { recursive: true });
  }

  const sqlite = new Database(path, { fileMustExist });
  sqlite.pragma("foreign_keys = ON");
  if (!inMemory) {
    sqlite.pragma("journal_mode = WAL");
  }

  return drizzle({ client: sqlite, schema });
}

let shared: Db | undefined;

/**
 * The app's shared database client, opened on first use. Server code only.
 *
 * Throws if the database file does not exist (run `npm run db:migrate`), and
 * reopens if the file has been deleted since it was opened, so the app never
 * silently creates an empty database or keeps reading a deleted one.
 */
export function getDb(): Db {
  const path = databasePath();
  if (shared && path !== ":memory:" && !existsSync(path)) {
    shared.$client.close();
    shared = undefined;
  }
  shared ??= createDb(path, { fileMustExist: true });
  return shared;
}
