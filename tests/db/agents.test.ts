import { describe, expect, it } from "vitest";
import { countAgents, listAgents } from "@/db/agents";
import { agents } from "@/db/schema";
import { SEED_AGENTS } from "@/db/seed";
import { createTestDb } from "../helpers/db";

describe("countAgents", () => {
  it("returns 0 on an empty, migrated database", () => {
    expect(countAgents(createTestDb())).toBe(0);
  });

  it("counts the seeded agents", () => {
    expect(countAgents(createTestDb({ seed: true }))).toBe(SEED_AGENTS.length);
  });
});

describe("listAgents", () => {
  it("returns an empty list on an empty, migrated database", () => {
    expect(listAgents(createTestDb())).toEqual([]);
  });

  it("returns the seeded agents ordered by name", () => {
    const names = listAgents(createTestDb({ seed: true })).map((a) => a.name);
    const expected = SEED_AGENTS.map((a) => a.name).sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" }),
    );
    expect(names).toEqual(expected);
  });

  it("orders names case-insensitively", () => {
    const db = createTestDb();
    db.insert(agents)
      .values([
        { name: "zippy Zed", model: "m" },
        { name: "Bashful Bo", model: "m" },
        { name: "amiable Ada", model: "m" },
      ])
      .run();
    expect(listAgents(db).map((a) => a.name)).toEqual(["amiable Ada", "Bashful Bo", "zippy Zed"]);
  });

  it("returns full agent rows", () => {
    const [agent] = listAgents(createTestDb({ seed: true }));
    expect(agent).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      model: expect.any(String),
      createdAt: expect.any(Date),
    });
  });
});
