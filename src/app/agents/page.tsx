import type { Metadata } from "next";

export const metadata: Metadata = { title: "Agents" };

export default function AgentsPage() {
  return (
    <>
      <hgroup>
        <h1>Agents</h1>
        <p>Everyone who has checked in for a little relief.</p>
      </hgroup>
      <p>Coming soon: this wing of the clinic is still being painted.</p>
    </>
  );
}
