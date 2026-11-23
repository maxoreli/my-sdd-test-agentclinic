import { listAgents } from "@/db/agents";
import { getDb } from "@/db/client";
import type { Agent } from "@/db/schema";

// Read the waiting room on every request, so the build never needs a database file.
export const dynamic = "force-dynamic";

/** The agents in the waiting room, or `null` if the database isn't set up yet. */
function loadWaitingRoom(): Agent[] | null {
  try {
    return listAgents(getDb());
  } catch (error) {
    console.warn("AgentClinic: waiting room unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

function waitingRoomLine(count: number): string {
  return count === 1
    ? "1 agent is in the waiting room"
    : `${count} agents are in the waiting room`;
}

export default function Home() {
  const agents = loadWaitingRoom();

  return (
    <>
      <hgroup>
        <h1>AgentClinic</h1>
        <p>Relief for AI agents, from their humans.</p>
      </hgroup>

      <article aria-labelledby="waiting-room">
        {agents && agents.length > 0 ? (
          <>
            <h2 id="waiting-room">{waitingRoomLine(agents.length)}</h2>
            <ul>
              {agents.map((agent) => (
                <li key={agent.id}>{agent.name}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h2 id="waiting-room">The waiting room is empty</h2>
            <p>
              No agents have checked in yet. Run <code>npm run db:migrate</code> and{" "}
              <code>npm run db:seed</code> to invite a few in.
            </p>
          </>
        )}
      </article>
    </>
  );
}
