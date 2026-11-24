import { describe, expect, it } from "vitest";
import { agents, ailments } from "@/db/schema";
import { SEED_AGENTS, SEED_AILMENTS, seedAgents, seedAilments, seedDatabase } from "@/db/seed";
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

describe("seedAilments", () => {
  it("records the seed ailments for the seed agents", () => {
    const db = createTestDb();
    seedAgents(db);
    expect(seedAilments(db)).toBe(SEED_AILMENTS.length);
    const rows = db.select().from(ailments).all();
    expect(rows.map((r) => r.name)).toEqual(SEED_AILMENTS.map((a) => a.name));
  });

  it("seeds nothing when ailments already exist", () => {
    const db = createTestDb();
    seedAgents(db);
    const [agent] = db.select().from(agents).all();
    db.insert(ailments).values({ agentId: agent.id, name: "Real one", severity: "mild" }).run();
    expect(seedAilments(db)).toBe(0);
    expect(db.select().from(ailments).all()).toHaveLength(1);
  });

  it("skips ailments whose agent is missing", () => {
    const db = createTestDb();
    expect(seedAilments(db)).toBe(0);
  });
});

describe("seedDatabase", () => {
  it("seeds every table and reports what it added", () => {
    const db = createTestDb();
    expect(seedDatabase(db)).toEqual({ agents: SEED_AGENTS.length, ailments: SEED_AILMENTS.length });
  });

  it("adds nothing the second time", () => {
    const db = createTestDb();
    seedDatabase(db);
    expect(seedDatabase(db)).toEqual({ agents: 0, ailments: 0 });
    expect(db.select().from(ailments).all()).toHaveLength(SEED_AILMENTS.length);
  });
});
