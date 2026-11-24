import { z } from "zod";

const requiredText = (max: number, empty: string, tooLong: string) =>
  z.string().trim().min(1, empty).max(max, tooLong);

export const agentSchema = z.object({
  name: requiredText(60, "Every agent needs a name.", "Keep the name to 60 characters or fewer."),
  model: requiredText(60, "Which model is this agent running on?", "Keep the model to 60 characters or fewer."),
});

export type AgentInput = z.infer<typeof agentSchema>;
