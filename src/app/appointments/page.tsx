import type { Metadata } from "next";
import { listAgents } from "@/db/agents";
import { listAppointments, type AppointmentWithNames } from "@/db/appointments";
import { getDb } from "@/db/client";
import { listTherapies } from "@/db/therapies";
import { formatDateTime, toDateTimeLocal } from "@/lib/format";
import { BookAppointmentForm } from "./BookAppointmentForm";

export const metadata: Metadata = { title: "Appointments" };
export const dynamic = "force-dynamic";

interface PageData {
  appointments: AppointmentWithNames[];
  agents: { id: number; name: string }[];
  therapies: { id: number; name: string; durationMinutes: number }[];
}

function loadPage(now: Date): PageData | null {
  try {
    const db = getDb();
    return {
      appointments: listAppointments(db, { upcomingFrom: now }),
      agents: listAgents(db).map(({ id, name }) => ({ id, name })),
      therapies: listTherapies(db).map(({ id, name, durationMinutes }) => ({ id, name, durationMinutes })),
    };
  } catch (error) {
    console.warn("AgentClinic: appointments unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

function When({ date }: { date: Date }) {
  return <time dateTime={date.toISOString()}>{formatDateTime(date)}</time>;
}

export default function AppointmentsPage() {
  const now = new Date();
  const data = loadPage(now);

  return (
    <>
      <hgroup>
        <h1>Appointments</h1>
        <p>The clinic schedule. All times are in UTC.</p>
      </hgroup>

      {data === null ? (
        <p>
          The clinic records are missing. Run <code>npm run db:migrate</code> and <code>npm run db:seed</code>.
        </p>
      ) : (
        <>
          <section aria-labelledby="schedule-heading">
            <h2 id="schedule-heading">Upcoming</h2>
            {data.appointments.length === 0 ? (
              <p>The couch is free. No appointments coming up.</p>
            ) : (
              <>
                {/* Cards on small screens… */}
                <div className="schedule-cards">
                  {data.appointments.map((appointment) => (
                    <article key={appointment.id}>
                      <header>
                        <strong>
                          <When date={appointment.startsAt} />
                        </strong>
                      </header>
                      <p>
                        {appointment.agentName}: {appointment.therapyName}{" "}
                        <small>({appointment.durationMinutes} min)</small>
                      </p>
                      {appointment.notes && (
                        <p>
                          <small>{appointment.notes}</small>
                        </p>
                      )}
                    </article>
                  ))}
                </div>
                {/* …and a table from 768px up. */}
                <div className="overflow-auto schedule-table">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">When (UTC)</th>
                        <th scope="col">Agent</th>
                        <th scope="col">Therapy</th>
                        <th scope="col">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <When date={appointment.startsAt} />
                          </td>
                          <td>{appointment.agentName}</td>
                          <td>
                            {appointment.therapyName} <small>({appointment.durationMinutes} min)</small>
                          </td>
                          <td>{appointment.notes ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <article>
            {data.agents.length === 0 || data.therapies.length === 0 ? (
              <p>Check in an agent and stock the therapy menu before booking.</p>
            ) : (
              <BookAppointmentForm agents={data.agents} therapies={data.therapies} earliest={toDateTimeLocal(now)} />
            )}
          </article>
        </>
      )}
    </>
  );
}
