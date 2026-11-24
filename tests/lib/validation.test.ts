import { describe, expect, it } from "vitest";
import { agentSchema } from "@/lib/validation";

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
