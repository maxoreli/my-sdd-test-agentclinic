import { describe, expect, it } from "vitest";
import { metadata as rootMetadata } from "@/app/layout";
import { metadata as agents } from "@/app/agents/page";
import { metadata as ailments } from "@/app/ailments/page";
import { metadata as appointments } from "@/app/appointments/page";
import { metadata as notFound } from "@/app/not-found";
import { metadata as therapies } from "@/app/therapies/page";

describe("page titles", () => {
  it("uses the AgentClinic title template, defaulting to AgentClinic on the dashboard", () => {
    expect(rootMetadata.title).toEqual({ default: "AgentClinic", template: "%s · AgentClinic" });
  });

  it.each([
    ["agents", agents, "Agents"],
    ["ailments", ailments, "Ailments"],
    ["therapies", therapies, "Therapies"],
    ["appointments", appointments, "Appointments"],
    ["not found", notFound, "Page not found"],
  ])("gives the %s page its own title", (_page, metadata, title) => {
    expect(metadata.title).toBe(title);
  });
});
