import { expect, test } from '@playwright/test';

/**
 * Every speaker card on Presenters is the same size (#2093).
 *
 * The card had a fixed width but grew with its text, so an affiliation that wrapped onto a second line,
 * such as "Texas A&M Department of Geography", made that card taller than its neighbours and the rows
 * looked ragged: production's 58 cards came in three heights.
 *
 * The suite runs without an API, so the page is given its presenters here, chosen for the lengths that
 * made the sizes differ: a short name and affiliation, a long name, an affiliation long enough to wrap
 * twice, and none at all.
 */
const PRESENTERS = [
  { guid: 'p1', firstName: 'Ana', lastName: 'Diaz', organization: { name: 'UP42' } },
  { guid: 'p2', firstName: 'Maximiliano Alejandro', lastName: 'Fitzgerald-Hollingsworth', organization: { name: 'ConocoPhillips' } },
  { guid: 'p3', firstName: 'Bo', lastName: 'Li', organization: { name: 'Texas A&M Department of Rangeland, Wildlife and Fisheries Management' } },
  { guid: 'p4', firstName: 'Kai', lastName: 'Ng', organization: null }
];

test('the speaker cards on Presenters are all the same size', async ({ page }) => {
  await page.route('**/speakers/participating', (route) => route.fulfill({ json: PRESENTERS }));
  await page.goto('/presenters', { waitUntil: 'domcontentloaded' });

  const cards = page.locator('tamu-gisc-speaker-card .profile');
  await expect(cards).toHaveCount(PRESENTERS.length, { timeout: 15_000 });

  const sizes = await cards.evaluateAll((elements) =>
    elements.map((card) => {
      const box = card.getBoundingClientRect();
      return `${Math.round(box.width)}x${Math.round(box.height)}`;
    })
  );

  expect([...new Set(sizes)], `${sizes.length} cards, in these sizes`).toHaveLength(1);
});
