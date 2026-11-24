import { z } from "zod";

/** What a form's Server Action returns to the page, via useActionState. */
export interface FormState {
  ok: boolean;
  /** A message for the whole form: success, or a problem that isn't about one field. */
  message?: string;
  /** The first error for each invalid field. */
  errors?: Record<string, string>;
  /** What the user typed, so the form can keep it after an error. */
  values?: Record<string, string>;
}

export const initialFormState: FormState = { ok: false };

/** The form's text values, for re-filling the form after an error. */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) {
      values[key] = value;
    }
  }
  return values;
}

export type ParseResult<T> = { success: true; data: T } | { success: false; state: FormState };

/** Validate form data against a zod schema, returning field errors as a FormState. */
export function parseForm<T>(schema: z.ZodType<T>, formData: FormData): ParseResult<T> {
  const values = formValues(formData);
  const result = schema.safeParse(values);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(z.flattenError(result.error).fieldErrors)) {
    const [first] = (messages as string[] | undefined) ?? [];
    if (first) errors[field] = first;
  }
  return {
    success: false,
    state: { ok: false, message: "Please fix the highlighted fields.", errors, values },
  };
}

/** The SQLite error code (e.g. SQLITE_CONSTRAINT_UNIQUE) behind a database error, if any. */
export function sqliteErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const { code, cause } = error as { code?: unknown; cause?: unknown };
  if (typeof code === "string") return code;
  return cause === undefined ? undefined : sqliteErrorCode(cause);
}
