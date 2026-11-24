import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TherapiesPage, { metadata } from "@/app/therapies/page";
import { getDb } from "@/db/client";
import { SEED_THERAPIES } from "@/db/seed";
import { getRole } from "@/lib/role";
import { createTestDb } from "../../helpers/db";
import { renderHtml } from "../../helpers/render";

vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));
vi.mock("@/lib/role", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/role")>()),
  getRole: vi.fn(),
}));

const render = async () => renderHtml(await TherapiesPage());

beforeEach(() => {
  vi.mocked(getDb).mockReturnValue(createTestDb({ seed: true }));
  vi.mocked(getRole).mockResolvedValue("staff");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("therapies page", () => {
  it("has a heading and its own title", async () => {
    expect(await render()).toContain("<h1>Therapies</h1>");
    expect(metadata.title).toBe("Therapies");
  });

  it("lists each therapy with its description, length, and the ailments it treats", async () => {
    const html = await render();
    expect(html).toMatch(/<div class="overflow-auto"><table>/);
    for (const { name, durationMinutes } of SEED_THERAPIES) {
      expect(html).toMatch(new RegExp(`<td>${name}<br/><small>[^<]+</small></td><td>${durationMinutes} min</td>`));
    }
    expect(html).toContain("Prompt fatigue <small>(Prompt-Fatigued Pat)</small>");
  });

  it("shows the prescribe form to staff, listing ailments with their agents", async () => {
    const html = await render();
    expect(html).toContain("Prescribe a therapy");
    expect(html).toMatch(/<option value="\d+">Token anxiety \(Token-Tight Tess\)<\/option>/);
    expect(html).toMatch(/<option value="\d+">Prompt Detox<\/option>/);
  });

  it("hides the prescribe form from agents", async () => {
    vi.mocked(getRole).mockResolvedValue("agent");
    const html = await render();
    expect(html).not.toContain("<form");
    expect(html).toContain("Only clinic staff can prescribe therapies.");
  });

  it("has friendly empty states", async () => {
    vi.mocked(getDb).mockReturnValue(createTestDb());
    const html = await render();
    expect(html).toContain("The therapy menu is empty.");
    expect(html).toContain("Record an ailment first");
    expect(html).not.toContain("<form");
  });

  it("explains a missing database instead of throwing", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new Error("unable to open database file");
    });
    expect(await render()).toContain("npm run db:migrate");
  });
});
