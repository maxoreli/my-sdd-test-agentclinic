import { describe, expect, it } from "vitest";
import { countAilments, createAilment, listAilments } from "@/db/ailments";
import { agents, ailments } from "@/db/schema";
import { SEED_AILMENTS } from "@/db/seed";
import { createTestDb } from "../helpers/db";

describe("listAilments", () => {
  it("returns an empty list on an empty, migrated database", () => {
    expect(listAilments(createTestDb())).toEqual([]);
  });

  it("includes each ailment's agent name", () => {
    const rows = listAilments(createTestDb({ seed: true }));
    expect(rows).toHaveLength(SEED_AILMENTS.length);
    for (const seed of SEED_AILMENTS) {
      expect(rows).toContainEqual(expect.objectContaining({ name: seed.name, agentName: seed.agent, severity: seed.severity }));
    }
  });

  it("lists the newest first", () => {
    const db = createTestDb();
    const agent = db.insert(agents).values({ name: "Ada", model: "m" }).returning().get();
    db.insert(ailments)
      .values([
        { agentId: agent.id, name: "Old", severity: "mild", createdAt: new Date("2026-01-01T00:00:00Z") },
        { agentId: agent.id, name: "Newer", severity: "mild", createdAt: new Date("2026-06-01T00:00:00Z") },
        { agentId: agent.id, name: "Same time, added later", severity: "mild", createdAt: new Date("2026-06-01T00:00:00Z") },
      ])
      .run();
    expect(listAilments(db).map((a) => a.name)).toEqual(["Same time, added later", "Newer", "Old"]);
  });
});

describe("countAilments", () => {
  it("counts every recorded ailment", () => {
    expect(countAilments(createTestDb())).toBe(0);
    expect(countAilments(createTestDb({ seed: true }))).toBe(SEED_AILMENTS.length);
  });
});

describe("createAilment", () => {
  it("records an ailment for an agent", () => {
    const db = createTestDb({ seed: true });
    const [agent] = db.select().from(agents).all();
    const result = createAilment(db, { agentId: agent.id, name: "Hiccups", severity: "mild", description: null });
    expect(result).toMatchObject({ status: "created", ailment: { agentId: agent.id, name: "Hiccups", description: null } });
    expect(countAilments(db)).toBe(SEED_AILMENTS.length + 1);
  });

  it("reports an unknown agent instead of throwing", () => {
    const db = createTestDb();
    expect(createAilment(db, { agentId: 42, name: "Ghost pain", severity: "mild", description: null })).toEqual({
      status: "agent-not-found",
    });
    expect(countAilments(db)).toBe(0);
  });
});
