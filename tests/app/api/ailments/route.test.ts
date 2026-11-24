import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/ailments/route";
import { getDb } from "@/db/client";
import { SEED_AILMENTS } from "@/db/seed";
import { createTestDb } from "../../../helpers/db";

vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));

describe("GET /api/ailments", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockReturnValue(createTestDb({ seed: true }));
  });

  it("returns 200 JSON with every ailment and its agent's name", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    const { ailments } = await response.json();
    expect(ailments).toHaveLength(SEED_AILMENTS.length);
    expect(ailments[0]).toEqual({
      id: expect.any(Number),
      agentId: expect.any(Number),
      agentName: expect.any(String),
      name: expect.any(String),
      severity: expect.stringMatching(/^(mild|moderate|severe)$/),
      description: expect.any(String),
      therapies: expect.any(Array),
      createdAt: expect.stringMatching(/Z$/),
    });
  });

  it("returns an empty list when there are no ailments", async () => {
    vi.mocked(getDb).mockReturnValue(createTestDb());
    expect(await GET().json()).toEqual({ ailments: [] });
  });
});
