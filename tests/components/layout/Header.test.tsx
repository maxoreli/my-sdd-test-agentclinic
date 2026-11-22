import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Header } from "@/components/layout/Header";

describe("Header", () => {
  const html = renderToStaticMarkup(<Header />);

  it("renders a header element with the Pico container class", () => {
    expect(html).toMatch(/^<header class="container">.*<\/header>$/);
  });

  it("shows the AgentClinic name", () => {
    expect(html).toContain('<strong>AgentClinic</strong>');
  });

  it("has no navigation or links", () => {
    expect(html).not.toContain("<nav");
    expect(html).not.toContain("<a ");
  });
});
