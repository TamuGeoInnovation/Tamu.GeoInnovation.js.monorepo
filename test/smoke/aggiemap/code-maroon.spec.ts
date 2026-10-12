import { expect, test } from './fixtures';
import { APP_ROOT } from './global-setup';
import { blockAnalytics } from './analytics';
import { developmentSectionsVisible } from './development-only';

/**
 * `/code-maroon` reads the feed and says what it found, rather than that it could not read it (#1304).
 *
 * #1294 reached dev showing "The alert feed could not be read - The Code Maroon feed did not parse as
 * XML". The feed proxy it relied on is nginx's, and dev is IIS: the feed address came back as
 * AggieMap's own page. Nothing in the suite opened the route, so it was found by eye.
 *
 * Where development-only sections are hidden, the overlay must not appear at all.
 */

const VISIBLE = developmentSectionsVisible();

/** The overlay, and the state it settles into once the first read has answered. */
const OVERLAY = '.code-maroon';
const LOADING = 'Checking Code Maroon';

test.describe(`Code Maroon ${VISIBLE ? 'reads its feed here' : 'stays off this environment'}`, () => {
  test(`/code-maroon ${VISIBLE ? 'shows the feed state, not an error' : 'shows no Code Maroon overlay'}`, async ({
    page
  }) => {
    await blockAnalytics(page);

    const response = await page.goto('/code-maroon');

    expect(response?.status(), '/code-maroon did not return 200').toBe(200);
    await expect(page.locator(APP_ROOT)).not.toBeEmpty();

    const overlay = page.locator(OVERLAY);

    if (!VISIBLE) {
      // Long enough for the overlay's first read, had it been allowed one.
      await page.waitForTimeout(5_000);
      await expect(overlay, 'the Code Maroon overlay appeared on an environment that should not have it').toHaveCount(0);

      return;
    }

    await expect(overlay, 'the Code Maroon overlay never appeared').toBeVisible({ timeout: 30_000 });
    await expect(overlay, 'the first read of the feed never answered').not.toContainText(LOADING, { timeout: 30_000 });

    const unreachable = page.locator(`${OVERLAY} .code-maroon-unreachable`);

    expect(
      await unreachable.count(),
      `the overlay says the feed could not be read: ${(await overlay.innerText()).replace(/\s+/g, ' ')}`
    ).toBe(0);

    // Either the normal state or a real alert; both mean the feed was read and parsed.
    await expect(page.locator(`${OVERLAY} .code-maroon-quiet, ${OVERLAY} .code-maroon-alert`).first()).toBeVisible();
  });
});
