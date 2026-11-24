import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TherapiesPage, { metadata as therapiesMeta } from "@/app/therapies/page";
import AppointmentsPage, { metadata as appointmentsMeta } from "@/app/appointments/page";

describe.each([
  ["Therapies", TherapiesPage, therapiesMeta],
  ["Appointments", AppointmentsPage, appointmentsMeta],
])("%s page", (title, Page, metadata) => {
  it("has a heading and its own title", () => {
    expect(renderToStaticMarkup(<Page />)).toContain(`<h1>${title}</h1>`);
    expect(metadata.title).toBe(title);
  });
});
