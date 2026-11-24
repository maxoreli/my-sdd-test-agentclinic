import { describe, expect, it } from "vitest";
import { renderHtml } from "../../helpers/render";
import { Header } from "@/components/layout/Header";
import { NAV_LINKS } from "@/components/layout/navLinks";

describe("Header", () => {
  const html = renderHtml(<Header role="staff" />);

  it("renders a header element with the Pico container class", () => {
    expect(html).toMatch(/^<header class="container">.*<\/header>$/);
  });

  it("shows the AgentClinic name", () => {
    expect(html).toContain("<strong>AgentClinic</strong>");
  });

  it("has a labelled main navigation", () => {
    expect(html).toContain('<nav class="site-nav" aria-label="Main">');
  });

  it("links to the five clinic pages in order", () => {
    const links = [...html.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, href, label]) => ({
      href,
      label,
    }));
    expect(links).toEqual(NAV_LINKS.map(({ href, label }) => ({ href, label })));
    expect(links.map((l) => l.label)).toEqual(["Dashboard", "Agents", "Ailments", "Therapies", "Appointments"]);
  });

  it("offers to switch to the agent view for staff", () => {
    expect(html).toContain("Viewing as staff");
    expect(html).toContain('<input type="hidden" name="role" value="agent"/>');
    expect(html).toContain("Switch to agent view");
  });

  it("offers to switch to the staff view for agents", () => {
    const agentHtml = renderHtml(<Header role="agent" />);
    expect(agentHtml).toContain("Viewing as agent");
    expect(agentHtml).toContain('<input type="hidden" name="role" value="staff"/>');
    expect(agentHtml).toContain("Switch to staff view");
  });
});
