import { getDb } from "@/db/client";
import { listTherapies } from "@/db/therapies";

export const dynamic = "force-dynamic";

/** All therapies, ordered by name, each with its linked ailments (ids, names, and agents). */
export function GET() {
  return Response.json({ therapies: listTherapies(getDb()) });
}
