import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should load login page", async ({ page }) => {
    await page.goto("/auth/login");
    const pageTitle = await page.title();
    expect(pageTitle).toBeDefined();
  });

  test("should display email input on login page", async ({ page }) => {
    await page.goto("/auth/login");
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test("should display password input on login page", async ({ page }) => {
    await page.goto("/auth/login");
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test("should have submit button on login page", async ({ page }) => {
    await page.goto("/auth/login");
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test("homepage should be accessible", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
