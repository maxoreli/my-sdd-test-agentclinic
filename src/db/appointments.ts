// Appointment data access. Server code only: never import this from a client component.
import { asc, count, eq, gte } from "drizzle-orm";
import { sqliteErrorCode } from "@/lib/forms";
import type { Db } from "./client";
import { agents, appointments, therapies, type Appointment } from "./schema";

export interface AppointmentWithNames extends Appointment {
  agentName: string;
  therapyName: string;
  durationMinutes: number;
}

const withNames = {
  id: appointments.id,
  agentId: appointments.agentId,
  therapyId: appointments.therapyId,
  startsAt: appointments.startsAt,
  notes: appointments.notes,
  createdAt: appointments.createdAt,
  agentName: agents.name,
  therapyName: therapies.name,
  durationMinutes: therapies.durationMinutes,
};

function selectWithNames(db: Db) {
  return db
    .select(withNames)
    .from(appointments)
    .innerJoin(agents, eq(appointments.agentId, agents.id))
    .innerJoin(therapies, eq(appointments.therapyId, therapies.id));
}

/**
 * Appointments in start-time order, with agent and therapy names. Pass
 * `upcomingFrom` to keep only those starting at or after that time.
 */
export function listAppointments(db: Db, { upcomingFrom }: { upcomingFrom?: Date } = {}): AppointmentWithNames[] {
  const query = selectWithNames(db);
  return (upcomingFrom ? query.where(gte(appointments.startsAt, upcomingFrom)) : query)
    .orderBy(asc(appointments.startsAt), asc(appointments.id))
    .all();
}

/** How many appointments start at or after `now`. */
export function countUpcoming(db: Db, now: Date): number {
  const [row] = db.select({ value: count() }).from(appointments).where(gte(appointments.startsAt, now)).all();
  return row?.value ?? 0;
}

export interface AppointmentInput {
  agentId: number;
  therapyId: number;
  startsAt: Date;
  notes: string | null;
}

export type CreateAppointmentResult =
  | { status: "created"; appointment: AppointmentWithNames }
  | { status: "double-booked" }
  | { status: "not-found" };

/** Book an appointment, reporting a clash or an unknown agent or therapy instead of throwing. */
export function createAppointment(db: Db, input: AppointmentInput): CreateAppointmentResult {
  try {
    const { id } = db.insert(appointments).values(input).returning({ id: appointments.id }).get();
    const appointment = selectWithNames(db).where(eq(appointments.id, id)).get()!;
    return { status: "created", appointment };
  } catch (error) {
    const code = sqliteErrorCode(error);
    if (code === "SQLITE_CONSTRAINT_UNIQUE") return { status: "double-booked" };
    if (code === "SQLITE_CONSTRAINT_FOREIGNKEY") return { status: "not-found" };
    throw error;
  }
}
