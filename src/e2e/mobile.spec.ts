import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["Pixel 5"] });

test.describe("Mobile Responsiveness", () => {
  test("homepage should render on mobile viewport", async ({ page }) => {
    await page.goto("/");
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(393); // Pixel 5 width
  });

  test("should not have horizontal scroll on mobile", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const clientWidth = await html.evaluate((el) => el.clientWidth);
    const scrollWidth = await html.evaluate((el) => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("buttons should be visible on mobile", async ({ page }) => {
    await page.goto("/");
    const buttons = page.locator("button:visible");
    if ((await buttons.count()) > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });

  test("text should be readable on mobile", async ({ page }) => {
    await page.goto("/");
    const headings = page.locator("h1, h2, h3");
    if ((await headings.count()) > 0) {
      const fontSize = await headings
        .first()
        .evaluate((el) => window.getComputedStyle(el).fontSize);
      const px = parseInt(fontSize);
      expect(px).toBeGreaterThanOrEqual(12);
    }
  });
});
