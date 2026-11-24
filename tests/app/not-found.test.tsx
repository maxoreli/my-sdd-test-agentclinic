import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import NotFound, { metadata } from "@/app/not-found";

describe("404 page", () => {
  const html = renderToStaticMarkup(<NotFound />);

  it("explains the page is missing, playfully", () => {
    expect(html).toContain("<h1>This page has wandered off</h1>");
    expect(html).toContain("404");
    expect(metadata.title).toBe("Page not found");
  });

  it("links back to the dashboard", () => {
    expect(html).toContain('<a role="button" href="/">Back to the dashboard</a>');
  });
});
