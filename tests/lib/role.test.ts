import { describe, expect, it, vi } from "vitest";

const cookieStore = { get: vi.fn() };
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));

const { canManage, getRole, otherRole, parseRole, ROLE_COOKIE } = await import("@/lib/role");

describe("parseRole", () => {
  it("reads the agent role", () => {
    expect(parseRole("agent")).toBe("agent");
  });

  it.each([["staff"], [undefined], [null], [""], ["admin"], ["AGENT"]])(
    "defaults %j to staff",
    (value) => {
      expect(parseRole(value)).toBe("staff");
    },
  );
});

describe("canManage", () => {
  it("lets staff manage the clinic", () => {
    expect(canManage("staff")).toBe(true);
  });

  it("does not let agents manage the clinic", () => {
    expect(canManage("agent")).toBe(false);
  });
});

describe("otherRole", () => {
  it("swaps staff and agent", () => {
    expect(otherRole("staff")).toBe("agent");
    expect(otherRole("agent")).toBe("staff");
  });
});

describe("getRole", () => {
  it("reads the role cookie", async () => {
    cookieStore.get.mockReturnValue({ value: "agent" });
    expect(await getRole()).toBe("agent");
    expect(cookieStore.get).toHaveBeenCalledWith(ROLE_COOKIE);
  });

  it("defaults to staff with no cookie", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect(await getRole()).toBe("staff");
  });
});
