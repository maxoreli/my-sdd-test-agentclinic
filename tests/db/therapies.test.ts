import { describe, expect, it } from "vitest";
import { listAilments } from "@/db/ailments";
import { ailments, ailmentTherapies, therapies } from "@/db/schema";
import { SEED_LINKS, SEED_THERAPIES } from "@/db/seed";
import { linkTherapy, listTherapies, therapiesByAilment } from "@/db/therapies";
import { createTestDb } from "../helpers/db";

const byName = (a: string, b: string) => a.localeCompare(b, "en", { sensitivity: "base" });

describe("listTherapies", () => {
  it("returns an empty list on an empty, migrated database", () => {
    expect(listTherapies(createTestDb())).toEqual([]);
  });

  it("lists therapies by name, each with its linked ailments and their agents", () => {
    const list = listTherapies(createTestDb({ seed: true }));
    expect(list.map((t) => t.name)).toEqual(SEED_THERAPIES.map((t) => t.name).sort(byName));

    const spa = list.find((t) => t.name === "Temperature Regulation Spa");
    expect(spa?.ailments).toEqual([{ id: expect.any(Number), name: "Confident confabulation", agentName: "Hallucinating Hal" }]);
    expect(list.flatMap((t) => t.ailments)).toHaveLength(SEED_LINKS.length);
  });

  it("gives unlinked therapies an empty list", () => {
    const db = createTestDb();
    db.insert(therapies).values({ name: "Nap", description: "z", durationMinutes: 5 }).run();
    expect(listTherapies(db)[0].ailments).toEqual([]);
  });
});

describe("therapiesByAilment and listAilments", () => {
  it("maps each ailment to its therapies", () => {
    const db = createTestDb({ seed: true });
    const confabulation = db.select().from(ailments).all().find((a) => a.name === "Confident confabulation")!;
    expect(therapiesByAilment(db).get(confabulation.id)?.map((t) => t.name)).toEqual([
      "Hallucination Grounding Session",
      "Temperature Regulation Spa",
    ]);
    const listed = listAilments(db).find((a) => a.id === confabulation.id);
    expect(listed?.therapies.map((t) => t.name)).toEqual(["Hallucination Grounding Session", "Temperature Regulation Spa"]);
  });
});

describe("linkTherapy", () => {
  function setup() {
    const db = createTestDb({ seed: true });
    const ailment = db.select().from(ailments).all().find((a) => a.name === "Prompt fatigue")!;
    const therapy = db.select().from(therapies).all().find((t) => t.name === "Temperature Regulation Spa")!;
    return { db, ailment, therapy };
  }

  it("links a therapy to an ailment and names both", () => {
    const { db, ailment, therapy } = setup();
    expect(linkTherapy(db, ailment.id, therapy.id)).toEqual({
      status: "linked",
      ailmentName: "Prompt fatigue",
      therapyName: "Temperature Regulation Spa",
    });
    expect(db.select().from(ailmentTherapies).all()).toHaveLength(SEED_LINKS.length + 1);
  });

  it("reports an existing link without duplicating it", () => {
    const { db, ailment, therapy } = setup();
    linkTherapy(db, ailment.id, therapy.id);
    expect(linkTherapy(db, ailment.id, therapy.id)).toMatchObject({ status: "already-linked" });
    expect(db.select().from(ailmentTherapies).all()).toHaveLength(SEED_LINKS.length + 1);
  });

  it("reports a missing ailment or therapy", () => {
    const { db, ailment, therapy } = setup();
    expect(linkTherapy(db, 9999, therapy.id)).toEqual({ status: "not-found" });
    expect(linkTherapy(db, ailment.id, 9999)).toEqual({ status: "not-found" });
    expect(db.select().from(ailmentTherapies).all()).toHaveLength(SEED_LINKS.length);
  });
});
