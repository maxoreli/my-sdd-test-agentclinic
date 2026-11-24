import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Vitest does not render CSS, so check the stylesheet imports in the source.
const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("root layout styles", () => {
  const layout = source("src/app/layout.tsx");

  it("imports the PicoCSS jade theme stylesheet", () => {
    expect(layout).toMatch(/^import "@picocss\/pico\/css\/pico\.jade\.min\.css";$/m);
  });

  it("loads Pico before MainLayout, which brings in the app's overrides", () => {
    const pico = layout.indexOf('import "@picocss/pico/css/pico.jade.min.css"');
    const mainLayout = layout.indexOf('from "@/components/layout/MainLayout"');
    expect(pico).toBeGreaterThanOrEqual(0);
    expect(pico).toBeLessThan(mainLayout);
    expect(source("src/components/layout/MainLayout.tsx")).toContain('import "./layout.css";');
  });
});
