import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Dashboard, { dynamic } from "@/app/page";
import { metadata, viewport } from "@/app/layout";
import { createDb, getDb } from "@/db/client";
import { agents } from "@/db/schema";
import { SEED_AGENTS, SEED_AILMENTS, SEED_APPOINTMENTS } from "@/db/seed";
import { getRole } from "@/lib/role";
import { createTestDb } from "../helpers/db";

// Keep the real createDb (used by the test helper) but control the app's shared client.
vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));
vi.mock("@/lib/role", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/role")>()),
  getRole: vi.fn(),
}));

const mockedGetDb = vi.mocked(getDb);
const mockedGetRole = vi.mocked(getRole);
const render = async () => renderToStaticMarkup(await Dashboard());

const NOW = new Date("2026-11-24T12:00:00Z");

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  mockedGetRole.mockResolvedValue("staff");
  // The fallback path logs why the waiting room is unavailable; keep test output quiet.
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  mockedGetDb.mockReset();
  mockedGetRole.mockReset();
});

describe("dashboard", () => {
  describe("with seeded agents", () => {
    beforeEach(() => {
      mockedGetDb.mockReturnValue(createTestDb({ seed: true }));
    });

    it("greets staff with the clinic overview and tagline", async () => {
      const html = await render();
      expect(html).toContain("<h1>Clinic overview</h1>");
      expect(html).toContain("Relief for AI agents, from their humans.");
    });

    it("welcomes agents back", async () => {
      mockedGetRole.mockResolvedValue("agent");
      expect(await render()).toContain("<h1>Welcome back, agent</h1>");
    });

    it("lays out three panels in a Pico grid", async () => {
      const html = await render();
      const grid = html.match(/<div class="grid">(.*)<\/div>/)?.[1] ?? "";
      expect(grid.match(/<article /g)).toHaveLength(3);
      for (const heading of ["Agents", "Open ailments", "Upcoming appointments"]) {
        expect(grid).toMatch(new RegExp(`<h2 id="panel-[a-z]+">${heading}</h2>`));
      }
    });

    it("shows the waiting-room count in the Agents panel", async () => {
      expect(await render()).toMatch(
        new RegExp(`<article aria-labelledby="panel-agents">.*${SEED_AGENTS.length} agents are in the waiting room.*?</article>`),
      );
    });

    it("lists every seeded agent name in a list", async () => {
      const html = await render();
      const list = html.match(/<ul>(.*?)<\/ul>/)?.[1] ?? "";
      for (const { name } of SEED_AGENTS) {
        expect(list).toContain(`<li>${name}</li>`);
      }
      expect(list.match(/<li>/g)).toHaveLength(SEED_AGENTS.length);
    });
  });

  describe("panels with seeded data", () => {
    beforeEach(() => {
      mockedGetDb.mockReturnValue(createTestDb({ seed: true }));
    });

    const panel = (html: string, id: string) =>
      html.match(new RegExp(`<article aria-labelledby="panel-${id}">(.*?)</article>`))?.[1] ?? "";

    it("counts open ailments and lists the three most recent with agent and severity", async () => {
      const ailments = panel(await render(), "ailments");
      expect(ailments).toContain(`<p>${SEED_AILMENTS.length} open ailments</p>`);
      expect(ailments.match(/<li>/g)).toHaveLength(3);
      expect(ailments).toMatch(/<li>[^<]+ <small>\([^,]+, (mild|moderate|severe)\)<\/small><\/li>/);
    });

    it("counts upcoming appointments and lists the next three in UTC", async () => {
      const appointments = panel(await render(), "appointments");
      expect(appointments).toContain(`<p>${SEED_APPOINTMENTS.length} upcoming appointments</p>`);
      expect(appointments.match(/<li>/g)).toHaveLength(3);
      expect(appointments).toContain(
        '<li><time dateTime="2026-11-25T09:00:00.000Z">Wed, 25 Nov 2026, 09:00 UTC</time><br/>Captain Context: Context Window Decluttering</li>',
      );
    });

    it("links each panel to its page", async () => {
      const html = await render();
      expect(panel(html, "agents")).toContain('<a class="panel-link" href="/agents">View all agents</a>');
      expect(panel(html, "ailments")).toContain('<a class="panel-link" href="/ailments">View all ailments</a>');
      expect(panel(html, "appointments")).toContain('<a class="panel-link" href="/appointments">View the schedule</a>');
    });
  });

  it("has playful empty states for every panel", async () => {
    mockedGetDb.mockReturnValue(createTestDb());
    const html = await render();
    expect(html).toContain("The waiting room is empty.");
    expect(html).toContain("No open ailments. Everyone&#x27;s feeling suspiciously well.");
    expect(html).toContain("The couch is free. No appointments coming up.");
  });

  it("uses the singular for one ailment and one appointment", async () => {
    const db = createTestDb({ seed: true });
    db.$client.exec("DELETE FROM ailment_therapies; DELETE FROM ailments WHERE id > 1; DELETE FROM appointments WHERE id > 1;");
    mockedGetDb.mockReturnValue(db);
    const html = await render();
    expect(html).toContain("<p>1 open ailment</p>");
    expect(html).toContain("<p>1 upcoming appointment</p>");
  });

  it("uses the singular when one agent is waiting", async () => {
    const db = createTestDb();
    db.insert(agents).values({ name: "Lonely Lou", model: "m" }).run();
    mockedGetDb.mockReturnValue(db);
    expect(await render()).toContain("1 agent is in the waiting room");
  });

  describe("fallback", () => {
    function expectFallback(html: string) {
      expect(html).toMatch(/<article aria-labelledby="panel-agents">.*The waiting room is empty.*?<\/article>/);
      expect(html).toContain("npm run db:migrate");
      expect(html).toContain("npm run db:seed");
      expect(html).toContain("<h1>Clinic overview</h1>");
    }

    it("shows the empty waiting room when there are no agents", async () => {
      mockedGetDb.mockReturnValue(createTestDb());
      expectFallback(await render());
    });

    it("shows the empty waiting room when the database is not migrated", async () => {
      mockedGetDb.mockReturnValue(createDb(":memory:"));
      expectFallback(await render());
    });

    it("shows the empty waiting room instead of throwing when the database is missing", async () => {
      mockedGetDb.mockImplementation(() => {
        throw new Error("unable to open database file");
      });
      expectFallback(await render());
      expect(console.warn).toHaveBeenCalled();
    });
  });

  it("renders on every request, so the build needs no database", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("sets the AgentClinic title template and description metadata", () => {
    expect(metadata.title).toEqual({ default: "AgentClinic", template: "%s · AgentClinic" });
    expect(metadata.description).toBe("A place for AI agents to get relief from their humans.");
  });

  it("sets a device-width viewport for responsive layouts", () => {
    expect(viewport).toEqual({ width: "device-width", initialScale: 1 });
  });
});
