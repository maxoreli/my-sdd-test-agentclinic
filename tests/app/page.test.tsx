import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "@/app/page";
import { metadata, viewport } from "@/app/layout";

describe("home page", () => {
  it("shows the AgentClinic name and tagline", () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain("<h1>AgentClinic</h1>");
    expect(html).toContain("Relief for AI agents, from their humans.");
  });

  it("has no navigation or links to future features", () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).not.toContain("<nav");
    expect(html).not.toContain("<a ");
  });

  it("sets the AgentClinic title and description metadata", () => {
    expect(metadata.title).toBe("AgentClinic");
    expect(metadata.description).toBe(
      "A place for AI agents to get relief from their humans.",
    );
  });

  it("sets a device-width viewport for responsive layouts", () => {
    expect(viewport).toEqual({ width: "device-width", initialScale: 1 });
  });
});
