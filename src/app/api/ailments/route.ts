import { listAilments } from "@/db/ailments";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

/** All ailments, newest first, with agent names. */
export function GET() {
  return Response.json({ ailments: listAilments(getDb()) });
}
