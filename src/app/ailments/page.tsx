import type { Metadata } from "next";
import { listAgents } from "@/db/agents";
import { listAilments, type AilmentWithAgent } from "@/db/ailments";
import { getDb } from "@/db/client";
import { formatDate } from "@/lib/format";
import { RecordAilmentForm } from "./RecordAilmentForm";

export const metadata: Metadata = { title: "Ailments" };
export const dynamic = "force-dynamic";

function loadPage(): { ailments: AilmentWithAgent[]; agents: { id: number; name: string }[] } | null {
  try {
    const db = getDb();
    return { ailments: listAilments(db), agents: listAgents(db).map(({ id, name }) => ({ id, name })) };
  } catch (error) {
    console.warn("AgentClinic: ailments unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

export default function AilmentsPage() {
  const data = loadPage();

  return (
    <>
      <hgroup>
        <h1>Ailments</h1>
        <p>What&apos;s troubling our agents today.</p>
      </hgroup>

      {data === null ? (
        <p>
          The clinic records are missing. Run <code>npm run db:migrate</code> and <code>npm run db:seed</code>.
        </p>
      ) : (
        <>
          {data.ailments.length === 0 ? (
            <p>No ailments recorded. Every agent is feeling suspiciously well.</p>
          ) : (
            <div className="overflow-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Agent</th>
                    <th scope="col">Ailment</th>
                    <th scope="col">Severity</th>
                    <th scope="col">Therapies</th>
                    <th scope="col">Recorded (UTC)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ailments.map((ailment) => (
                    <tr key={ailment.id}>
                      <td>{ailment.agentName}</td>
                      <td>
                        {ailment.name}
                        {ailment.description && (
                          <>
                            <br />
                            <small>{ailment.description}</small>
                          </>
                        )}
                      </td>
                      <td>{ailment.severity}</td>
                      <td>
                        {ailment.therapies.length === 0 ? (
                          <small>None yet</small>
                        ) : (
                          ailment.therapies.map((therapy) => therapy.name).join(", ")
                        )}
                      </td>
                      <td>
                        <time dateTime={ailment.createdAt.toISOString()}>{formatDate(ailment.createdAt)}</time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <article>
            {data.agents.length === 0 ? (
              <p>Check in an agent first, then record what ails them.</p>
            ) : (
              <RecordAilmentForm agents={data.agents} />
            )}
          </article>
        </>
      )}
    </>
  );
}
