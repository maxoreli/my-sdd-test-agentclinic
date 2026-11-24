import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AgentsPage, { metadata } from "@/app/agents/page";
import { getDb } from "@/db/client";
import { SEED_AGENTS } from "@/db/seed";
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

const render = async () => renderHtml(await AgentsPage());

beforeEach(() => {
  vi.mocked(getDb).mockReturnValue(createTestDb({ seed: true }));
  vi.mocked(getRole).mockResolvedValue("staff");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("agents page", () => {
  it("has a heading and its own title", async () => {
    expect(await render()).toContain("<h1>Agents</h1>");
    expect(metadata.title).toBe("Agents");
  });

  it("lists every agent in a table that scrolls inside its own container", async () => {
    const html = await render();
    expect(html).toMatch(/<div class="overflow-auto"><table>/);
    for (const { name, model } of SEED_AGENTS) {
      expect(html).toContain(`<td>${name}</td><td>${model}</td>`);
    }
    expect(html).toContain('<th scope="col">Joined (UTC)</th>');
  });

  it("shows the add-agent form to staff", async () => {
    const html = await render();
    expect(html).toContain("Check in a new agent");
    expect(html).toMatch(/<input id="name"[^>]*name="name"/);
    expect(html).toMatch(/<input id="model"[^>]*name="model"/);
  });

  it("hides the add-agent form from agents", async () => {
    vi.mocked(getRole).mockResolvedValue("agent");
    const html = await render();
    expect(html).not.toContain("Check in a new agent");
    expect(html).not.toContain("<form");
    expect(html).toContain("Only clinic staff can check in new agents.");
  });

  it("has a friendly empty state", async () => {
    vi.mocked(getDb).mockReturnValue(createTestDb());
    const html = await render();
    expect(html).toContain("No agents yet.");
    expect(html).not.toContain("<table>");
  });

  it("explains a missing database instead of throwing", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new Error("unable to open database file");
    });
    expect(await render()).toContain("npm run db:migrate");
  });
});
