"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { parseRole, ROLE_COOKIE } from "@/lib/role";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Switch between the staff and agent views. */
export async function switchRole(formData: FormData): Promise<void> {
  const role = parseRole(formData.get("role")?.toString());
  const store = await cookies();
  store.set(ROLE_COOKIE, role, { path: "/", sameSite: "lax", maxAge: ONE_YEAR_SECONDS });
  revalidatePath("/", "layout");
}
