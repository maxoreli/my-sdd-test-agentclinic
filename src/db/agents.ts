// Agent data access. Server code only: never import this from a client component.
import { count, sql } from "drizzle-orm";
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
