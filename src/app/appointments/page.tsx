import type { Metadata } from "next";

export const metadata: Metadata = { title: "Appointments" };

export default function AppointmentsPage() {
  return (
    <>
      <hgroup>
        <h1>Appointments</h1>
        <p>The clinic schedule.</p>
      </hgroup>
      <p>Coming soon: this wing of the clinic is still being painted.</p>
    </>
  );
}
