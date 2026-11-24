import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalScroll, formStatus, futureSlot, mainNav, PAGES } from "./helpers";

/**
 * WCAG contrast ratio between an element's text colour and its effective
 * background (the nearest ancestor with a non-transparent background).
 */
async function contrastRatio(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((element) => {
    const parse = (value: string): number[] => {
      const nums = value.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1];
      return [nums[0], nums[1], nums[2], nums[3] ?? 1];
    };
    const blend = ([r, g, b, a]: number[], [br, bg, bb]: number[]) => [
      r * a + br * (1 - a),
      g * a + bg * (1 - a),
      b * a + bb * (1 - a),
    ];
    const background = (el: Element | null): number[] => {
      for (let node = el; node; node = node.parentElement) {
        const colour = parse(getComputedStyle(node).backgroundColor);
        if (colour[3] > 0) return colour[3] === 1 ? colour : blend(colour, background(node.parentElement));
      }
      return [255, 255, 255, 1];
    };
    const luminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const bg = background(element);
    const fg = blend(parse(getComputedStyle(element).color), bg);
    const [light, dark] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
  });
}

test.describe("smoke", () => {
  test("every page loads cleanly and fits the screen", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    for (const { path, heading } of PAGES) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expectNoHorizontalScroll(page);
    }
    expect(errors).toEqual([]);
  });

  test("an appointment can be booked", async ({ page }) => {
    await page.goto("/appointments");
    await page.getByLabel("Agent").selectOption({ label: "Captain Context" });
    await page.getByLabel("Therapy", { exact: true }).selectOption({ index: 1 });
    await page.getByLabel("Start (UTC)").fill(futureSlot());
    await page.getByRole("button", { name: "Book appointment" }).click();
    await expect(formStatus(page)).toContainText("Booked: Captain Context");
  });

  test("an unknown page shows a friendly 404 with a way home", async ({ page }) => {
    const response = await page.goto("/no-such-ward");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page has wandered off");
    await expect(page).toHaveTitle("Page not found · AgentClinic");
    await page.getByRole("button", { name: "Back to the dashboard" }).click();
    await expect(page).toHaveURL("/");
  });

  test("text has enough contrast to read (WCAG AA)", async ({ page }) => {
    await page.goto("/appointments");
    expect(await contrastRatio(page, "main p"), "body text").toBeGreaterThanOrEqual(4.5);
    expect(await contrastRatio(page, "hgroup p"), "muted tagline").toBeGreaterThanOrEqual(4.5);
    expect(await contrastRatio(page, "main small"), "small helper text").toBeGreaterThanOrEqual(4.5);
    expect(await contrastRatio(page, "h1"), "heading").toBeGreaterThanOrEqual(3);
    expect(await contrastRatio(page, "main button[type=submit]"), "primary button").toBeGreaterThanOrEqual(4.5);
    await expect(mainNav(page).getByRole("link").first()).toBeVisible();
    expect(await contrastRatio(page, ".site-nav a"), "nav links").toBeGreaterThanOrEqual(4.5);
  });
});
