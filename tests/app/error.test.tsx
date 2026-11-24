import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ErrorPage from "@/app/error";

describe("error page", () => {
  it("says something went wrong and offers a retry and a way home", () => {
    const html = renderToStaticMarkup(<ErrorPage error={new Error("boom")} reset={vi.fn()} />);
    expect(html).toContain("<h1>Something went wrong</h1>");
    expect(html).toContain('<button type="button">Try again</button>');
    expect(html).toContain('href="/"');
    expect(html).toContain("Back to the dashboard");
  });

  it("shows the error reference when Next.js provides one, but never the raw message", () => {
    const error = Object.assign(new Error("secret internals"), { digest: "abc123" });
    const html = renderToStaticMarkup(<ErrorPage error={error} reset={vi.fn()} />);
    expect(html).toContain("Reference: abc123");
    expect(html).not.toContain("secret internals");
  });
});
