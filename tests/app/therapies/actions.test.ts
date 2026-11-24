import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { linkTherapyToAilment } from "@/app/therapies/actions";
import { getDb, type Db } from "@/db/client";
import { ailments, ailmentTherapies, therapies } from "@/db/schema";
import { SEED_LINKS } from "@/db/seed";
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
let link: Record<string, string>;
const linkCount = () => db.select().from(ailmentTherapies).all().length;

beforeEach(() => {
  vi.clearAllMocks();
  db = createTestDb({ seed: true });
  vi.mocked(getDb).mockReturnValue(db);
  vi.mocked(getRole).mockResolvedValue("staff");
  const ailment = db.select().from(ailments).all().find((a) => a.name === "Token anxiety")!;
  const therapy = db.select().from(therapies).all().find((t) => t.name === "Prompt Detox")!;
  link = { ailmentId: String(ailment.id), therapyId: String(therapy.id) };
});

describe("linkTherapyToAilment", () => {
  it("links the therapy and refreshes the therapies and ailments pages", async () => {
    const state = await linkTherapyToAilment(initialFormState, form(link));
    expect(state).toEqual({ ok: true, message: "Prescribed: Prompt Detox for Token anxiety." });
    expect(linkCount()).toBe(SEED_LINKS.length + 1);
    expect(revalidatePath).toHaveBeenCalledWith("/therapies");
    expect(revalidatePath).toHaveBeenCalledWith("/ailments");
  });

  it("says when the pair is already linked, without duplicating it", async () => {
    await linkTherapyToAilment(initialFormState, form(link));
    const state = await linkTherapyToAilment(initialFormState, form(link));
    expect(state).toEqual({ ok: true, message: "Prompt Detox is already linked to Token anxiety. Nothing to change." });
    expect(linkCount()).toBe(SEED_LINKS.length + 1);
  });

  it("returns field errors for missing choices", async () => {
    const state = await linkTherapyToAilment(initialFormState, form({ ailmentId: "", therapyId: "" }));
    expect(state.ok).toBe(false);
    expect(state.errors).toEqual({ ailmentId: "Choose which ailment to treat.", therapyId: "Choose a therapy." });
    expect(linkCount()).toBe(SEED_LINKS.length);
  });

  it("explains a missing ailment or therapy", async () => {
    const state = await linkTherapyToAilment(initialFormState, form({ ...link, therapyId: "9999" }));
    expect(state).toMatchObject({ ok: false, message: "That ailment or therapy isn't on file any more. Pick again from the lists." });
    expect(linkCount()).toBe(SEED_LINKS.length);
  });

  it("refuses the agent role without writing", async () => {
    vi.mocked(getRole).mockResolvedValue("agent");
    const state = await linkTherapyToAilment(initialFormState, form(link));
    expect(state).toEqual({
      ok: false,
      message: "Only clinic staff can prescribe therapies. Switch to the staff view to link one.",
    });
    expect(linkCount()).toBe(SEED_LINKS.length);
  });
});
