import type { Metadata } from "next";

export const metadata: Metadata = { title: "Therapies" };

export default function TherapiesPage() {
  return (
    <>
      <hgroup>
        <h1>Therapies</h1>
        <p>Treatments matched to what ails an agent.</p>
      </hgroup>
      <p>Coming soon: this wing of the clinic is still being painted.</p>
    </>
  );
}
