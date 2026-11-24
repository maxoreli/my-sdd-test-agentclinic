import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, toDateTimeLocal } from "@/lib/format";

const instant = new Date("2026-11-24T23:30:00Z");

describe("format", () => {
  it("formats dates in UTC", () => {
    expect(formatDate(instant)).toBe("24 Nov 2026");
  });

  it("formats date-times in UTC and says so", () => {
    expect(formatDateTime(instant)).toBe("Tue, 24 Nov 2026, 23:30 UTC");
  });

  it("produces a datetime-local value in UTC", () => {
    expect(toDateTimeLocal(instant)).toBe("2026-11-24T23:30");
  });
});
