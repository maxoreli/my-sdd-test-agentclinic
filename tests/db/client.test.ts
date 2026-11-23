import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sql } from "drizzle-orm";
import { createDb, databasePath, DEFAULT_DATABASE_PATH } from "@/db/client";

describe("createDb", () => {
  it("returns a working Drizzle client for an in-memory database", () => {
    const db = createDb(":memory:");
    expect(db.get<{ answer: number }>(sql`select 42 as answer`)).toEqual({ answer: 42 });
  });

  it("turns on foreign keys", () => {
    const db = createDb(":memory:");
    expect(db.$client.pragma("foreign_keys", { simple: true })).toBe(1);
  });

  describe("with a file path", () => {
    let dir: string;
    beforeEach(() => {
      dir = mkdtempSync(join(tmpdir(), "agentclinic-"));
    });
    afterEach(() => {
      rmSync(dir, { recursive: true, force: true });
    });

    it("creates missing parent folders and the file", () => {
      const path = join(dir, "nested", "clinic.db");
      createDb(path).$client.close();
      expect(existsSync(path)).toBe(true);
    });

    it("throws instead of creating the file when fileMustExist is set", () => {
      const path = join(dir, "missing.db");
      expect(() => createDb(path, { fileMustExist: true })).toThrow();
      expect(existsSync(path)).toBe(false);
    });
  });
});

describe("databasePath", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to data/agentclinic.db", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(databasePath()).toBe(DEFAULT_DATABASE_PATH);
    expect(DEFAULT_DATABASE_PATH).toBe("data/agentclinic.db");
  });

  it("uses DATABASE_URL when set", () => {
    vi.stubEnv("DATABASE_URL", "/somewhere/else.db");
    expect(databasePath()).toBe("/somewhere/else.db");
  });
});

describe("getDb", () => {
  let dir: string;
  let path: string;

  // getDb caches its client in module state, so load a fresh copy per test.
  async function loadGetDb() {
    vi.resetModules();
    return (await import("@/db/client")).getDb;
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "agentclinic-"));
    path = join(dir, "clinic.db");
    vi.stubEnv("DATABASE_URL", path);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(dir, { recursive: true, force: true });
  });

  it("throws, without creating a file, when the database file is missing", async () => {
    const getDb = await loadGetDb();
    expect(() => getDb()).toThrow();
    expect(existsSync(path)).toBe(false);
  });

  it("opens the file at DATABASE_URL and reuses the same client", async () => {
    createDb(path).$client.close();
    const getDb = await loadGetDb();
    const first = getDb();
    expect(first.$client.name).toBe(path);
    expect(getDb()).toBe(first);
  });

  it("stops using a deleted file and reopens it once it is back", async () => {
    createDb(path).$client.close();
    const getDb = await loadGetDb();
    const first = getDb();

    rmSync(path);
    rmSync(`${path}-wal`, { force: true });
    rmSync(`${path}-shm`, { force: true });
    expect(() => getDb()).toThrow();
    expect(first.$client.open).toBe(false);

    createDb(path).$client.close();
    const reopened = getDb();
    expect(reopened).not.toBe(first);
    expect(reopened.$client.open).toBe(true);
  });
});
