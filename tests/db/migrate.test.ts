import { describe, expect, it } from "vitest";
import { createDb } from "@/db/client";
import { runMigrations } from "@/db/migrate";
import { agents, ailments, ailmentTherapies, therapies } from "@/db/schema";

interface ColumnInfo {
  name: string;
  type: string;
  notnull: number;
  pk: number;
}

describe("runMigrations", () => {
  function migratedDb() {
    const db = createDb(":memory:");
    runMigrations(db);
    return db;
  }

  it("creates the agents table with the expected columns", () => {
    const columns = migratedDb().$client.pragma("table_info(agents)") as ColumnInfo[];
    expect(columns.map(({ name, type, notnull, pk }) => ({ name, type, notnull, pk }))).toEqual([
      { name: "id", type: "INTEGER", notnull: 1, pk: 1 },
      { name: "name", type: "TEXT", notnull: 1, pk: 0 },
      { name: "model", type: "TEXT", notnull: 1, pk: 0 },
      { name: "created_at", type: "INTEGER", notnull: 1, pk: 0 },
    ]);
  });

  it("makes agent names unique", () => {
    const db = migratedDb();
    db.insert(agents).values({ name: "Twin", model: "m" }).run();
    expect(() => db.insert(agents).values({ name: "Twin", model: "m" }).run()).toThrow(/UNIQUE/);
  });

  it("fills in id and created_at by default", () => {
    const db = migratedDb();
    const before = Math.floor(Date.now() / 1000);
    const [row] = db.insert(agents).values({ name: "New", model: "m" }).returning().all();
    expect(row.id).toBe(1);
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(Math.floor(row.createdAt.getTime() / 1000)).toBeGreaterThanOrEqual(before);
  });

  it("is safe to run more than once", () => {
    const db = migratedDb();
    db.insert(agents).values({ name: "Stays", model: "m" }).run();
    expect(() => runMigrations(db)).not.toThrow();
    expect(db.select().from(agents).all()).toHaveLength(1);
  });
});

describe("ailments migration", () => {
  function migratedDb() {
    const db = createDb(":memory:");
    runMigrations(db);
    return db;
  }

  it("creates the ailments table with the expected columns", () => {
    const columns = migratedDb().$client.pragma("table_info(ailments)") as ColumnInfo[];
    expect(columns.map(({ name, type, notnull }) => ({ name, type, notnull }))).toEqual([
      { name: "id", type: "INTEGER", notnull: 1 },
      { name: "agent_id", type: "INTEGER", notnull: 1 },
      { name: "name", type: "TEXT", notnull: 1 },
      { name: "severity", type: "TEXT", notnull: 1 },
      { name: "description", type: "TEXT", notnull: 0 },
      { name: "created_at", type: "INTEGER", notnull: 1 },
    ]);
  });

  it("links each ailment to an agent with a foreign key", () => {
    const db = migratedDb();
    const keys = db.$client.pragma("foreign_key_list(ailments)") as { table: string; from: string; to: string }[];
    expect(keys).toEqual([expect.objectContaining({ table: "agents", from: "agent_id", to: "id" })]);
    expect(() =>
      db.insert(ailments).values({ agentId: 999, name: "Orphan", severity: "mild" }).run(),
    ).toThrow(/FOREIGN KEY/);
  });
});

describe("therapies migration", () => {
  function migratedDb() {
    const db = createDb(":memory:");
    runMigrations(db);
    return db;
  }

  it("creates the therapies table with a unique name", () => {
    const db = migratedDb();
    const columns = db.$client.pragma("table_info(therapies)") as ColumnInfo[];
    expect(columns.map((c) => c.name)).toEqual(["id", "name", "description", "duration_minutes"]);
    db.insert(therapies).values({ name: "Nap", description: "z", durationMinutes: 5 }).run();
    expect(() => db.insert(therapies).values({ name: "Nap", description: "z", durationMinutes: 5 }).run()).toThrow(/UNIQUE/);
  });

  it("creates the ailment_therapies join table keyed by both ids, with foreign keys", () => {
    const db = migratedDb();
    const columns = db.$client.pragma("table_info(ailment_therapies)") as ColumnInfo[];
    expect(columns.map(({ name, pk }) => ({ name, pk }))).toEqual([
      { name: "ailment_id", pk: 1 },
      { name: "therapy_id", pk: 2 },
    ]);
    const keys = db.$client.pragma("foreign_key_list(ailment_therapies)") as { table: string; from: string }[];
    expect(keys.map(({ table, from }) => ({ table, from })).sort((a, b) => a.from.localeCompare(b.from))).toEqual([
      { table: "ailments", from: "ailment_id" },
      { table: "therapies", from: "therapy_id" },
    ]);
    expect(() => db.insert(ailmentTherapies).values({ ailmentId: 1, therapyId: 1 }).run()).toThrow(/FOREIGN KEY/);
  });
});
