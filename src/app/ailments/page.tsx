import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ailments" };

export default function AilmentsPage() {
  return (
    <>
      <hgroup>
        <h1>Ailments</h1>
        <p>What's troubling our agents today.</p>
      </hgroup>
      <p>Coming soon: this wing of the clinic is still being painted.</p>
    </>
  );
}
