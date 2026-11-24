import { listAgents } from "@/db/agents";
import { getDb } from "@/db/client";
import type { Agent } from "@/db/schema";
import { getRole } from "@/lib/role";

// Read the clinic on every request, so the build never needs a database file.
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

export default async function Dashboard() {
  const role = await getRole();
  const agents = loadWaitingRoom();

  return (
    <>
      <hgroup>
        <h1>{role === "staff" ? "Clinic overview" : "Welcome back, agent"}</h1>
        <p>Relief for AI agents, from their humans.</p>
      </hgroup>

      <div className="grid">
        <article aria-labelledby="panel-agents">
          <h2 id="panel-agents">Agents</h2>
          {agents && agents.length > 0 ? (
            <>
              <p>{waitingRoomLine(agents.length)}</p>
              <ul>
                {agents.map((agent) => (
                  <li key={agent.id}>{agent.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p>The waiting room is empty.</p>
              <p>
                No agents have checked in yet. Run <code>npm run db:migrate</code> and{" "}
                <code>npm run db:seed</code> to invite a few in.
              </p>
            </>
          )}
        </article>

        <article aria-labelledby="panel-ailments">
          <h2 id="panel-ailments">Open ailments</h2>
          <p>Coming soon: a tally of what&apos;s troubling our agents.</p>
        </article>

        <article aria-labelledby="panel-appointments">
          <h2 id="panel-appointments">Upcoming appointments</h2>
          <p>Coming soon: who&apos;s next on the couch.</p>
        </article>
      </div>
    </>
  );
}
