import { join } from 'path';

import { expect, test } from '@playwright/test';

import { ApiAnswer, capture, captureContext, serveBuild, signInAsAdmin, stubApi } from '../admin-capture';

/**
 * Admin > Dashboards > Accounts with made-up counts, as home photographed it for #3747 (batch g126), on the shared
 * helper. `CAPTURE_STATE=busy` photographs the dashboard while Auth0 is rate-limiting the API, answered as #3747's API
 * does: 503 with Retry-After. docs/gisday-admin-capture.md says how to run it.
 */
const BUILD = process.env.CAPTURE_BUILD ?? 'dist/apps/gisday-angular';
const OUT = process.env.CAPTURE_OUT ?? 'test-results/captures';
const STATE = process.env.CAPTURE_STATE ?? 'counts';

const seasons = [
  {
    guid: 's-2026',
    year: 2026,
    active: true,
    days: [{ date: '2026-11-16T06:00:00.000Z' }, { date: '2026-11-20T06:00:00.000Z' }]
  },
  { guid: 's-2025', year: 2025, active: false, days: [{ date: '2025-11-21T06:00:00.000Z' }] }
];
const types = ['undergraduate', 'graduate', 'academia', 'industry', 'government', 'other'];
const row = (key: string, name: string, counts: Array<number>) => ({
  key,
  name,
  total: counts.reduce((a, b) => a + b, 0),
  counts: Object.fromEntries(types.map((t, i) => [t, counts[i] ?? 0]))
});
const rows = [
  row('example university', 'Example University', [96, 31, 14, 0, 0, 2]),
  row('example state university', 'Example State University', [12, 6, 3, 0, 0, 0]),
  row('example mapping co.', 'Example Mapping Co.', [0, 0, 0, 9, 0, 0]),
  row('example county', 'Example County', [0, 0, 0, 0, 7, 0])
];
const accounts = rows.reduce((a, r) => a + r.total, 0);
const dashboard = {
  window: { from: '2025-11-22T06:00:00.000Z', to: '2026-11-21T06:00:00.000Z' },
  accounts,
  allAccounts: accounts + 41,
  rows,
  made: Array.from({ length: accounts }, (_, i) =>
    new Date(Date.UTC(2026, 0, 5) + Math.floor((i * i) / accounts) * 86_400_000 * 1.3).toISOString()
  )
};
const busy = {
  status: 503,
  headers: { 'Retry-After': '12' },
  json: {
    statusCode: 503,
    message: 'The account counts are temporarily unavailable: the sign-in service is busy. Try again in 12 seconds.',
    error: 'Service Unavailable'
  }
};

const answers: Array<ApiAnswer> = [
  { path: '/seasons', json: seasons },
  { path: '/seasons/active', json: seasons[0] },
  { path: /^\/users\/dashboard\/season\//, ...(STATE === 'busy' ? busy : { json: dashboard }) }
];

test('Admin > Dashboards > Accounts', async ({ browser }) => {
  const site = await serveBuild(BUILD);
  const context = await captureContext(browser, { width: 1280, height: 900 });
  await signInAsAdmin(context, site.url, { permissions: ['read:users'] });
  const calls = await stubApi(context, site.url, answers);
  const page = await context.newPage();

  await page.goto(`${site.url}/admin/dashboards/accounts?season=s-2026`);
  // Busy: a build with #3747 says the counts are temporarily unavailable; one without it, that they could not be read.
  const shown = STATE === 'busy' ? /temporarily unavailable|could not be read/ : 'accounts with a GIS Day profile';
  await expect(page.getByText(shown).first()).toBeVisible({ timeout: 30_000 });

  console.log('wrote', await capture(page, join(OUT, `accounts-${STATE}`)));
  console.log('answered [] for:', calls.unanswered.join(', ') || 'nothing');
  await context.close();
  await site.close();
});
