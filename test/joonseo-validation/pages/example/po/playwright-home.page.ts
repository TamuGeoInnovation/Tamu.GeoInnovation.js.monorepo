import { Page, Locator } from '@playwright/test';

/**
 * Example Page Object Model for the Playwright Getting Started page
 * 
 * Page Object Model (POM) is a design pattern that:
 * - Encapsulates page elements and interactions
 * - Makes tests more maintainable
 * - Reduces code duplication
 * - Improves readability
 */
export class PlaywrightHomePage {
  readonly page: Page;
  readonly getStartedLink: Locator;
  readonly searchButton: Locator;
  readonly navigationMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.navigationMenu = page.locator('nav');
  }

  /**
   * Navigate to the Playwright homepage
   */
  async goto() {
    await this.page.goto('https://playwright.dev/');
  }

  /**
   * Click the Get Started link
   */
  async clickGetStarted() {
    await this.getStartedLink.click();
  }

  /**
   * Check if the page has loaded correctly
   */
  async isLoaded() {
    await this.navigationMenu.waitFor({ state: 'visible' });
  }
}
