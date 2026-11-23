import { describe, expect, it } from "vitest";
import { agents } from "@/db/schema";
import { SEED_AGENTS, seedAgents } from "@/db/seed";
import { createTestDb } from "../helpers/db";

describe("seedAgents", () => {
  it("inserts the seed agents and reports how many were added", () => {
    const db = createTestDb();
    expect(seedAgents(db)).toBe(SEED_AGENTS.length);

    const rows = db.select({ name: agents.name, model: agents.model }).from(agents).all();
    expect(rows).toEqual(SEED_AGENTS.map(({ name, model }) => ({ name, model })));
  });

  it("seeds a few agents with distinct names", () => {
    expect(SEED_AGENTS.length).toBeGreaterThanOrEqual(3);
    expect(new Set(SEED_AGENTS.map((a) => a.name)).size).toBe(SEED_AGENTS.length);
  });

  it("does not duplicate agents when run twice", () => {
    const db = createTestDb();
    seedAgents(db);
    expect(seedAgents(db)).toBe(0);
    expect(db.select().from(agents).all()).toHaveLength(SEED_AGENTS.length);
  });

  it("leaves existing agents alone and only adds missing ones", () => {
    const db = createTestDb();
    const [first] = SEED_AGENTS;
    db.insert(agents).values({ name: first.name, model: "Already Here" }).run();

    expect(seedAgents(db)).toBe(SEED_AGENTS.length - 1);
    const existing = db.select().from(agents).all().find((a) => a.name === first.name);
    expect(existing?.model).toBe("Already Here");
  });
});
