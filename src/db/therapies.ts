// Therapy data access. Server code only: never import this from a client component.
import { asc, eq, sql } from "drizzle-orm";
import type { Db } from "./client";
import { agents, ailments, ailmentTherapies, therapies, type Therapy } from "./schema";

export interface LinkedAilment {
  id: number;
  name: string;
  agentName: string;
}

export interface TherapyWithAilments extends Therapy {
  ailments: LinkedAilment[];
}

/** All therapies, ordered by name, each with the ailments it is linked to. */
export function listTherapies(db: Db): TherapyWithAilments[] {
  const rows = db
    .select()
    .from(therapies)
    .orderBy(sql`${therapies.name} collate nocase`, therapies.id)
    .all();

  const links = db
    .select({
      therapyId: ailmentTherapies.therapyId,
      id: ailments.id,
      name: ailments.name,
      agentName: agents.name,
    })
    .from(ailmentTherapies)
    .innerJoin(ailments, eq(ailmentTherapies.ailmentId, ailments.id))
    .innerJoin(agents, eq(ailments.agentId, agents.id))
    .orderBy(asc(ailments.name), asc(ailments.id))
    .all();

  const byTherapy = new Map<number, LinkedAilment[]>();
  for (const { therapyId, ...ailment } of links) {
    byTherapy.set(therapyId, [...(byTherapy.get(therapyId) ?? []), ailment]);
  }
  return rows.map((therapy) => ({ ...therapy, ailments: byTherapy.get(therapy.id) ?? [] }));
}

/** Therapies (id and name) linked to each ailment, keyed by ailment id. */
export function therapiesByAilment(db: Db): Map<number, { id: number; name: string }[]> {
  const links = db
    .select({ ailmentId: ailmentTherapies.ailmentId, id: therapies.id, name: therapies.name })
    .from(ailmentTherapies)
    .innerJoin(therapies, eq(ailmentTherapies.therapyId, therapies.id))
    .orderBy(sql`${therapies.name} collate nocase`)
    .all();

  const byAilment = new Map<number, { id: number; name: string }[]>();
  for (const { ailmentId, ...therapy } of links) {
    byAilment.set(ailmentId, [...(byAilment.get(ailmentId) ?? []), therapy]);
  }
  return byAilment;
}

export type LinkTherapyResult =
  | { status: "linked" | "already-linked"; ailmentName: string; therapyName: string }
  | { status: "not-found" };

/** Link a therapy to an ailment. Linking twice is harmless and reported as such. */
export function linkTherapy(db: Db, ailmentId: number, therapyId: number): LinkTherapyResult {
  const ailment = db.select({ name: ailments.name }).from(ailments).where(eq(ailments.id, ailmentId)).get();
  const therapy = db.select({ name: therapies.name }).from(therapies).where(eq(therapies.id, therapyId)).get();
  if (!ailment || !therapy) {
    return { status: "not-found" };
  }

  const { changes } = db.insert(ailmentTherapies).values({ ailmentId, therapyId }).onConflictDoNothing().run();
  return {
    status: changes > 0 ? "linked" : "already-linked",
    ailmentName: ailment.name,
    therapyName: therapy.name,
  };
}
