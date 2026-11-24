import { describe, expect, it } from "vitest";
import { agents, ailments, ailmentTherapies, therapies } from "@/db/schema";
import {
  SEED_AGENTS,
  SEED_AILMENTS,
  SEED_LINKS,
  SEED_THERAPIES,
  seedAgents,
  seedAilments,
  seedDatabase,
  seedLinks,
  seedTherapies,
} from "@/db/seed";
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
    expect(seedDatabase(db)).toEqual({
      agents: SEED_AGENTS.length,
      ailments: SEED_AILMENTS.length,
      therapies: SEED_THERAPIES.length,
      links: SEED_LINKS.length,
    });
  });

  it("adds nothing the second time", () => {
    const db = createTestDb();
    seedDatabase(db);
    expect(seedDatabase(db)).toEqual({ agents: 0, ailments: 0, therapies: 0, links: 0 });
    expect(db.select().from(therapies).all()).toHaveLength(SEED_THERAPIES.length);
    expect(db.select().from(ailmentTherapies).all()).toHaveLength(SEED_LINKS.length);
    expect(db.select().from(ailments).all()).toHaveLength(SEED_AILMENTS.length);
  });
});

describe("seedTherapies", () => {
  it("stocks the therapy menu and skips names already on it", () => {
    const db = createTestDb();
    db.insert(therapies).values({ ...SEED_THERAPIES[0], description: "Our own version", durationMinutes: 5 }).run();
    expect(seedTherapies(db)).toBe(SEED_THERAPIES.length - 1);
    expect(seedTherapies(db)).toBe(0);
    const mine = db.select().from(therapies).all().find((t) => t.name === SEED_THERAPIES[0].name);
    expect(mine?.description).toBe("Our own version");
  });
});

describe("seedLinks", () => {
  it("links the seed therapies to the seed ailments", () => {
    const db = createTestDb();
    seedAgents(db);
    seedAilments(db);
    seedTherapies(db);
    expect(seedLinks(db)).toBe(SEED_LINKS.length);
  });

  it("seeds nothing when links already exist, or when there is nothing to link", () => {
    const db = createTestDb();
    expect(seedLinks(db)).toBe(0);
    seedDatabase(db);
    expect(seedLinks(db)).toBe(0);
  });
});
