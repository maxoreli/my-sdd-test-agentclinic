"use server";

import { revalidatePath } from "next/cache";
import { createAppointment } from "@/db/appointments";
import { getDb } from "@/db/client";
import { formatDateTime } from "@/lib/format";
import { formValues, parseForm, type FormState } from "@/lib/forms";
import { appointmentSchema } from "@/lib/validation";

/** Staff and agents book an appointment for an agent with a therapy. */
export async function bookAppointment(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(appointmentSchema(new Date()), formData);
  if (!parsed.success) return parsed.state;

  const result = createAppointment(getDb(), parsed.data);
  if (result.status === "double-booked") {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: { startsAt: "That agent already has an appointment at this time. Try another slot." },
      values: formValues(formData),
    };
  }
  if (result.status === "not-found") {
    return {
      ok: false,
      message: "That agent or therapy isn't on file any more. Pick again from the lists.",
      values: formValues(formData),
    };
  }

  const { agentName, therapyName, startsAt } = result.appointment;
  revalidatePath("/appointments");
  revalidatePath("/");
  return { ok: true, message: `Booked: ${agentName} for ${therapyName}, ${formatDateTime(startsAt)}. See you on the couch!` };
}
