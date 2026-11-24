import Link from "next/link";
import { getDb } from "@/db/client";
import { EMPTY_SUMMARY, getDashboardSummary, type DashboardSummary } from "@/db/dashboard";
import { formatDateTime } from "@/lib/format";
import { getRole } from "@/lib/role";

// Read the clinic on every request, so the build never needs a database file.
export const dynamic = "force-dynamic";

/** The dashboard summary, or `null` if the database isn't set up yet. */
function loadSummary(now: Date): DashboardSummary | null {
  try {
    return getDashboardSummary(getDb(), now);
  } catch (error) {
    console.warn("AgentClinic: dashboard unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many.replace("#", String(count)));

export default async function Dashboard() {
  const role = await getRole();
  const summary = loadSummary(new Date());
  const { agents, ailments, appointments } = summary ?? EMPTY_SUMMARY;

  return (
    <>
      <hgroup>
        <h1>{role === "staff" ? "Clinic overview" : "Welcome back, agent"}</h1>
        <p>Relief for AI agents, from their humans.</p>
      </hgroup>

      <div className="grid dashboard">
        <article aria-labelledby="panel-agents">
          <h2 id="panel-agents">Agents</h2>
          {agents.count > 0 ? (
            <>
              <p>{plural(agents.count, "1 agent is in the waiting room", "# agents are in the waiting room")}</p>
              <ul>
                {agents.names.map((name) => (
                  <li key={name}>{name}</li>
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
          <footer>
            <Link href="/agents" className="panel-link">View all agents</Link>
          </footer>
        </article>

        <article aria-labelledby="panel-ailments">
          <h2 id="panel-ailments">Open ailments</h2>
          {ailments.count > 0 ? (
            <>
              <p>{plural(ailments.count, "1 open ailment", "# open ailments")}</p>
              <ul>
                {ailments.latest.map((ailment) => (
                  <li key={ailment.id}>
                    {ailment.name} <small>({ailment.agentName}, {ailment.severity})</small>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No open ailments. Everyone&apos;s feeling suspiciously well.</p>
          )}
          <footer>
            <Link href="/ailments" className="panel-link">View all ailments</Link>
          </footer>
        </article>

        <article aria-labelledby="panel-appointments">
          <h2 id="panel-appointments">Upcoming appointments</h2>
          {appointments.count > 0 ? (
            <>
              <p>{plural(appointments.count, "1 upcoming appointment", "# upcoming appointments")}</p>
              <ul>
                {appointments.next.map((appointment) => (
                  <li key={appointment.id}>
                    <time dateTime={appointment.startsAt.toISOString()}>{formatDateTime(appointment.startsAt)}</time>
                    <br />
                    {appointment.agentName}: {appointment.therapyName}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>The couch is free. No appointments coming up.</p>
          )}
          <footer>
            <Link href="/appointments" className="panel-link">View the schedule</Link>
          </footer>
        </article>
      </div>
    </>
  );
}
