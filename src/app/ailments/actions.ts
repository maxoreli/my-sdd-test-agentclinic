"use server";

import { revalidatePath } from "next/cache";
import { createAilment } from "@/db/ailments";
import { getDb } from "@/db/client";
import { formValues, parseForm, type FormState } from "@/lib/forms";
import { ailmentSchema } from "@/lib/validation";

/** Staff and agents record what's ailing an agent. */
export async function recordAilment(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(ailmentSchema, formData);
  if (!parsed.success) return parsed.state;

  const result = createAilment(getDb(), parsed.data);
  if (result.status === "agent-not-found") {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: { agentId: "That agent isn't checked in. Choose one from the list." },
      values: formValues(formData),
    };
  }

  revalidatePath("/ailments");
  revalidatePath("/");
  return { ok: true, message: `Noted: ${result.ailment.name}. Help is on the way.` };
}
