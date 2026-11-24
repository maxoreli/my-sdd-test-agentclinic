// Dates and times are stored and shown in UTC (see specs/2026-11-23-mvp/requirements.md).

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "24 Nov 2026" */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** "Tue, 24 Nov 2026, 14:30 UTC" */
export function formatDateTime(date: Date): string {
  return `${dateTimeFormat.format(date)} UTC`;
}

/** The value a `datetime-local` input shows for a UTC instant: "2026-11-24T14:30". */
export function toDateTimeLocal(date: Date): string {
  return date.toISOString().slice(0, 16);
}
