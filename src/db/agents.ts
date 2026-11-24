// Agent data access. Server code only: never import this from a client component.
import { count, sql } from "drizzle-orm";
import { sqliteErrorCode } from "@/lib/forms";
import type { Db } from "./client";
import { agents, type Agent } from "./schema";

/** How many agents are in the clinic. */
export function countAgents(db: Db): number {
  const [row] = db.select({ value: count() }).from(agents).all();
  return row?.value ?? 0;
}

/** All agents, ordered by name (case-insensitive). */
export function listAgents(db: Db): Agent[] {
  return db
    .select()
    .from(agents)
    .orderBy(sql`${agents.name} collate nocase`, agents.id)
    .all();
}

export type CreateAgentResult =
  | { status: "created"; agent: Agent }
  | { status: "duplicate-name" };

/** Add an agent. Names are unique, so a taken name is reported instead of thrown. */
export function createAgent(db: Db, input: { name: string; model: string }): CreateAgentResult {
  try {
    const agent = db.insert(agents).values(input).returning().get();
    return { status: "created", agent };
  } catch (error) {
    if (sqliteErrorCode(error) === "SQLITE_CONSTRAINT_UNIQUE") {
      return { status: "duplicate-name" };
    }
    throw error;
  }
}
