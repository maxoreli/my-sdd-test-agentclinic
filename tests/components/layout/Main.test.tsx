import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Main } from "@/components/layout/Main";

describe("Main", () => {
  it("wraps its children in a main element with the site-main class", () => {
    const html = renderToStaticMarkup(
      <Main>
        <p>hello</p>
      </Main>,
    );
    expect(html).toBe('<main class="site-main"><p>hello</p></main>');
  });

  it("renders multiple children in order", () => {
    const html = renderToStaticMarkup(
      <Main>
        <h1>first</h1>
        <p>second</p>
      </Main>,
    );
    expect(html).toBe('<main class="site-main"><h1>first</h1><p>second</p></main>');
  });

  it("renders an empty main when there are no children", () => {
    const html = renderToStaticMarkup(<Main>{null}</Main>);
    expect(html).toBe('<main class="site-main"></main>');
  });
});
