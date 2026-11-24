// Dashboard summaries. Server code only: never import this from a client component.
import { listAgents } from "./agents";
import { countAilments, listAilments, type AilmentWithAgent } from "./ailments";
import { countUpcoming, listAppointments, type AppointmentWithNames } from "./appointments";
import type { Db } from "./client";

/** How many items each panel lists. */
export const PANEL_LIMIT = 3;

export interface DashboardSummary {
  agents: { count: number; names: string[] };
  ailments: { count: number; latest: AilmentWithAgent[] };
  appointments: { count: number; next: AppointmentWithNames[] };
}

export const EMPTY_SUMMARY: DashboardSummary = {
  agents: { count: 0, names: [] },
  ailments: { count: 0, latest: [] },
  appointments: { count: 0, next: [] },
};

/** Everything the dashboard panels show, as of `now`. */
export function getDashboardSummary(db: Db, now: Date): DashboardSummary {
  const agents = listAgents(db);
  return {
    agents: { count: agents.length, names: agents.map((a) => a.name) },
    ailments: { count: countAilments(db), latest: listAilments(db).slice(0, PANEL_LIMIT) },
    appointments: {
      count: countUpcoming(db, now),
      next: listAppointments(db, { upcomingFrom: now }).slice(0, PANEL_LIMIT),
    },
  };
}
