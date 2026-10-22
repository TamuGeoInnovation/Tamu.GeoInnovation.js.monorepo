import { expect, test } from '@playwright/test';

/**
 * Every speaker card on Presenters is the same size (#2093).
 *
 * The card had a fixed width but grew with its text, so an affiliation that wrapped onto a second line,
 * such as "Texas A&M Department of Geography", made that card taller than its neighbours and the rows
 * looked ragged. Presenters has dozens of cards with names and affiliations of every length, which is why
 * it is the page checked.
 */
test('the speaker cards on Presenters are all the same size', async ({ page }) => {
  await page.goto('/presenters', { waitUntil: 'domcontentloaded' });

  const cards = page.locator('tamu-gisc-speaker-card .profile');
  await expect(cards.first()).toBeVisible({ timeout: 15_000 });

  const sizes = await cards.evaluateAll((elements) =>
    elements.map((card) => {
      const box = card.getBoundingClientRect();
      return `${Math.round(box.width)}x${Math.round(box.height)}`;
    })
  );

  expect(sizes.length, 'no speaker cards on Presenters').toBeGreaterThan(1);
  expect([...new Set(sizes)], `${sizes.length} cards, in these sizes`).toHaveLength(1);
});
