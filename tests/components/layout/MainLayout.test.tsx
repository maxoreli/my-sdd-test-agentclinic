import { describe, expect, it } from "vitest";
import { renderHtml } from "../../helpers/render";
import { MainLayout } from "@/components/layout/MainLayout";

describe("MainLayout", () => {
  const html = renderHtml(
    <MainLayout role="staff">
      <p>page content</p>
    </MainLayout>,
  );

  it("renders the header with the AgentClinic name and navigation", () => {
    expect(html).toMatch(/<header class="container"><nav [^>]*>.*AgentClinic.*<\/nav><\/header>/);
  });

  it("renders page content inside main", () => {
    expect(html).toContain('<main class="container"><p>page content</p></main>');
  });

  it("renders the footer line", () => {
    expect(html).toMatch(/<footer class="container">.*Be kind to your agents\..*<\/footer>/);
  });

  it("orders header, main, then footer", () => {
    const header = html.indexOf("<header");
    const main = html.indexOf("<main");
    const footer = html.indexOf("<footer");
    expect(header).toBeLessThan(main);
    expect(main).toBeLessThan(footer);
  });

  it("passes the role to the header", () => {
    const agentHtml = renderHtml(
      <MainLayout role="agent">
        <p>x</p>
      </MainLayout>,
    );
    expect(agentHtml).toContain("Viewing as agent");
  });
});
