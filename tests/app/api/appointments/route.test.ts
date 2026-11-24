import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/appointments/route";
import { getDb } from "@/db/client";
import { agents, appointments, therapies } from "@/db/schema";
import { createTestDb } from "../../../helpers/db";

vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));

const NOW = new Date("2026-11-24T12:00:00Z");
const get = (query = "") => GET(new Request(`http://localhost/api/appointments${query}`));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  const db = createTestDb();
  const agent = db.insert(agents).values({ name: "Ada", model: "m" }).returning().get();
  const therapy = db.insert(therapies).values({ name: "Nap", description: "z", durationMinutes: 20 }).returning().get();
  db.insert(appointments)
    .values([
      { agentId: agent.id, therapyId: therapy.id, startsAt: new Date("2026-11-25T09:00:00Z") },
      { agentId: agent.id, therapyId: therapy.id, startsAt: new Date("2026-11-20T09:00:00Z"), notes: "Past" },
    ])
    .run();
  vi.mocked(getDb).mockReturnValue(db);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("GET /api/appointments", () => {
  it("returns every appointment in start-time order, with names", async () => {
    const response = get();
    expect(response.status).toBe(200);
    const { appointments: list } = await response.json();
    expect(list.map((a: { startsAt: string }) => a.startsAt)).toEqual(["2026-11-20T09:00:00.000Z", "2026-11-25T09:00:00.000Z"]);
    expect(list[0]).toMatchObject({ agentName: "Ada", therapyName: "Nap", durationMinutes: 20, notes: "Past" });
  });

  it.each([["?upcoming=1"], ["?upcoming=true"]])("keeps only upcoming appointments with %s", async (query) => {
    const { appointments: list } = await get(query).json();
    expect(list.map((a: { startsAt: string }) => a.startsAt)).toEqual(["2026-11-25T09:00:00.000Z"]);
  });

  it("ignores other values of upcoming", async () => {
    expect((await get("?upcoming=0").json()).appointments).toHaveLength(2);
  });
});
