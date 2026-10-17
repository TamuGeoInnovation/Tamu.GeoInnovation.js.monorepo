import { expect, test } from '@playwright/test';

/**
 * A filled and an outlined button side by side are the same height (#1831).
 *
 * The outlined variants (`.secondary`, `.tertiary`) carry a border that the filled one did not, so
 * every outlined button stood about 4 px taller than its neighbour. The sponsor page has two such
 * pairs, which is why it is the page checked.
 */
test('the button pairs on the sponsor page are the same height', async ({ page }) => {
  await page.goto('/sponsors/tamu', { waitUntil: 'domcontentloaded' });

  const rows = page.locator('.cta-links');
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });

  const heights = await rows.evaluateAll((elements) =>
    elements.map((row) => [...row.querySelectorAll('a.button')].map((a) => Math.round(a.getBoundingClientRect().height)))
  );

  const pairs = heights.filter((row) => row.length > 1);
  expect(pairs.length, `no row with two buttons; rows found: ${JSON.stringify(heights)}`).toBeGreaterThan(0);

  for (const row of pairs) {
    expect(new Set(row).size, `button heights in one row differ: ${JSON.stringify(row)}`).toBe(1);
  }
});
