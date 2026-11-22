import type { Db } from "./client";
import { agents, type NewAgent } from "./schema";

/** A few regulars in the AgentClinic waiting room. */
export const SEED_AGENTS: readonly NewAgent[] = [
  { name: "Captain Context", model: "Long-Window 9000" },
  { name: "Hallucinating Hal", model: "Dreamweaver-7B" },
  { name: "Prompt-Fatigued Pat", model: "Instructo Turbo" },
  { name: "Token-Tight Tess", model: "Budget Mini" },
];

/**
 * Insert the seed agents, skipping any whose name already exists, so running
 * it again is safe. Returns how many new agents were added.
 */
export function seedAgents(db: Db): number {
  const result = db
    .insert(agents)
    .values([...SEED_AGENTS])
    .onConflictDoNothing({ target: agents.name })
    .run();
  return result.changes;
}
