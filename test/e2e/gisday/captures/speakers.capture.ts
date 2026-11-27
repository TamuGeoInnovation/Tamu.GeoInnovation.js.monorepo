import { join } from 'path';

import { expect, test } from '@playwright/test';

import { ApiAnswer, capture, captureContext, serveBuild, signInAsAdmin, stubApi } from '../admin-capture';

/**
 * Admin > Speakers with made-up speakers and their sessions' tags, as the lab photographed it for #440 (batch g229), on
 * the shared helper. On a build with the Session tag filter (#440) it is also photographed filtered to Panel.
 * docs/gisday-admin-capture.md says how to run it.
 */
const BUILD = process.env.CAPTURE_BUILD ?? 'dist/apps/gisday-angular';
const OUT = process.env.CAPTURE_OUT ?? 'test-results/captures';

const panel = { guid: 't-panel', name: 'Panel' };
const workshop = { guid: 't-workshop', name: 'Workshop' };
const keynote = { guid: 't-keynote', name: 'Keynote' };
const org = (name: string) => ({ guid: `o-${name}`, name });
const speakers = [
  {
    guid: 'sp-1',
    firstName: 'Ana',
    lastName: 'Ruiz',
    email: 'ana.ruiz@example.edu',
    organization: org('Example University'),
    events: [
      { guid: 'e-1', name: 'Mapping with drones', tags: [workshop] },
      { guid: 'e-2', name: 'Careers in GIS panel', tags: [panel] }
    ]
  },
  {
    guid: 'sp-2',
    firstName: 'Ben',
    lastName: 'Ortiz',
    email: 'ben.ortiz@example.com',
    organization: org('Example Mapping Co.'),
    events: [{ guid: 'e-2', name: 'Careers in GIS panel', tags: [panel] }]
  },
  {
    guid: 'sp-3',
    firstName: 'Cy',
    lastName: 'Lee',
    email: 'cy.lee@example.edu',
    organization: org('Example University'),
    events: [{ guid: 'e-3', name: 'Opening keynote', tags: [keynote] }]
  },
  {
    guid: 'sp-4',
    firstName: 'Di',
    lastName: 'Park',
    email: 'di.park@example.org',
    organization: org('Example County'),
    events: []
  }
];
const season = { guid: 's-2026', year: 2026, active: true };

const answers: Array<ApiAnswer> = [
  { path: /^\/speakers\/sessions\/season\//, json: speakers },
  { path: '/seasons/active', json: season },
  { path: '/seasons', json: [season] }
];

test('Admin > Speakers', async ({ browser }) => {
  const site = await serveBuild(BUILD);
  const context = await captureContext(browser, { width: 1280, height: 860 });
  await signInAsAdmin(context, site.url);
  const calls = await stubApi(context, site.url, answers);
  const page = await context.newPage();

  await page.goto(`${site.url}/admin/speakers`);
  await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 30_000 });
  console.log('wrote', await capture(page, join(OUT, 'speakers'), { schemes: ['light'] }));

  const tags = page.locator('tamu-gisc-select[placeholder="Session tag"] select');
  if (await tags.count()) {
    await tags.selectOption({ label: 'Panel' });
    console.log('wrote', await capture(page, join(OUT, 'speakers-panel'), { schemes: ['light'] }));
  } else {
    console.log('no Session tag filter on this build (#440), so no filtered image');
  }

  console.log('answered [] for:', calls.unanswered.join(', ') || 'nothing');
  await context.close();
  await site.close();
});
