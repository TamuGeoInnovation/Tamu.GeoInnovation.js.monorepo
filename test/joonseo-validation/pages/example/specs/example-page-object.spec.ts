import { test, expect } from "@playwright/test";
import { PlaywrightHomePage } from "../po/playwright-home.page";

/**
 * Example test using Page Object Model pattern
 *
 * This demonstrates how to use page objects to make tests
 * more maintainable and readable.
 */
test.describe("Example Test with Page Object", () => {
  test("navigate using page object", async ({ page }) => {
    const homePage = new PlaywrightHomePage(page);

    // Navigate to the page
    await homePage.goto();

    // Verify the page loaded
    await homePage.isLoaded();

    // Verify title
    await expect(page).toHaveTitle(/Playwright/);

    // Use page object method to interact
    await homePage.clickGetStarted();

    // Verify navigation succeeded
    await expect(
      page.getByRole("heading", { name: "Installation" })
    ).toBeVisible();
  });
});
