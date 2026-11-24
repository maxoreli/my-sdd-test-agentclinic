import type { ReactNode } from "react";

/**
 * A labelled form control with an optional hint and error, linked through
 * aria-describedby. Label, control, and helper are siblings, so the hint is
 * the control's description rather than part of its name. Pico styles
 * `aria-invalid` and the <small> helper text that follows a control.
 */
export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; name: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}) {
  const helpId = error || hint ? `${id}-help` : undefined;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        name: id,
        ...(error ? { "aria-invalid": true as const } : {}),
        ...(helpId ? { "aria-describedby": helpId } : {}),
      })}
      {helpId && <small id={helpId}>{error ?? hint}</small>}
    </div>
  );
}

/** The form-level message: success, or a summary of what went wrong. */
export function FormMessage({ ok, message }: { ok: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p role={ok ? "status" : "alert"} className={ok ? "form-success" : "form-error"}>
      {message}
    </p>
  );
}
