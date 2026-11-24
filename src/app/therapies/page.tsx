import type { Metadata } from "next";
import { listAilments } from "@/db/ailments";
import { getDb } from "@/db/client";
import { listTherapies, type TherapyWithAilments } from "@/db/therapies";
import { canManage, getRole } from "@/lib/role";
import { LinkTherapyForm } from "./LinkTherapyForm";

export const metadata: Metadata = { title: "Therapies" };
export const dynamic = "force-dynamic";

interface PageData {
  therapies: TherapyWithAilments[];
  ailments: { id: number; name: string; agentName: string }[];
}

function loadPage(): PageData | null {
  try {
    const db = getDb();
    return {
      therapies: listTherapies(db),
      ailments: listAilments(db).map(({ id, name, agentName }) => ({ id, name, agentName })),
    };
  } catch (error) {
    console.warn("AgentClinic: therapies unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

export default async function TherapiesPage() {
  const role = await getRole();
  const data = loadPage();

  return (
    <>
      <hgroup>
        <h1>Therapies</h1>
        <p>Treatments matched to what ails an agent.</p>
      </hgroup>

      {data === null ? (
        <p>
          The clinic records are missing. Run <code>npm run db:migrate</code> and <code>npm run db:seed</code>.
        </p>
      ) : (
        <>
          {data.therapies.length === 0 ? (
            <p>
              The therapy menu is empty. Run <code>npm run db:seed</code> to stock it.
            </p>
          ) : (
            <div className="overflow-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Therapy</th>
                    <th scope="col">Length</th>
                    <th scope="col">Treats</th>
                  </tr>
                </thead>
                <tbody>
                  {data.therapies.map((therapy) => (
                    <tr key={therapy.id}>
                      <td>
                        {therapy.name}
                        <br />
                        <small>{therapy.description}</small>
                      </td>
                      <td>{therapy.durationMinutes} min</td>
                      <td>
                        {therapy.ailments.length === 0 ? (
                          <small>Not prescribed yet</small>
                        ) : (
                          therapy.ailments.map((ailment, i) => (
                            <span key={ailment.id}>
                              {i > 0 && ", "}
                              {ailment.name} <small>({ailment.agentName})</small>
                            </span>
                          ))
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {canManage(role) ? (
            <article>
              {data.ailments.length === 0 || data.therapies.length === 0 ? (
                <p>Record an ailment first, then prescribe a therapy for it.</p>
              ) : (
                <LinkTherapyForm ailments={data.ailments} therapies={data.therapies} />
              )}
            </article>
          ) : (
            <p>
              <small>Only clinic staff can prescribe therapies.</small>
            </p>
          )}
        </>
      )}
    </>
  );
}
