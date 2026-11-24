import { z } from "zod";
import { SEVERITIES } from "@/lib/severity";

const requiredText = (max: number, empty: string, tooLong: string) =>
  z.string().trim().min(1, empty).max(max, tooLong);

export const agentSchema = z.object({
  name: requiredText(60, "Every agent needs a name.", "Keep the name to 60 characters or fewer."),
  model: requiredText(60, "Which model is this agent running on?", "Keep the model to 60 characters or fewer."),
});

export type AgentInput = z.infer<typeof agentSchema>;

/** An id chosen from a <select>: a positive whole number. */
const selectedId = (message: string) => z.coerce.number({ error: message }).int(message).positive(message);

/** Optional free text: blank becomes null. */
const optionalText = (max: number, tooLong: string) =>
  z
    .string()
    .trim()
    .max(max, tooLong)
    .optional()
    .transform((value) => value || null);

export const ailmentSchema = z.object({
  agentId: selectedId("Choose which agent is feeling unwell."),
  name: requiredText(80, "What's the ailment called?", "Keep the ailment name to 80 characters or fewer."),
  severity: z.enum(SEVERITIES, { error: "Choose how severe it is." }),
  description: optionalText(500, "Keep the description to 500 characters or fewer."),
});

export type AilmentFormInput = z.infer<typeof ailmentSchema>;

export const linkSchema = z.object({
  ailmentId: selectedId("Choose which ailment to treat."),
  therapyId: selectedId("Choose a therapy."),
});

const DATETIME_LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Read a `datetime-local` value ("2026-12-01T10:30") as a UTC instant. Returns
 * null for anything malformed or impossible, such as 31 February, which
 * `Date` would otherwise quietly roll over into March.
 */
export function parseUtcDateTimeLocal(value: string): Date | null {
  const match = DATETIME_LOCAL.exec(value.trim());
  if (!match) return null;
  const [, year, month, day, hour, minute, second = "00"] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  if (Number.isNaN(date.getTime())) return null;
  const roundTrip = date.toISOString();
  return roundTrip.startsWith(`${year}-${month}-${day}T${hour}:${minute}:${second}`) ? date : null;
}

/** Booking form schema. `now` decides what counts as the future, so tests can fix it. */
export function appointmentSchema(now: Date) {
  return z.object({
    agentId: selectedId("Choose which agent is booking."),
    therapyId: selectedId("Choose a therapy."),
    startsAt: z
      .string({ error: "Choose a date and time." })
      .transform((value, ctx) => {
        const date = parseUtcDateTimeLocal(value);
        if (!date) {
          ctx.addIssue({ code: "custom", message: "Choose a date and time." });
          return z.NEVER;
        }
        return date;
      })
      .refine((date) => date > now, "Pick a time in the future. The clinic can't see anyone yesterday."),
    notes: optionalText(300, "Keep the notes to 300 characters or fewer."),
  });
}
