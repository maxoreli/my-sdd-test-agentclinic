import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AppointmentsPage, { metadata } from "@/app/appointments/page";
import { getDb } from "@/db/client";
import { appointments } from "@/db/schema";
import { SEED_AGENTS, SEED_APPOINTMENTS, SEED_THERAPIES } from "@/db/seed";
import { createTestDb } from "../../helpers/db";
import { renderHtml } from "../../helpers/render";

vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));

const NOW = new Date("2026-11-24T12:00:00Z");
const render = () => renderHtml(AppointmentsPage());

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  vi.mocked(getDb).mockReturnValue(createTestDb({ seed: true }));
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("appointments page", () => {
  it("has a heading, says times are UTC, and has its own title", () => {
    const html = render();
    expect(html).toContain("<h1>Appointments</h1>");
    expect(html).toContain("All times are in UTC.");
    expect(metadata.title).toBe("Appointments");
  });

  it("shows the schedule as cards and as a table, in time order", () => {
    const html = render();
    const cards = html.match(/<div class="schedule-cards">(.*?)<\/div><div class="overflow-auto schedule-table">/)?.[1] ?? "";
    expect(cards.match(/<article>/g)).toHaveLength(SEED_APPOINTMENTS.length);
    expect(html).toMatch(/<div class="overflow-auto schedule-table"><table>/);
    expect(html).toContain('<time dateTime="2026-11-25T09:00:00.000Z">Wed, 25 Nov 2026, 09:00 UTC</time>');
    const order = [...cards.matchAll(/dateTime="([^"]+)"/g)].map(([, iso]) => iso);
    expect(order).toEqual([...order].sort());
  });

  it("leaves past appointments off the schedule", () => {
    const db = createTestDb({ seed: true });
    db.update(appointments).set({ startsAt: new Date("2026-01-01T00:00:00Z") }).run();
    vi.mocked(getDb).mockReturnValue(db);
    expect(render()).toContain("The couch is free.");
  });

  it("offers a booking form with agents, therapies, and a UTC start time", () => {
    const html = render();
    expect(html).toContain("Book an appointment");
    for (const { name } of SEED_AGENTS) expect(html).toMatch(new RegExp(`<option value="\\d+">${name}</option>`));
    for (const { name, durationMinutes } of SEED_THERAPIES) {
      expect(html).toMatch(new RegExp(`<option value="\\d+">${name} \\(${durationMinutes} min\\)</option>`));
    }
    expect(html).toMatch(/<label for="startsAt">Start \(UTC\)<\/label><input id="startsAt"[^>]*type="datetime-local"[^>]*min="2026-11-24T12:00"/);
  });

  it("explains what's missing before booking is possible", () => {
    vi.mocked(getDb).mockReturnValue(createTestDb());
    const html = render();
    expect(html).toContain("The couch is free.");
    expect(html).toContain("Check in an agent and stock the therapy menu before booking.");
    expect(html).not.toContain("<form");
  });

  it("explains a missing database instead of throwing", () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new Error("unable to open database file");
    });
    expect(render()).toContain("npm run db:migrate");
  });
});
