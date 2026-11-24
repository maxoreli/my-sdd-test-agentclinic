import { listAgents } from "@/db/agents";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

/** All agents, ordered by name. */
export function GET() {
  return Response.json({ agents: listAgents(getDb()) });
}
