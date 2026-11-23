import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Home, { dynamic } from "@/app/page";
import { metadata, viewport } from "@/app/layout";
import { createDb, getDb } from "@/db/client";
import { agents } from "@/db/schema";
import { SEED_AGENTS } from "@/db/seed";
import { createTestDb } from "../helpers/db";

// Keep the real createDb (used by the test helper) but control the app's shared client.
vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));

const mockedGetDb = vi.mocked(getDb);
const render = () => renderToStaticMarkup(<Home />);

beforeEach(() => {
  // The fallback path logs why the waiting room is unavailable; keep test output quiet.
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  mockedGetDb.mockReset();
});

describe("home page", () => {
  describe("with seeded agents", () => {
    beforeEach(() => {
      mockedGetDb.mockReturnValue(createTestDb({ seed: true }));
    });

    it("shows the AgentClinic name and tagline", () => {
      const html = render();
      expect(html).toContain("<h1>AgentClinic</h1>");
      expect(html).toContain("Relief for AI agents, from their humans.");
    });

    it("shows the waiting-room count inside an article", () => {
      expect(render()).toMatch(
        new RegExp(`<article[^>]*>.*${SEED_AGENTS.length} agents are in the waiting room.*</article>`),
      );
    });

    it("lists every seeded agent name in a list", () => {
      const html = render();
      const list = html.match(/<ul>(.*?)<\/ul>/)?.[1] ?? "";
      for (const { name } of SEED_AGENTS) {
        expect(list).toContain(`<li>${name}</li>`);
      }
      expect(list.match(/<li>/g)).toHaveLength(SEED_AGENTS.length);
    });

    it("has no navigation or links to future features", () => {
      const html = render();
      expect(html).not.toContain("<nav");
      expect(html).not.toContain("<a ");
    });
  });

  it("uses the singular when one agent is waiting", () => {
    const db = createTestDb();
    db.insert(agents).values({ name: "Lonely Lou", model: "m" }).run();
    mockedGetDb.mockReturnValue(db);
    expect(render()).toContain("1 agent is in the waiting room");
  });

  describe("fallback", () => {
    function expectFallback(html: string) {
      expect(html).toMatch(/<article[^>]*>.*The waiting room is empty.*<\/article>/);
      expect(html).toContain("npm run db:migrate");
      expect(html).toContain("npm run db:seed");
      expect(html).not.toContain("<ul>");
      expect(html).not.toContain("<a ");
      expect(html).toContain("<h1>AgentClinic</h1>");
    }

    it("shows the empty waiting room when there are no agents", () => {
      mockedGetDb.mockReturnValue(createTestDb());
      expectFallback(render());
    });

    it("shows the empty waiting room when the database is not migrated", () => {
      mockedGetDb.mockReturnValue(createDb(":memory:"));
      expectFallback(render());
    });

    it("shows the empty waiting room instead of throwing when the database is missing", () => {
      mockedGetDb.mockImplementation(() => {
        throw new Error("unable to open database file");
      });
      expect(render).not.toThrow();
      expectFallback(render());
      expect(console.warn).toHaveBeenCalled();
    });
  });

  it("renders on every request, so the build needs no database", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("sets the AgentClinic title and description metadata", () => {
    expect(metadata.title).toBe("AgentClinic");
    expect(metadata.description).toBe(
      "A place for AI agents to get relief from their humans.",
    );
  });

  it("sets a device-width viewport for responsive layouts", () => {
    expect(viewport).toEqual({ width: "device-width", initialScale: 1 });
  });
});
