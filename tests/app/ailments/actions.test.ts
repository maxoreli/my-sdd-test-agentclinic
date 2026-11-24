import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { recordAilment } from "@/app/ailments/actions";
import { countAilments, listAilments } from "@/db/ailments";
import { getDb, type Db } from "@/db/client";
import { agents } from "@/db/schema";
import { SEED_AILMENTS } from "@/db/seed";
import { initialFormState } from "@/lib/forms";
import { createTestDb } from "../../helpers/db";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));

const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

let db: Db;
let agentId: number;

beforeEach(() => {
  vi.clearAllMocks();
  db = createTestDb({ seed: true });
  vi.mocked(getDb).mockReturnValue(db);
  agentId = db.select().from(agents).all()[0].id;
});

describe("recordAilment", () => {
  it("records the ailment and refreshes the ailments page and dashboard", async () => {
    const state = await recordAilment(
      initialFormState,
      form({ agentId: String(agentId), name: "Hiccups", severity: "mild", description: "" }),
    );
    expect(state).toEqual({ ok: true, message: "Noted: Hiccups. Help is on the way." });
    expect(listAilments(db)[0]).toMatchObject({ agentId, name: "Hiccups", severity: "mild", description: null });
    expect(revalidatePath).toHaveBeenCalledWith("/ailments");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns field errors and keeps the typed values", async () => {
    const state = await recordAilment(initialFormState, form({ agentId: "", name: "", severity: "", description: "Sad" }));
    expect(state.ok).toBe(false);
    expect(Object.keys(state.errors ?? {}).sort()).toEqual(["agentId", "name", "severity"]);
    expect(state.values).toEqual({ agentId: "", name: "", severity: "", description: "Sad" });
    expect(countAilments(db)).toBe(SEED_AILMENTS.length);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("explains an unknown agent", async () => {
    const state = await recordAilment(initialFormState, form({ agentId: "9999", name: "Ghost pain", severity: "mild" }));
    expect(state.ok).toBe(false);
    expect(state.errors).toEqual({ agentId: "That agent isn't checked in. Choose one from the list." });
    expect(state.values).toMatchObject({ agentId: "9999", name: "Ghost pain" });
    expect(countAilments(db)).toBe(SEED_AILMENTS.length);
  });
});
