import type { Metadata } from "next";
import { listAgents } from "@/db/agents";
import { getDb } from "@/db/client";
import type { Agent } from "@/db/schema";
import { formatDate } from "@/lib/format";
import { canManage, getRole } from "@/lib/role";
import { AddAgentForm } from "./AddAgentForm";

export const metadata: Metadata = { title: "Agents" };
export const dynamic = "force-dynamic";

function loadAgents(): Agent[] | null {
  try {
    return listAgents(getDb());
  } catch (error) {
    console.warn("AgentClinic: agents unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

export default async function AgentsPage() {
  const role = await getRole();
  const agents = loadAgents();

  return (
    <>
      <hgroup>
        <h1>Agents</h1>
        <p>Everyone who has checked in for a little relief.</p>
      </hgroup>

      {agents === null ? (
        <p>
          The clinic records are missing. Run <code>npm run db:migrate</code> and <code>npm run db:seed</code>.
        </p>
      ) : agents.length === 0 ? (
        <p>No agents yet. The waiting room is suspiciously quiet.</p>
      ) : (
        <div className="overflow-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Model</th>
                <th scope="col">Joined (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>{agent.name}</td>
                  <td>{agent.model}</td>
                  <td>
                    <time dateTime={agent.createdAt.toISOString()}>{formatDate(agent.createdAt)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canManage(role) ? (
        <article>
          <AddAgentForm />
        </article>
      ) : (
        <p>
          <small>Only clinic staff can check in new agents.</small>
        </p>
      )}
    </>
  );
}
