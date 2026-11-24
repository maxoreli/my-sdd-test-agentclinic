import { expect, test, type Page } from "@playwright/test";
import { expectTapTargets, formStatus, futureSlot, uniqueName } from "./helpers";

function panel(page: Page, heading: string) {
  return page.getByRole("article", { name: heading });
}

/** The number at the start of a panel's summary line, e.g. "5 open ailments" → 5. */
async function panelCount(page: Page, heading: string): Promise<number> {
  const text = await panel(page, heading).locator("p").first().innerText();
  const match = /^(\d+)/.exec(text);
  return match ? Number(match[1]) : 0;
}

test.describe("dashboard data", () => {
  test("counts match the clinic's records", async ({ page, request }) => {
    const [agents, ailments, upcoming] = await Promise.all([
      request.get("/api/agents").then((r) => r.json()),
      request.get("/api/ailments").then((r) => r.json()),
      request.get("/api/appointments?upcoming=1").then((r) => r.json()),
    ]);
    await page.goto("/");
    expect(await panelCount(page, "Agents")).toBe(agents.agents.length);
    expect(await panelCount(page, "Open ailments")).toBe(ailments.ailments.length);
    expect(await panelCount(page, "Upcoming appointments")).toBe(upcoming.appointments.length);
    await expect(panel(page, "Open ailments").getByRole("listitem")).toHaveCount(Math.min(3, ailments.ailments.length));
  });

  test("new agents, ailments, and appointments show up on the dashboard", async ({ page }) => {
    await page.goto("/");
    const before = {
      agents: await panelCount(page, "Agents"),
      ailments: await panelCount(page, "Open ailments"),
      appointments: await panelCount(page, "Upcoming appointments"),
    };

    const agent = uniqueName("Dashboard Dot");
    await page.goto("/agents");
    await page.getByLabel("Name").fill(agent);
    await page.getByLabel("Model").fill("Glance-3");
    await page.getByRole("button", { name: "Check in agent" }).click();
    await expect(formStatus(page)).toContainText(agent);

    const ailment = uniqueName("Status page dread");
    await page.goto("/ailments");
    await page.getByLabel("Agent").selectOption({ label: agent });
    await page.getByLabel("Severity").selectOption("severe");
    await page.getByLabel("Ailment", { exact: true }).fill(ailment);
    await page.getByRole("button", { name: "Record ailment" }).click();
    await expect(formStatus(page)).toContainText(ailment);

    await page.goto("/appointments");
    await page.getByLabel("Agent").selectOption({ label: agent });
    await page.getByLabel("Therapy", { exact: true }).selectOption({ index: 1 });
    await page.getByLabel("Start (UTC)").fill(futureSlot());
    await page.getByRole("button", { name: "Book appointment" }).click();
    await expect(formStatus(page)).toContainText("Booked:");

    await page.goto("/");
    expect(await panelCount(page, "Agents")).toBe(before.agents + 1);
    expect(await panelCount(page, "Open ailments")).toBe(before.ailments + 1);
    expect(await panelCount(page, "Upcoming appointments")).toBe(before.appointments + 1);
    await expect(panel(page, "Agents")).toContainText(agent);
    await expect(panel(page, "Open ailments")).toContainText(ailment);
  });

  test("each panel links to its page with an easy-to-tap link", async ({ page }) => {
    await page.goto("/");
    const links = page.locator(".panel-link");
    await expectTapTargets(links);
    await links.filter({ hasText: "View the schedule" }).click();
    await expect(page).toHaveURL("/appointments");
  });
});
