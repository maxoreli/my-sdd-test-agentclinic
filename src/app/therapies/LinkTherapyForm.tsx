"use client";

import { useActionState } from "react";
import { Field, FormMessage } from "@/components/forms/Field";
import { initialFormState } from "@/lib/forms";
import { linkTherapyToAilment } from "./actions";

export function LinkTherapyForm({
  ailments,
  therapies,
}: {
  ailments: { id: number; name: string; agentName: string }[];
  therapies: { id: number; name: string }[];
}) {
  const [state, action, pending] = useActionState(linkTherapyToAilment, initialFormState);
  const values = state.ok ? {} : (state.values ?? {});

  return (
    <form action={action} aria-labelledby="link-therapy-heading" noValidate>
      <h2 id="link-therapy-heading">Prescribe a therapy</h2>
      <FormMessage ok={state.ok} message={state.message} />
      <div className="grid">
        <Field id="ailmentId" label="Ailment" error={state.errors?.ailmentId}>
          {(props) => (
            <select {...props} required defaultValue={values.ailmentId ?? ""} key={`ailment-${values.ailmentId ?? ""}`}>
              <option value="" disabled>
                Choose an ailment…
              </option>
              {ailments.map((ailment) => (
                <option key={ailment.id} value={ailment.id}>
                  {ailment.name} ({ailment.agentName})
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
                  {therapy.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <button type="submit" aria-busy={pending} disabled={pending}>
        Link therapy
      </button>
    </form>
  );
}
