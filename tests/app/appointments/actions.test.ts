import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { bookAppointment } from "@/app/appointments/actions";
import { listAppointments } from "@/db/appointments";
import { getDb, type Db } from "@/db/client";
import { agents, therapies } from "@/db/schema";
import { initialFormState } from "@/lib/forms";
import { createTestDb } from "../../helpers/db";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));

const NOW = new Date("2026-11-24T12:00:00Z");
const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

let db: Db;
let booking: Record<string, string>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  db = createTestDb();
  const agent = db.insert(agents).values({ name: "Ada", model: "m" }).returning().get();
  const therapy = db.insert(therapies).values({ name: "Nap", description: "z", durationMinutes: 20 }).returning().get();
  vi.mocked(getDb).mockReturnValue(db);
  booking = { agentId: String(agent.id), therapyId: String(therapy.id), startsAt: "2026-11-25T09:30", notes: "" };
});
afterEach(() => {
  vi.useRealTimers();
});

describe("bookAppointment", () => {
  it("books the appointment and refreshes the schedule and dashboard", async () => {
    const state = await bookAppointment(initialFormState, form(booking));
    expect(state).toEqual({
      ok: true,
      message: "Booked: Ada for Nap, Wed, 25 Nov 2026, 09:30 UTC. See you on the couch!",
    });
    expect(listAppointments(db)[0]).toMatchObject({ startsAt: new Date("2026-11-25T09:30:00Z"), notes: null });
    expect(revalidatePath).toHaveBeenCalledWith("/appointments");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("rejects a time in the past and keeps the typed values", async () => {
    const state = await bookAppointment(initialFormState, form({ ...booking, startsAt: "2026-11-24T11:00" }));
    expect(state.ok).toBe(false);
    expect(state.errors).toEqual({ startsAt: "Pick a time in the future. The clinic can't see anyone yesterday." });
    expect(state.values).toMatchObject({ startsAt: "2026-11-24T11:00" });
    expect(listAppointments(db)).toEqual([]);
  });

  it("rejects a double booking on the start time field", async () => {
    await bookAppointment(initialFormState, form(booking));
    const state = await bookAppointment(initialFormState, form(booking));
    expect(state.ok).toBe(false);
    expect(state.errors).toEqual({ startsAt: "That agent already has an appointment at this time. Try another slot." });
    expect(listAppointments(db)).toHaveLength(1);
  });

  it("explains an unknown agent or therapy", async () => {
    const state = await bookAppointment(initialFormState, form({ ...booking, therapyId: "999" }));
    expect(state).toMatchObject({ ok: false, message: "That agent or therapy isn't on file any more. Pick again from the lists." });
    expect(listAppointments(db)).toEqual([]);
  });

  it("returns field errors for missing choices", async () => {
    const state = await bookAppointment(initialFormState, form({ agentId: "", therapyId: "", startsAt: "", notes: "" }));
    expect(Object.keys(state.errors ?? {}).sort()).toEqual(["agentId", "startsAt", "therapyId"]);
  });
});
