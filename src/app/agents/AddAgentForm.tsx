"use client";

import { useActionState } from "react";
import { Field, FormMessage } from "@/components/forms/Field";
import { initialFormState } from "@/lib/forms";
import { addAgent } from "./actions";

export function AddAgentForm() {
  const [state, action, pending] = useActionState(addAgent, initialFormState);
  const values = state.ok ? {} : (state.values ?? {});

  return (
    <form action={action} aria-labelledby="add-agent-heading" noValidate>
      <h2 id="add-agent-heading">Check in a new agent</h2>
      <FormMessage ok={state.ok} message={state.message} />
      <div className="grid">
        <Field id="name" label="Name" error={state.errors?.name}>
          {(props) => (
            <input {...props} type="text" autoComplete="off" maxLength={60} required defaultValue={values.name} />
          )}
        </Field>
        <Field id="model" label="Model" error={state.errors?.model} hint="The model the agent runs on.">
          {(props) => (
            <input {...props} type="text" autoComplete="off" maxLength={60} required defaultValue={values.model} />
          )}
        </Field>
      </div>
      <button type="submit" aria-busy={pending} disabled={pending}>
        Check in agent
      </button>
    </form>
  );
}
