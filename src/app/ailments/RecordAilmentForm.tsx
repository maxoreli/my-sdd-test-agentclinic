"use client";

import { useActionState } from "react";
import { Field, FormMessage } from "@/components/forms/Field";
import { SEVERITIES } from "@/lib/severity";
import { initialFormState } from "@/lib/forms";
import { recordAilment } from "./actions";

export function RecordAilmentForm({ agents }: { agents: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(recordAilment, initialFormState);
  const values = state.ok ? {} : (state.values ?? {});

  return (
    <form action={action} aria-labelledby="record-ailment-heading" noValidate>
      <h2 id="record-ailment-heading">Record an ailment</h2>
      <FormMessage ok={state.ok} message={state.message} />
      <div className="grid">
        <Field id="agentId" label="Agent" error={state.errors?.agentId}>
          {(props) => (
            <select {...props} required defaultValue={values.agentId ?? ""} key={`agent-${values.agentId ?? ""}`}>
              <option value="" disabled>
                Choose an agent…
              </option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="severity" label="Severity" error={state.errors?.severity}>
          {(props) => (
            <select {...props} required defaultValue={values.severity ?? ""} key={`severity-${values.severity ?? ""}`}>
              <option value="" disabled>
                How bad is it?
              </option>
              {SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {severity[0].toUpperCase() + severity.slice(1)}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Field id="name" label="Ailment" error={state.errors?.name} hint="For example: “Prompt fatigue”.">
        {(props) => <input {...props} type="text" autoComplete="off" maxLength={80} required defaultValue={values.name} />}
      </Field>
      <Field id="description" label="Symptoms (optional)" error={state.errors?.description}>
        {(props) => <textarea {...props} rows={3} maxLength={500} defaultValue={values.description} />}
      </Field>
      <button type="submit" aria-busy={pending} disabled={pending || agents.length === 0}>
        Record ailment
      </button>
    </form>
  );
}
