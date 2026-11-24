"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client";
import { linkTherapy } from "@/db/therapies";
import { formValues, parseForm, type FormState } from "@/lib/forms";
import { canManage, getRole } from "@/lib/role";
import { linkSchema } from "@/lib/validation";

/** Staff match a therapy to an ailment. */
export async function linkTherapyToAilment(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!canManage(await getRole())) {
    return { ok: false, message: "Only clinic staff can prescribe therapies. Switch to the staff view to link one." };
  }

  const parsed = parseForm(linkSchema, formData);
  if (!parsed.success) return parsed.state;

  const result = linkTherapy(getDb(), parsed.data.ailmentId, parsed.data.therapyId);
  if (result.status === "not-found") {
    return {
      ok: false,
      message: "That ailment or therapy isn't on file any more. Pick again from the lists.",
      values: formValues(formData),
    };
  }
  if (result.status === "already-linked") {
    return { ok: true, message: `${result.therapyName} is already linked to ${result.ailmentName}. Nothing to change.` };
  }

  revalidatePath("/therapies");
  revalidatePath("/ailments");
  return { ok: true, message: `Prescribed: ${result.therapyName} for ${result.ailmentName}.` };
}
