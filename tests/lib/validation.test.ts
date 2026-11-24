import { describe, expect, it } from "vitest";
import { agentSchema, ailmentSchema } from "@/lib/validation";

describe("agentSchema", () => {
  it("accepts and trims a name and model", () => {
    expect(agentSchema.parse({ name: "  Ada  ", model: " Babbage-2 " })).toEqual({ name: "Ada", model: "Babbage-2" });
  });

  it.each([
    [{ name: "", model: "m" }, "name"],
    [{ name: "   ", model: "m" }, "name"],
    [{ name: "x".repeat(61), model: "m" }, "name"],
    [{ name: "Ada", model: "" }, "model"],
    [{ name: "Ada", model: "x".repeat(61) }, "model"],
    [{ model: "m" }, "name"],
  ])("rejects %j on %s", (input, field) => {
    const result = agentSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0])).toContain(field);
  });

  it("allows exactly 60 characters", () => {
    expect(agentSchema.safeParse({ name: "x".repeat(60), model: "y".repeat(60) }).success).toBe(true);
  });
});

describe("ailmentSchema", () => {
  const valid = { agentId: "3", name: " Prompt fatigue ", severity: "mild", description: "  " };

  it("coerces the agent id, trims text, and turns a blank description into null", () => {
    expect(ailmentSchema.parse(valid)).toEqual({ agentId: 3, name: "Prompt fatigue", severity: "mild", description: null });
  });

  it("keeps a description", () => {
    expect(ailmentSchema.parse({ ...valid, description: " Tired " }).description).toBe("Tired");
  });

  it.each([
    [{ agentId: "" }, "agentId", "Choose which agent is feeling unwell."],
    [{ agentId: "abc" }, "agentId", "Choose which agent is feeling unwell."],
    [{ agentId: "-1" }, "agentId", "Choose which agent is feeling unwell."],
    [{ agentId: "1.5" }, "agentId", "Choose which agent is feeling unwell."],
    [{ name: "" }, "name", "What's the ailment called?"],
    [{ name: "x".repeat(81) }, "name", "Keep the ailment name to 80 characters or fewer."],
    [{ severity: "" }, "severity", "Choose how severe it is."],
    [{ severity: "catastrophic" }, "severity", "Choose how severe it is."],
    [{ description: "x".repeat(501) }, "description", "Keep the description to 500 characters or fewer."],
  ])("rejects %j on %s", (override, field, message) => {
    const result = ailmentSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(expect.objectContaining({ path: [field], message }));
  });
});
