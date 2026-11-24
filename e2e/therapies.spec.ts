import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalScroll, formStatus, uniqueName, useRole } from "./helpers";

/** Record a fresh ailment for Captain Context, so links don't clash across test runs. */
async function freshAilment(page: Page): Promise<string> {
  const name = uniqueName("Déjà vu loops");
  await page.goto("/ailments");
  await page.getByLabel("Agent").selectOption({ label: "Captain Context" });
  await page.getByLabel("Severity").selectOption("mild");
  await page.getByLabel("Ailment", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Record ailment" }).click();
  await expect(formStatus(page)).toContainText(name);
  return name;
}

async function link(page: Page, ailment: string, therapy: string) {
  await page.getByLabel("Ailment", { exact: true }).selectOption({ label: `${ailment} (Captain Context)` });
  await page.getByLabel("Therapy", { exact: true }).selectOption({ label: therapy });
  await page.getByRole("button", { name: "Link therapy" }).click();
}

test.describe("therapies", () => {
  test("staff prescribe a therapy, shown on the therapies and ailments pages", async ({ page }) => {
    const ailment = await freshAilment(page);
    await page.goto("/therapies");
    await link(page, ailment, "Prompt Detox");
    await expect(formStatus(page)).toHaveText(`Prescribed: Prompt Detox for ${ailment}.`);
    await expect(page.getByRole("row").filter({ hasText: "Prompt Detox" })).toContainText(ailment);

    await page.goto("/ailments");
    await expect(page.getByRole("row").filter({ hasText: ailment })).toContainText("Prompt Detox");
  });

  test("linking the same pair again says it's already linked", async ({ page }) => {
    const ailment = await freshAilment(page);
    await page.goto("/therapies");
    await link(page, ailment, "Token Budget Counselling");
    await expect(formStatus(page)).toHaveText(`Prescribed: Token Budget Counselling for ${ailment}.`);
    await link(page, ailment, "Token Budget Counselling");
    await expect(formStatus(page)).toHaveText(
      `Token Budget Counselling is already linked to ${ailment}. Nothing to change.`,
    );
  });

  test("agents see the menu but cannot prescribe", async ({ page }) => {
    await page.goto("/therapies");
    await useRole(page, "agent");
    await expect(page.getByRole("table")).toContainText("Hallucination Grounding Session");
    await expect(page.getByRole("button", { name: "Link therapy" })).toHaveCount(0);
    await expect(page.getByText("Only clinic staff can prescribe therapies.")).toBeVisible();
  });

  test("the page fits the screen", async ({ page }) => {
    await page.goto("/therapies");
    await expectNoHorizontalScroll(page);
  });
});
