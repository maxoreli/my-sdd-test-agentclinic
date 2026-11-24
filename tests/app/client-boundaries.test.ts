import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(name) ? [path] : [];
  });
}

const clientComponents = sourceFiles(join(process.cwd(), "src")).filter((path) =>
  /^\s*["']use client["']/.test(readFileSync(path, "utf8")),
);

describe("client components", () => {
  it("exist (sanity check)", () => {
    expect(clientComponents.length).toBeGreaterThan(0);
  });

  it.each(clientComponents.map((path) => [path.replace(process.cwd() + "/", "")]))(
    "%s does not import server-only database code",
    (path) => {
      const source = readFileSync(join(process.cwd(), path), "utf8");
      expect(source).not.toMatch(/from ["']@\/db\//);
      expect(source).not.toMatch(/from ["'](better-sqlite3|drizzle-orm)/);
    },
  );
});
