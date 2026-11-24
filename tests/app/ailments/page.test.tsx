import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AilmentsPage, { metadata } from "@/app/ailments/page";
import { getDb } from "@/db/client";
import { SEED_AGENTS, SEED_AILMENTS } from "@/db/seed";
import { createTestDb } from "../../helpers/db";
import { renderHtml } from "../../helpers/render";

vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));

const render = () => renderHtml(AilmentsPage());

beforeEach(() => {
  vi.mocked(getDb).mockReturnValue(createTestDb({ seed: true }));
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("ailments page", () => {
  it("has a heading and its own title", () => {
    expect(render()).toContain("<h1>Ailments</h1>");
    expect(metadata.title).toBe("Ailments");
  });

  it("lists every ailment with its agent and severity in a scrollable table", () => {
    const html = render();
    expect(html).toMatch(/<div class="overflow-auto"><table>/);
    for (const { agent, name, severity, description } of SEED_AILMENTS) {
      expect(html).toContain(`<td>${agent}</td><td>${name}<br/><small>${description.replace(/'/g, "&#x27;")}</small></td><td>${severity}</td>`);
    }
  });

  it("offers a form to record an ailment, with every agent to choose from", () => {
    const html = render();
    expect(html).toContain("Record an ailment");
    for (const { name } of SEED_AGENTS) {
      expect(html).toMatch(new RegExp(`<option value="\\d+">${name}</option>`));
    }
    expect(html).toMatch(/<select id="severity"[^>]*>.*<option value="mild">Mild<\/option><option value="moderate">Moderate<\/option><option value="severe">Severe<\/option>/);
  });

  it("asks for an agent first when there are none", () => {
    vi.mocked(getDb).mockReturnValue(createTestDb());
    const html = render();
    expect(html).toContain("No ailments recorded.");
    expect(html).toContain("Check in an agent first");
    expect(html).not.toContain("<form");
  });

  it("explains a missing database instead of throwing", () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new Error("unable to open database file");
    });
    expect(render()).toContain("npm run db:migrate");
  });
});
