import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, expectTapTargets, formAlert, formStatus, uniqueName, useRole } from "./helpers";

async function recordAilment(page: import("@playwright/test").Page, name: string) {
  await page.getByLabel("Agent").selectOption({ label: "Hallucinating Hal" });
  await page.getByLabel("Severity").selectOption("moderate");
  await page.getByLabel("Ailment", { exact: true }).fill(name);
  await page.getByLabel("Symptoms (optional)").fill("Sees unicorns in the logs.");
  await page.getByRole("button", { name: "Record ailment" }).click();
  await expect(formStatus(page)).toHaveText(`Noted: ${name}. Help is on the way.`);
  const row = page.getByRole("row").filter({ hasText: name });
  await expect(row).toContainText("Hallucinating Hal");
  await expect(row).toContainText("moderate");
  await expect(row).toContainText("Sees unicorns in the logs.");
}

test.describe("ailments", () => {
  test("staff record an ailment and it appears in the list", async ({ page }) => {
    await page.goto("/ailments");
    await recordAilment(page, uniqueName("Unicorn sightings"));
  });

  test("agents can record an ailment too", async ({ page }) => {
    await page.goto("/ailments");
    await useRole(page, "agent");
    await recordAilment(page, uniqueName("Self-reported glitch"));
  });

  test("empty required fields show friendly errors", async ({ page }) => {
    await page.goto("/ailments");
    await page.getByRole("button", { name: "Record ailment" }).click();
    await expect(formAlert(page)).toHaveText("Please fix the highlighted fields.");
    await expect(page.getByText("Choose which agent is feeling unwell.")).toBeVisible();
    await expect(page.getByText("Choose how severe it is.")).toBeVisible();
    await expect(page.getByText("What's the ailment called?")).toBeVisible();
    await expect(page.getByLabel("Agent")).toHaveAttribute("aria-invalid", "true");
  });

  test("the page fits the screen and the form is easy to use", async ({ page }) => {
    await page.goto("/ailments");
    await expectNoHorizontalScroll(page);
    await expectTapTargets(page.locator("main").locator("select, input:not([type=hidden]), textarea"));
    await expectTapTargets(page.getByRole("button", { name: "Record ailment" }));
  });
});
