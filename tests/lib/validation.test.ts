import { describe, expect, it } from "vitest";
import { agentSchema, ailmentSchema, appointmentSchema, linkSchema, parseUtcDateTimeLocal } from "@/lib/validation";

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

describe("linkSchema", () => {
  it("coerces both ids", () => {
    expect(linkSchema.parse({ ailmentId: "2", therapyId: "5" })).toEqual({ ailmentId: 2, therapyId: 5 });
  });

  it("asks for each missing choice", () => {
    const result = linkSchema.safeParse({ ailmentId: "", therapyId: "x" });
    expect(result.error?.issues.map((i) => i.message)).toEqual(["Choose which ailment to treat.", "Choose a therapy."]);
  });
});

describe("parseUtcDateTimeLocal", () => {
  it.each([
    ["2026-12-01T10:30", "2026-12-01T10:30:00.000Z"],
    ["2026-12-01T10:30:15", "2026-12-01T10:30:15.000Z"],
    [" 2028-02-29T00:00 ", "2028-02-29T00:00:00.000Z"],
  ])("reads %j as UTC", (value, iso) => {
    expect(parseUtcDateTimeLocal(value)?.toISOString()).toBe(iso);
  });

  it.each([["2026-02-31T10:00"], ["2027-02-29T10:00"], ["2026-13-01T10:00"], ["2026-12-01T24:00"], ["2026-12-01"], ["tomorrow"], [""]])(
    "rejects %j",
    (value) => {
      expect(parseUtcDateTimeLocal(value)).toBeNull();
    },
  );
});

describe("appointmentSchema", () => {
  const now = new Date("2026-11-24T12:00:00Z");
  const valid = { agentId: "1", therapyId: "2", startsAt: "2026-11-25T09:00", notes: "" };

  it("parses a future booking, reading the time as UTC", () => {
    expect(appointmentSchema(now).parse(valid)).toEqual({
      agentId: 1,
      therapyId: 2,
      startsAt: new Date("2026-11-25T09:00:00Z"),
      notes: null,
    });
  });

  it("rejects a time in the past, or exactly now", () => {
    for (const startsAt of ["2026-11-24T11:59", "2026-11-24T12:00"]) {
      const result = appointmentSchema(now).safeParse({ ...valid, startsAt });
      expect(result.error?.issues).toEqual([
        expect.objectContaining({ path: ["startsAt"], message: "Pick a time in the future. The clinic can't see anyone yesterday." }),
      ]);
    }
  });

  it.each([
    [{ agentId: "" }, "agentId", "Choose which agent is booking."],
    [{ therapyId: "" }, "therapyId", "Choose a therapy."],
    [{ startsAt: "" }, "startsAt", "Choose a date and time."],
    [{ startsAt: "2026-02-31T10:00" }, "startsAt", "Choose a date and time."],
    [{ notes: "x".repeat(301) }, "notes", "Keep the notes to 300 characters or fewer."],
  ])("rejects %j on %s", (override, field, message) => {
    const result = appointmentSchema(now).safeParse({ ...valid, ...override });
    expect(result.error?.issues).toContainEqual(expect.objectContaining({ path: [field], message }));
  });

  it("asks for a time when it is missing entirely", () => {
    const { startsAt: _omit, ...rest } = valid;
    expect(appointmentSchema(now).safeParse(rest).error?.issues).toContainEqual(
      expect.objectContaining({ path: ["startsAt"], message: "Choose a date and time." }),
    );
  });
});
