import { expect, Page, test } from '@playwright/test';

import { APP_ROOT } from './routes';
import { asSite } from './site';

/**
 * Every button on a GIS Day site is the site's colour (#2946): blue on txgisday.org, maroon on Texas A&M's.
 *
 * The site sets its button colour once, as `--gisday-action` in `apps/gisday-angular/src/styles.scss`. The
 * global `.button` always read it; the shared form button, `tamu-gisc-button`, had its own blue, so on Texas
 * A&M's site a form's buttons were blue beside maroon ones. The speaker profile page is checked because it is
 * public and its one button is a `tamu-gisc-button`.
 */
const SITES = [
  // No site named: the placeholder is left as it is, which is txgisday.org.
  { site: undefined, name: 'txgisday.org', colour: 'rgb(85, 138, 216)' },
  { site: 'tamu', name: "Texas A&M's site", colour: 'rgb(80, 0, 0)' }
] as const;

/** The site's button colour, as the browser resolves `var(--gisday-action)`. */
function siteActionColour(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.background = 'var(--gisday-action)';
    document.body.appendChild(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  });
}

for (const { site, name, colour } of SITES) {
  test(`the form button on ${name} is the site's button colour`, async ({ page }) => {
    if (site) {
      await asSite(page, site);
    }
    await page.goto('/presenters/edit', { waitUntil: 'domcontentloaded' });
    await expect(page.locator(APP_ROOT)).toBeAttached();

    const button = page.locator('tamu-gisc-button').first();
    await expect(button).toBeVisible({ timeout: 15_000 });

    expect(await siteActionColour(page), `${name}'s --gisday-action`).toBe(colour);
    await expect(button).toHaveCSS('background-color', colour);
  });
}
