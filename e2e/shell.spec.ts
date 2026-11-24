import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, expectTapTargets, mainNav, PAGES } from "./helpers";

test.describe("dashboard shell", () => {
  test("every nav link loads its page", async ({ page }) => {
    await page.goto("/");
    for (const { path, link, heading } of PAGES) {
      await mainNav(page).getByRole("link", { name: link, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(mainNav(page).getByRole("link", { name: link, exact: true })).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  test("the role toggle switches views and survives a reload", async ({ page }) => {
    await page.goto("/");
    await expect(mainNav(page).getByText("Viewing as staff")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Clinic overview");

    await mainNav(page).getByRole("button", { name: "Switch to agent view" }).click();
    await expect(mainNav(page).getByText("Viewing as agent")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, agent");

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, agent");

    await mainNav(page).getByRole("button", { name: "Switch to staff view" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Clinic overview");
  });

  test("pages fit the screen with easy-to-tap navigation", async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      await expectNoHorizontalScroll(page);
      await expectTapTargets(mainNav(page).getByRole("link"));
      await expectTapTargets(mainNav(page).getByRole("button"));
    }
  });

  test("dashboard panels stack on mobile and sit side by side from 768px", async ({ page }) => {
    await page.goto("/");
    const panels = page.locator(".grid > article");
    await expect(panels).toHaveCount(3);
    const boxes = await Promise.all([0, 1, 2].map(async (i) => (await panels.nth(i).boundingBox())!));
    const width = page.viewportSize()!.width;

    if (width < 768) {
      expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
      expect(boxes[2].y).toBeGreaterThan(boxes[1].y);
      expect(boxes[1].x).toBeCloseTo(boxes[0].x, 0);
    } else {
      expect(boxes[1].y).toBeCloseTo(boxes[0].y, 0);
      expect(boxes[2].y).toBeCloseTo(boxes[0].y, 0);
      expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
    }
  });
});
