import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = { set: vi.fn() };
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { revalidatePath } = await import("next/cache");
const { switchRole } = await import("@/app/actions");
const { ROLE_COOKIE } = await import("@/lib/role");

const form = (role: string) => {
  const data = new FormData();
  data.set("role", role);
  return data;
};

describe("switchRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets the role cookie for a year, site-wide", async () => {
    await switchRole(form("agent"));
    expect(cookieStore.set).toHaveBeenCalledWith(ROLE_COOKIE, "agent", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  });

  it("falls back to staff for an unknown role", async () => {
    await switchRole(form("superuser"));
    expect(cookieStore.set).toHaveBeenCalledWith(ROLE_COOKIE, "staff", expect.any(Object));
  });

  it("revalidates every page", async () => {
    await switchRole(form("staff"));
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
