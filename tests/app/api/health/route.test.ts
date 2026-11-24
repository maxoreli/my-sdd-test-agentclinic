import { describe, expect, it } from "vitest";
import * as route from "@/app/api/health/route";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns 200 with { status: 'ok' }", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("responds with JSON", () => {
    expect(GET().headers.get("content-type")).toMatch(/^application\/json/);
  });

  it("returns a fresh response on each call", async () => {
    const first = GET();
    const second = GET();
    expect(first).not.toBe(second);
    expect(await first.json()).toEqual(await second.json());
  });

  it("only exposes a GET handler", () => {
    expect(Object.keys(route)).toEqual(["GET"]);
  });
});
