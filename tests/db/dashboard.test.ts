import { describe, expect, it } from "vitest";
import { EMPTY_SUMMARY, getDashboardSummary, PANEL_LIMIT } from "@/db/dashboard";
import { agents, ailments, appointments, therapies } from "@/db/schema";
import { SEED_AGENTS, SEED_AILMENTS, SEED_APPOINTMENTS, seedDatabase } from "@/db/seed";
import { createTestDb } from "../helpers/db";

const NOW = new Date("2026-11-24T12:00:00Z");

describe("getDashboardSummary", () => {
  it("is empty on an empty, migrated database", () => {
    expect(getDashboardSummary(createTestDb(), NOW)).toEqual(EMPTY_SUMMARY);
  });

  it("summarises the seeded clinic", () => {
    const db = createTestDb();
    seedDatabase(db, NOW);
    const summary = getDashboardSummary(db, NOW);

    expect(summary.agents.count).toBe(SEED_AGENTS.length);
    expect(summary.agents.names).toEqual(SEED_AGENTS.map((a) => a.name));
    expect(summary.ailments.count).toBe(SEED_AILMENTS.length);
    expect(summary.ailments.latest).toHaveLength(PANEL_LIMIT);
    expect(summary.appointments.count).toBe(SEED_APPOINTMENTS.length);
    expect(summary.appointments.next).toHaveLength(PANEL_LIMIT);
    expect(summary.appointments.next[0]).toMatchObject({ agentName: "Captain Context", therapyName: "Context Window Decluttering" });
  });

  it("counts only appointments from now on, and lists the soonest first", () => {
    const db = createTestDb();
    const agent = db.insert(agents).values({ name: "Ada", model: "m" }).returning().get();
    const therapy = db.insert(therapies).values({ name: "Nap", description: "z", durationMinutes: 5 }).returning().get();
    db.insert(appointments)
      .values(
        ["2026-11-23T10:00:00Z", "2026-11-28T10:00:00Z", "2026-11-25T10:00:00Z"].map((iso) => ({
          agentId: agent.id,
          therapyId: therapy.id,
          startsAt: new Date(iso),
        })),
      )
      .run();
    const { appointments: upcoming } = getDashboardSummary(db, NOW);
    expect(upcoming.count).toBe(2);
    expect(upcoming.next.map((a) => a.startsAt.toISOString())).toEqual(["2026-11-25T10:00:00.000Z", "2026-11-28T10:00:00.000Z"]);
  });

  it("lists the three most recent ailments", () => {
    const db = createTestDb();
    const agent = db.insert(agents).values({ name: "Ada", model: "m" }).returning().get();
    for (let i = 1; i <= 5; i++) {
      db.insert(ailments)
        .values({ agentId: agent.id, name: `Ailment ${i}`, severity: "mild", createdAt: new Date(Date.UTC(2026, 0, i)) })
        .run();
    }
    const { ailments: open } = getDashboardSummary(db, NOW);
    expect(open.count).toBe(5);
    expect(open.latest.map((a) => a.name)).toEqual(["Ailment 5", "Ailment 4", "Ailment 3"]);
  });
});
