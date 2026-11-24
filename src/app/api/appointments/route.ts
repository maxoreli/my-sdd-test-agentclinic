import { listAppointments } from "@/db/appointments";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

/** Appointments in start-time order. `?upcoming=1` keeps only those starting from now on. */
export function GET(request: Request) {
  const upcoming = new URL(request.url).searchParams.get("upcoming");
  const upcomingOnly = upcoming === "1" || upcoming === "true";
  return Response.json({
    appointments: listAppointments(getDb(), upcomingOnly ? { upcomingFrom: new Date() } : {}),
  });
}
