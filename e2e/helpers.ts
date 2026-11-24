import { expect, type Locator, type Page } from "@playwright/test";

/** The clinic's pages, as linked from the main navigation. */
export const PAGES = [
  { path: "/", link: "Dashboard", heading: /Clinic overview|Welcome back, agent/ },
  { path: "/agents", link: "Agents", heading: "Agents" },
  { path: "/ailments", link: "Ailments", heading: "Ailments" },
  { path: "/therapies", link: "Therapies", heading: "Therapies" },
  { path: "/appointments", link: "Appointments", heading: "Appointments" },
] as const;

/** The page never scrolls sideways. */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, "page scrolls horizontally").toBeLessThanOrEqual(innerWidth);
}

/** Every matched element is a tap target of at least 44×44 CSS pixels. */
export async function expectTapTargets(locator: Locator): Promise<void> {
  const count = await locator.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const box = await locator.nth(i).boundingBox();
    const label = await locator.nth(i).innerText();
    expect(box, `${label} is not visible`).not.toBeNull();
    expect(box!.height, `${label} height`).toBeGreaterThanOrEqual(44);
    expect(box!.width, `${label} width`).toBeGreaterThanOrEqual(44);
  }
}

export function mainNav(page: Page): Locator {
  return page.getByRole("navigation", { name: "Main" });
}

/** Switch the role through the header toggle, if it isn't already set. */
export async function useRole(page: Page, role: "staff" | "agent"): Promise<void> {
  const toggle = mainNav(page).getByRole("button", { name: `Switch to ${role} view` });
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(mainNav(page).getByText(`Viewing as ${role}`)).toBeVisible();
  }
}

/** A name that won't collide with other tests or other browser projects. */
export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

/** The form's success message (scoped to <main>: Next.js adds its own route announcer). */
export function formStatus(page: Page): Locator {
  return page.locator("main").getByRole("status");
}

/** The form's error summary (scoped to <main>: Next.js adds its own route announcer). */
export function formAlert(page: Page): Locator {
  return page.locator("main").getByRole("alert");
}
