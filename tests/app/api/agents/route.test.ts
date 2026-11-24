import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/agents/route";
import { getDb } from "@/db/client";
import { SEED_AGENTS } from "@/db/seed";
import { createTestDb } from "../../../helpers/db";

vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));

describe("GET /api/agents", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockReturnValue(createTestDb({ seed: true }));
  });

  it("returns 200 JSON with the agents ordered by name", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body.agents.map((a: { name: string }) => a.name)).toEqual(
      SEED_AGENTS.map((a) => a.name).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
    );
  });

  it("serialises each agent with an ISO timestamp", async () => {
    const [agent] = (await GET().json()).agents;
    expect(agent).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      model: expect.any(String),
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/),
    });
  });

  it("returns an empty list when there are no agents", async () => {
    vi.mocked(getDb).mockReturnValue(createTestDb());
    expect(await GET().json()).toEqual({ agents: [] });
  });
});
