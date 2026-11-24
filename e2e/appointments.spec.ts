import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalScroll, expectTapTargets, formAlert, formStatus, futureSlot, useRole } from "./helpers";

async function fillBooking(page: Page, startsAt: string, notes = "") {
  await page.getByLabel("Agent").selectOption({ label: "Token-Tight Tess" });
  await page.getByLabel("Therapy", { exact: true }).selectOption({ label: "Prompt Detox (30 min)" });
  await page.getByLabel("Start (UTC)").fill(startsAt);
  await page.getByLabel("Notes (optional)").fill(notes);
  await page.getByRole("button", { name: "Book appointment" }).click();
}

/** The visible schedule: cards on small screens, a table from 768px up. */
function schedule(page: Page) {
  return page.locator(".schedule-cards article:visible, .schedule-table tr:visible");
}

test.describe("appointments", () => {
  test("staff book an appointment and it joins the schedule", async ({ page }) => {
    const slot = futureSlot();
    await page.goto("/appointments");
    await fillBooking(page, slot, "First visit, a bit nervous.");
    await expect(formStatus(page)).toContainText("Booked: Token-Tight Tess for Prompt Detox");
    await expect(formStatus(page)).toContainText("UTC. See you on the couch!");
    await expect(schedule(page).filter({ has: page.locator(`time[datetime="${slot}:00.000Z"]`) })).toContainText(
      "First visit, a bit nervous.",
    );
  });

  test("agents can book too", async ({ page }) => {
    await page.goto("/appointments");
    await useRole(page, "agent");
    await fillBooking(page, futureSlot());
    await expect(formStatus(page)).toContainText("Booked: Token-Tight Tess for Prompt Detox");
  });

  test("a time in the past is rejected", async ({ page }) => {
    await page.goto("/appointments");
    await fillBooking(page, "2020-01-01T10:00");
    await expect(formAlert(page)).toHaveText("Please fix the highlighted fields.");
    await expect(page.getByText("Pick a time in the future. The clinic can't see anyone yesterday.")).toBeVisible();
    await expect(page.getByLabel("Start (UTC)")).toHaveValue("2020-01-01T10:00");
  });

  test("double booking the same agent at the same time is rejected", async ({ page }) => {
    const slot = futureSlot();
    await page.goto("/appointments");
    await fillBooking(page, slot);
    await expect(formStatus(page)).toContainText("Booked:");
    await fillBooking(page, slot);
    await expect(page.getByText("That agent already has an appointment at this time. Try another slot.")).toBeVisible();
  });

  test("the schedule is cards on small screens and a table from 768px, without sideways scrolling", async ({ page }) => {
    await page.goto("/appointments");
    const wide = page.viewportSize()!.width >= 768;
    await expect(page.locator(".schedule-cards")).toBeVisible({ visible: !wide });
    await expect(page.locator(".schedule-table")).toBeVisible({ visible: wide });
    await expect(schedule(page).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectTapTargets(page.locator("main").locator("select, input:not([type=hidden]), textarea"));
  });
});
