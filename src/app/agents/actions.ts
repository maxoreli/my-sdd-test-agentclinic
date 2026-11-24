"use server";

import { revalidatePath } from "next/cache";
import { createAgent } from "@/db/agents";
import { getDb } from "@/db/client";
import { parseForm, type FormState } from "@/lib/forms";
import { canManage, getRole } from "@/lib/role";
import { agentSchema } from "@/lib/validation";

/** Staff check a new agent in. */
export async function addAgent(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!canManage(await getRole())) {
    return { ok: false, message: "Only clinic staff can check in new agents. Switch to the staff view to add one." };
  }

  const parsed = parseForm(agentSchema, formData);
  if (!parsed.success) return parsed.state;

  const result = createAgent(getDb(), parsed.data);
  if (result.status === "duplicate-name") {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: { name: `${parsed.data.name} is already checked in. Try a different name.` },
      values: { name: parsed.data.name, model: parsed.data.model },
    };
  }

  revalidatePath("/agents");
  revalidatePath("/");
  return { ok: true, message: `${result.agent.name} is checked in. Make yourself comfortable!` };
}
