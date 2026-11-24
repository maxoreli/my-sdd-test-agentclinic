import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AgentsPage, { metadata as agentsMeta } from "@/app/agents/page";
import AilmentsPage, { metadata as ailmentsMeta } from "@/app/ailments/page";
import TherapiesPage, { metadata as therapiesMeta } from "@/app/therapies/page";
import AppointmentsPage, { metadata as appointmentsMeta } from "@/app/appointments/page";

describe.each([
  ["Agents", AgentsPage, agentsMeta],
  ["Ailments", AilmentsPage, ailmentsMeta],
  ["Therapies", TherapiesPage, therapiesMeta],
  ["Appointments", AppointmentsPage, appointmentsMeta],
])("%s page", (title, Page, metadata) => {
  it("has a heading and its own title", () => {
    expect(renderToStaticMarkup(<Page />)).toContain(`<h1>${title}</h1>`);
    expect(metadata.title).toBe(title);
  });
});
