import { z } from "zod";
import { SEVERITIES } from "@/db/schema";

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
