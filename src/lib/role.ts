import { cookies } from "next/headers";

/** Who is using the clinic. Not security: anyone can switch. */
export type Role = "staff" | "agent";

export const ROLE_COOKIE = "agentclinic-role";
export const DEFAULT_ROLE: Role = "staff";

/** Read a role from a cookie or form value; anything unknown means staff. */
export function parseRole(value: string | null | undefined): Role {
  return value === "agent" ? "agent" : DEFAULT_ROLE;
}

/** Staff can add agents and link therapies; agents cannot. */
export function canManage(role: Role): boolean {
  return role === "staff";
}

export function otherRole(role: Role): Role {
  return role === "staff" ? "agent" : "staff";
}

/** The current request's role, from the role cookie. Server code only. */
export async function getRole(): Promise<Role> {
  const store = await cookies();
  return parseRole(store.get(ROLE_COOKIE)?.value);
}
