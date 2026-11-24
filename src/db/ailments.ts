// Ailment data access. Server code only: never import this from a client component.
import { count, desc, eq } from "drizzle-orm";
import { sqliteErrorCode } from "@/lib/forms";
import type { Db } from "./client";
import { agents, ailments, type Ailment, type Severity } from "./schema";
import { therapiesByAilment } from "./therapies";

export interface AilmentWithAgent extends Ailment {
  agentName: string;
  /** Therapies linked to this ailment, by name. */
  therapies: { id: number; name: string }[];
}

/** All ailments, newest first, with the agent who has each one and its linked therapies. */
export function listAilments(db: Db): AilmentWithAgent[] {
  const therapies = therapiesByAilment(db);
  const rows = db
    .select({
      id: ailments.id,
      agentId: ailments.agentId,
      name: ailments.name,
      severity: ailments.severity,
      description: ailments.description,
      createdAt: ailments.createdAt,
      agentName: agents.name,
    })
    .from(ailments)
    .innerJoin(agents, eq(ailments.agentId, agents.id))
    .orderBy(desc(ailments.createdAt), desc(ailments.id))
    .all();
  return rows.map((row) => ({ ...row, therapies: therapies.get(row.id) ?? [] }));
}

/** How many ailments are recorded. Every ailment is open until resolving exists. */
export function countAilments(db: Db): number {
  const [row] = db.select({ value: count() }).from(ailments).all();
  return row?.value ?? 0;
}

export interface AilmentInput {
  agentId: number;
  name: string;
  severity: Severity;
  description: string | null;
}

export type CreateAilmentResult = { status: "created"; ailment: Ailment } | { status: "agent-not-found" };

/** Record an ailment. An unknown agent is reported instead of thrown. */
export function createAilment(db: Db, input: AilmentInput): CreateAilmentResult {
  try {
    const ailment = db.insert(ailments).values(input).returning().get();
    return { status: "created", ailment };
  } catch (error) {
    if (sqliteErrorCode(error) === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return { status: "agent-not-found" };
    }
    throw error;
  }
}
