import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, expectTapTargets, formAlert, formStatus, uniqueName, useRole } from "./helpers";

test.describe("agents", () => {
  test("staff check in a new agent, who shows up on the list and dashboard", async ({ page }) => {
    const name = uniqueName("Eager Eddie");
    await page.goto("/agents");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Model").fill("Playwright-1");
    await page.getByRole("button", { name: "Check in agent" }).click();

    await expect(formStatus(page)).toHaveText(`${name} is checked in. Make yourself comfortable!`);
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue("");

    await page.goto("/");
    await expect(page.getByRole("article").filter({ hasText: "waiting room" }).getByText(name)).toBeVisible();
  });

  test("a duplicate name shows an error and keeps what was typed", async ({ page }) => {
    await page.goto("/agents");
    await page.getByLabel("Name").fill("Captain Context");
    await page.getByLabel("Model").fill("Copycat-2");
    await page.getByRole("button", { name: "Check in agent" }).click();

    await expect(formAlert(page)).toHaveText("Please fix the highlighted fields.");
    await expect(page.getByText("Captain Context is already checked in. Try a different name.")).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Name")).toHaveValue("Captain Context");
    await expect(page.getByLabel("Model")).toHaveValue("Copycat-2");
  });

  test("empty fields show friendly errors", async ({ page }) => {
    await page.goto("/agents");
    await page.getByRole("button", { name: "Check in agent" }).click();
    await expect(page.getByText("Every agent needs a name.")).toBeVisible();
    await expect(page.getByText("Which model is this agent running on?")).toBeVisible();
  });

  test("agents see the list but not the add form", async ({ page }) => {
    await page.goto("/agents");
    await useRole(page, "agent");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("button", { name: "Check in agent" })).toHaveCount(0);
    await expect(page.getByText("Only clinic staff can check in new agents.")).toBeVisible();
  });

  test("the page fits the screen and the form is easy to use", async ({ page }) => {
    await page.goto("/agents");
    await expectNoHorizontalScroll(page);
    await expectTapTargets(page.locator("main").getByRole("textbox"));
    await expectTapTargets(page.getByRole("button", { name: "Check in agent" }));
  });
});
