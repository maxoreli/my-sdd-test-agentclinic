// Shared by the database schema, validation, and the (client) ailment form,
// so it must not import anything server-only.

export const SEVERITIES = ["mild", "moderate", "severe"] as const;
export type Severity = (typeof SEVERITIES)[number];
