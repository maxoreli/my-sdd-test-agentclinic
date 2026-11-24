import { describe, expect, it } from "vitest";
import { z } from "zod";
import { formValues, parseForm, sqliteErrorCode } from "@/lib/forms";

const formData = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

describe("formValues", () => {
  it("keeps text fields and drops Next.js action fields", () => {
    const data = formData({ name: "Ada", $ACTION_ID_abc: "" });
    expect(formValues(data)).toEqual({ name: "Ada" });
  });
});

describe("parseForm", () => {
  const schema = z.object({ name: z.string().trim().min(1, "Name, please.") });

  it("returns parsed data when valid", () => {
    expect(parseForm(schema, formData({ name: "  Ada  " }))).toEqual({ success: true, data: { name: "Ada" } });
  });

  it("returns the first error per field and the typed values when invalid", () => {
    const result = parseForm(schema, formData({ name: "   " }));
    expect(result).toEqual({
      success: false,
      state: {
        ok: false,
        message: "Please fix the highlighted fields.",
        errors: { name: "Name, please." },
        values: { name: "   " },
      },
    });
  });
});

describe("sqliteErrorCode", () => {
  it("reads the code from the error or its cause", () => {
    expect(sqliteErrorCode({ code: "SQLITE_CONSTRAINT_UNIQUE" })).toBe("SQLITE_CONSTRAINT_UNIQUE");
    expect(sqliteErrorCode({ cause: { code: "SQLITE_CONSTRAINT_FOREIGNKEY" } })).toBe("SQLITE_CONSTRAINT_FOREIGNKEY");
  });

  it("returns undefined for anything else", () => {
    expect(sqliteErrorCode(new Error("boom"))).toBeUndefined();
    expect(sqliteErrorCode("boom")).toBeUndefined();
    expect(sqliteErrorCode(null)).toBeUndefined();
  });
});
