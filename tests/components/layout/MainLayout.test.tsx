import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MainLayout } from "@/components/layout/MainLayout";

describe("MainLayout", () => {
  const html = renderToStaticMarkup(
    <MainLayout>
      <p>page content</p>
    </MainLayout>,
  );

  it("renders the header with the AgentClinic name", () => {
    expect(html).toMatch(/<header class="site-header">.*AgentClinic.*<\/header>/);
  });

  it("renders page content inside main", () => {
    expect(html).toContain('<main class="site-main"><p>page content</p></main>');
  });

  it("renders the footer line", () => {
    expect(html).toMatch(/<footer class="site-footer">.*Be kind to your agents\..*<\/footer>/);
  });

  it("orders header, main, then footer", () => {
    const header = html.indexOf("<header");
    const main = html.indexOf("<main");
    const footer = html.indexOf("<footer");
    expect(header).toBeLessThan(main);
    expect(main).toBeLessThan(footer);
  });

  it("has no navigation or links", () => {
    expect(html).not.toContain("<nav");
    expect(html).not.toContain("<a ");
  });
});
