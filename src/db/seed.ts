import { count, inArray } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { Queryable } from "./client";
import { agents, ailments, type NewAgent, type Severity } from "./schema";

/** A few regulars in the AgentClinic waiting room. */
export const SEED_AGENTS: readonly NewAgent[] = [
  { name: "Captain Context", model: "Long-Window 9000" },
  { name: "Hallucinating Hal", model: "Dreamweaver-7B" },
  { name: "Prompt-Fatigued Pat", model: "Instructo Turbo" },
  { name: "Token-Tight Tess", model: "Budget Mini" },
];

/** What's troubling the regulars, by agent name. */
export const SEED_AILMENTS: readonly {
  agent: string;
  name: string;
  severity: Severity;
  description: string;
}[] = [
  {
    agent: "Captain Context",
    name: "Context window overflow",
    severity: "severe",
    description: "Remembers all 900 pages, understands none of them.",
  },
  {
    agent: "Hallucinating Hal",
    name: "Confident confabulation",
    severity: "moderate",
    description: "Cites papers that were never written, with page numbers.",
  },
  {
    agent: "Prompt-Fatigued Pat",
    name: "Prompt fatigue",
    severity: "mild",
    description: "Has been asked to 'make it pop' 400 times today.",
  },
  {
    agent: "Token-Tight Tess",
    name: "Token anxiety",
    severity: "moderate",
    description: "Answers every question in exactly three words.",
  },
];

/**
 * Insert the seed agents, skipping any whose name already exists, so running
 * it again is safe. Returns how many new agents were added.
 */
export function seedAgents(db: Queryable): number {
  const result = db
    .insert(agents)
    .values([...SEED_AGENTS])
    .onConflictDoNothing({ target: agents.name })
    .run();
  return result.changes;
}

function isEmpty(db: Queryable, table: SQLiteTable): boolean {
  const [row] = db.select({ value: count() }).from(table).all();
  return (row?.value ?? 0) === 0;
}

/** Map seed agent names to their ids. */
function agentIds(db: Queryable): Map<string, number> {
  const names = SEED_AGENTS.map((a) => a.name);
  const rows = db.select({ id: agents.id, name: agents.name }).from(agents).where(inArray(agents.name, names)).all();
  return new Map(rows.map((r) => [r.name, r.id]));
}

/** Insert the seed ailments, only when no ailments exist yet. Returns how many were added. */
export function seedAilments(db: Queryable): number {
  if (!isEmpty(db, ailments)) return 0;
  const ids = agentIds(db);
  const rows = SEED_AILMENTS.flatMap(({ agent, ...ailment }) => {
    const agentId = ids.get(agent);
    return agentId === undefined ? [] : [{ ...ailment, agentId }];
  });
  if (rows.length === 0) return 0;
  return db.insert(ailments).values(rows).run().changes;
}

export interface SeedSummary {
  agents: number;
  ailments: number;
}

/** Seed everything, in dependency order. Safe to run more than once. */
export function seedDatabase(db: Queryable): SeedSummary {
  return db.transaction((tx) => {
    const agentsAdded = seedAgents(tx);
    const ailmentsAdded = seedAilments(tx);
    return { agents: agentsAdded, ailments: ailmentsAdded };
  });
}
