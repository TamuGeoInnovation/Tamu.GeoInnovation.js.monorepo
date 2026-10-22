import { expect, test } from '@playwright/test';

/**
 * Every speaker card on Presenters is the same size (#2093).
 *
 * The card had a fixed width but grew with its text, so an affiliation that wrapped onto a second line,
 * such as "Texas A&M Department of Geography", made that card taller than its neighbours and the rows
 * looked ragged: production's 58 cards came in three heights.
 *
 * The suite runs without an API, so the page is given its season and presenters here. Without the season
 * the page never asks for presenters: with no API, the season request gets the site's own HTML back, which
 * is an error rather than "no season". The presenters are chosen for the lengths that made the sizes
 * differ: a short name and affiliation, a long name, an affiliation long enough to wrap twice, and none.
 */
const SEASON = { guid: 'season-2026', year: 2026, active: true, days: [], firstEventTime: null };

const PRESENTERS = [
  { guid: 'p1', firstName: 'Ana', lastName: 'Diaz', organization: { name: 'UP42' } },
  { guid: 'p2', firstName: 'Maximiliano Alejandro', lastName: 'Fitzgerald-Hollingsworth', organization: { name: 'ConocoPhillips' } },
  { guid: 'p3', firstName: 'Bo', lastName: 'Li', organization: { name: 'Texas A&M Department of Rangeland, Wildlife and Fisheries Management' } },
  { guid: 'p4', firstName: 'Kai', lastName: 'Ng', organization: null }
];

test('the speaker cards on Presenters are all the same size', async ({ page }) => {
  await page.route('**/seasons/active', (route) => route.fulfill({ json: SEASON }));
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

/**
 * A name keeps the bottoms of g, j, p and y (#2103). The name is cut off at its line box so a long one can
 * end in an ellipsis, and with a line height of 1 that cut through every descender.
 */
test('speaker names leave room below the line for g, j, p and y', async ({ page }) => {
  await page.route('**/seasons/active', (route) => route.fulfill({ json: SEASON }));
  await page.route('**/speakers/participating', (route) =>
    route.fulfill({ json: [{ guid: 'g1', firstName: 'Xiaojing', lastName: 'Tang', organization: { name: 'Geography' } }] })
  );
  await page.goto('/presenters', { waitUntil: 'domcontentloaded' });

  const name = page.locator('tamu-gisc-speaker-card .name');
  await expect(name).toHaveText('Xiaojing Tang', { timeout: 15_000 });

  const ratio = await name.evaluate((el) => {
    const style = getComputedStyle(el);
    return parseFloat(style.lineHeight) / parseFloat(style.fontSize);
  });

  expect(ratio, 'line height as a multiple of the font size').toBeGreaterThanOrEqual(1.2);
});
