import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { addAgent } from "@/app/agents/actions";
import { countAgents, listAgents } from "@/db/agents";
import { getDb, type Db } from "@/db/client";
import { SEED_AGENTS } from "@/db/seed";
import { initialFormState } from "@/lib/forms";
import { getRole } from "@/lib/role";
import { createTestDb } from "../../helpers/db";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: vi.fn(),
}));
vi.mock("@/lib/role", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/role")>()),
  getRole: vi.fn(),
}));

const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

let db: Db;

beforeEach(() => {
  vi.clearAllMocks();
  db = createTestDb({ seed: true });
  vi.mocked(getDb).mockReturnValue(db);
  vi.mocked(getRole).mockResolvedValue("staff");
});

describe("addAgent", () => {
  it("checks in a new agent and refreshes the agents page and dashboard", async () => {
    const state = await addAgent(initialFormState, form({ name: " Newbie Nia ", model: "Fresh-1" }));
    expect(state).toEqual({ ok: true, message: "Newbie Nia is checked in. Make yourself comfortable!" });
    expect(listAgents(db).map((a) => a.name)).toContain("Newbie Nia");
    expect(revalidatePath).toHaveBeenCalledWith("/agents");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns field errors and keeps the typed values", async () => {
    const state = await addAgent(initialFormState, form({ name: "", model: "Fresh-1" }));
    expect(state.ok).toBe(false);
    expect(state.errors).toEqual({ name: "Every agent needs a name." });
    expect(state.values).toEqual({ name: "", model: "Fresh-1" });
    expect(countAgents(db)).toBe(SEED_AGENTS.length);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("explains a duplicate name on the name field", async () => {
    const name = SEED_AGENTS[0].name;
    const state = await addAgent(initialFormState, form({ name, model: "Clone" }));
    expect(state.ok).toBe(false);
    expect(state.errors?.name).toBe(`${name} is already checked in. Try a different name.`);
    expect(state.values).toEqual({ name, model: "Clone" });
    expect(countAgents(db)).toBe(SEED_AGENTS.length);
  });

  it("refuses the agent role without writing", async () => {
    vi.mocked(getRole).mockResolvedValue("agent");
    const state = await addAgent(initialFormState, form({ name: "Sneaky Sam", model: "x" }));
    expect(state).toEqual({
      ok: false,
      message: "Only clinic staff can check in new agents. Switch to the staff view to add one.",
    });
    expect(countAgents(db)).toBe(SEED_AGENTS.length);
  });
});
