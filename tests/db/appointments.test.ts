import { describe, expect, it } from "vitest";
import { countUpcoming, createAppointment, listAppointments } from "@/db/appointments";
import { agents, appointments, therapies } from "@/db/schema";
import { createTestDb } from "../helpers/db";

function setup() {
  const db = createTestDb();
  const ada = db.insert(agents).values({ name: "Ada", model: "m" }).returning().get();
  const bo = db.insert(agents).values({ name: "Bo", model: "m" }).returning().get();
  const nap = db.insert(therapies).values({ name: "Nap", description: "z", durationMinutes: 20 }).returning().get();
  return { db, ada, bo, nap };
}

const at = (iso: string) => new Date(iso);

describe("listAppointments", () => {
  it("lists appointments in start-time order, with agent and therapy names", () => {
    const { db, ada, bo, nap } = setup();
    db.insert(appointments)
      .values([
        { agentId: ada.id, therapyId: nap.id, startsAt: at("2026-12-03T10:00:00Z") },
        { agentId: bo.id, therapyId: nap.id, startsAt: at("2026-12-01T10:00:00Z"), notes: "Early" },
        { agentId: ada.id, therapyId: nap.id, startsAt: at("2026-11-01T10:00:00Z") },
      ])
      .run();
    const list = listAppointments(db);
    expect(list.map((a) => a.startsAt.toISOString().slice(0, 10))).toEqual(["2026-11-01", "2026-12-01", "2026-12-03"]);
    expect(list[1]).toMatchObject({ agentName: "Bo", therapyName: "Nap", durationMinutes: 20, notes: "Early" });
  });

  it("keeps only upcoming appointments when asked, including one starting right now", () => {
    const { db, ada, nap } = setup();
    const now = at("2026-12-01T10:00:00Z");
    db.insert(appointments)
      .values([
        { agentId: ada.id, therapyId: nap.id, startsAt: at("2026-12-01T09:59:00Z") },
        { agentId: ada.id, therapyId: nap.id, startsAt: now },
        { agentId: ada.id, therapyId: nap.id, startsAt: at("2026-12-02T10:00:00Z") },
      ])
      .run();
    expect(listAppointments(db, { upcomingFrom: now })).toHaveLength(2);
    expect(countUpcoming(db, now)).toBe(2);
    expect(countUpcoming(db, at("2027-01-01T00:00:00Z"))).toBe(0);
  });
});

describe("createAppointment", () => {
  it("books an appointment and returns it with names", () => {
    const { db, ada, nap } = setup();
    const result = createAppointment(db, { agentId: ada.id, therapyId: nap.id, startsAt: at("2026-12-01T10:00:00Z"), notes: null });
    expect(result).toMatchObject({ status: "created", appointment: { agentName: "Ada", therapyName: "Nap", notes: null } });
  });

  it("reports a double booking for the same agent and start time", () => {
    const { db, ada, bo, nap } = setup();
    const startsAt = at("2026-12-01T10:00:00Z");
    createAppointment(db, { agentId: ada.id, therapyId: nap.id, startsAt, notes: null });
    expect(createAppointment(db, { agentId: ada.id, therapyId: nap.id, startsAt, notes: null })).toEqual({
      status: "double-booked",
    });
    expect(createAppointment(db, { agentId: bo.id, therapyId: nap.id, startsAt, notes: null }).status).toBe("created");
  });

  it("reports an unknown agent or therapy", () => {
    const { db, ada, nap } = setup();
    const startsAt = at("2026-12-01T10:00:00Z");
    expect(createAppointment(db, { agentId: 999, therapyId: nap.id, startsAt, notes: null })).toEqual({ status: "not-found" });
    expect(createAppointment(db, { agentId: ada.id, therapyId: 999, startsAt, notes: null })).toEqual({ status: "not-found" });
    expect(listAppointments(db)).toEqual([]);
  });
});
