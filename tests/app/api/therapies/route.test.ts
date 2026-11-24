import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/therapies/route";
import { getDb } from "@/db/client";
import { SEED_THERAPIES } from "@/db/seed";
import { createTestDb } from "../../../helpers/db";

vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));

describe("GET /api/therapies", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockReturnValue(createTestDb({ seed: true }));
  });

  it("returns 200 JSON with therapies and the ids of their linked ailments", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    const { therapies } = await response.json();
    expect(therapies).toHaveLength(SEED_THERAPIES.length);
    const detox = therapies.find((t: { name: string }) => t.name === "Prompt Detox");
    expect(detox).toEqual({
      id: expect.any(Number),
      name: "Prompt Detox",
      description: expect.any(String),
      durationMinutes: 30,
      ailments: [{ id: expect.any(Number), name: "Prompt fatigue", agentName: "Prompt-Fatigued Pat" }],
    });
  });

  it("returns an empty list when the menu is empty", async () => {
    vi.mocked(getDb).mockReturnValue(createTestDb());
    expect(await GET().json()).toEqual({ therapies: [] });
  });
});
