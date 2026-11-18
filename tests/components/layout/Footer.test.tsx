import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  const html = renderToStaticMarkup(<Footer />);

  it("renders a footer element with the site-footer class", () => {
    expect(html).toMatch(/^<footer class="site-footer">.*<\/footer>$/);
  });

  it("shows a short plain line of text", () => {
    expect(html).toContain("<p>Be kind to your agents.</p>");
  });

  it("has no navigation or links", () => {
    expect(html).not.toContain("<nav");
    expect(html).not.toContain("<a ");
  });
});
