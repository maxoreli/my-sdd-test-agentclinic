"use client";

import { useActionState } from "react";
import { Field, FormMessage } from "@/components/forms/Field";
import { initialFormState } from "@/lib/forms";
import { bookAppointment } from "./actions";

export function BookAppointmentForm({
  agents,
  therapies,
  earliest,
}: {
  agents: { id: number; name: string }[];
  therapies: { id: number; name: string; durationMinutes: number }[];
  /** The earliest bookable time, as a datetime-local value in UTC. */
  earliest: string;
}) {
  const [state, action, pending] = useActionState(bookAppointment, initialFormState);
  const values = state.ok ? {} : (state.values ?? {});

  return (
    <form action={action} aria-labelledby="book-heading" noValidate>
      <h2 id="book-heading">Book an appointment</h2>
      <FormMessage ok={state.ok} message={state.message} />
      <div className="grid">
        <Field id="agentId" label="Agent" error={state.errors?.agentId}>
          {(props) => (
            <select {...props} required defaultValue={values.agentId ?? ""} key={`agent-${values.agentId ?? ""}`}>
              <option value="" disabled>
                Who&apos;s booking?
              </option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="therapyId" label="Therapy" error={state.errors?.therapyId}>
          {(props) => (
            <select {...props} required defaultValue={values.therapyId ?? ""} key={`therapy-${values.therapyId ?? ""}`}>
              <option value="" disabled>
                Choose a therapy…
              </option>
              {therapies.map((therapy) => (
                <option key={therapy.id} value={therapy.id}>
                  {therapy.name} ({therapy.durationMinutes} min)
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Field id="startsAt" label="Start (UTC)" error={state.errors?.startsAt} hint="All clinic times are in UTC.">
        {(props) => <input {...props} type="datetime-local" required min={earliest} defaultValue={values.startsAt} />}
      </Field>
      <Field id="notes" label="Notes (optional)" error={state.errors?.notes}>
        {(props) => <textarea {...props} rows={2} maxLength={300} defaultValue={values.notes} />}
      </Field>
      <button type="submit" aria-busy={pending} disabled={pending}>
        Book appointment
      </button>
    </form>
  );
}
