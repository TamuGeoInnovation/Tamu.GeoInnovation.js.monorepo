import { readFileSync } from 'fs';

import { Browser, expect, test } from '@playwright/test';

import { ApiAnswer, STUB_AUTH0, capture, captureContext, signInAsAdmin, stubApi } from './admin-capture';

/**
 * The shared way to photograph an admin page without signing in (#3806) does what it says: it lets an admin page open,
 * hands the API the permissions asked for, answers the API from fixtures, says what it was asked and not given, and
 * writes an image per colour scheme at the size asked. docs/gisday-admin-capture.md describes it.
 */
const SEASON = { guid: 's-made-up', year: 2031, active: true, days: [{ date: '2031-11-19T06:00:00.000Z' }] };
const ANSWERS: Array<ApiAnswer> = [
  { path: '/seasons/active', json: SEASON },
  { path: '/seasons', json: [SEASON] },
  { path: /^\/universities/, json: [{ guid: 'u-1', name: 'Made-up University', acronym: 'MU', hexTriplet: '500000' }] }
];

async function open(browser: Browser, baseURL: string, signedIn: boolean, size = { width: 1280, height: 900 }) {
  const context = await captureContext(browser, size);

  if (signedIn) {
    await signInAsAdmin(context, baseURL, { permissions: ['read:competitions', 'update:competitions'] });
  }

  const calls = await stubApi(context, baseURL, ANSWERS);
  const page = await context.newPage();

  return { context, page, calls };
}

test.describe('capturing an admin page without signing in', () => {
  test('opens an admin page as a signed-in admin, drawn from the fixtures', async ({ browser, baseURL }) => {
    const { context, page } = await open(browser, baseURL!, true);
    const auth0: Array<string> = [];
    page.on('request', (r) => r.url().startsWith(`https://${STUB_AUTH0.domain}/`) && auth0.push(new URL(r.url()).pathname));

    await page.goto('/admin/universities');

    await expect(page.getByRole('cell', { name: 'Made-up University' })).toBeVisible({ timeout: 30_000 });
    expect(new URL(page.url()).pathname).toBe('/admin/universities');
    // Signed in through the stub: the page asked "Auth0" for a code and a token, and the browser answered both.
    expect(auth0).toEqual(expect.arrayContaining(['/authorize', '/oauth/token']));
    await context.close();
  });

  test('without it, the same page is not served', async ({ browser, baseURL }) => {
    const { context, page } = await open(browser, baseURL!, false);

    // The guard hands off to Auth0, which a local build cannot reach, so the navigation may itself fail.
    await page.goto('/admin/universities').catch(() => undefined);

    await expect(page.getByRole('cell', { name: 'Made-up University' })).toHaveCount(0);
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 15_000 }).not.toBe('/admin/universities');
    await context.close();
  });

  test('sends the API the permissions asked for, in the access token', async ({ browser, baseURL }) => {
    const { context, page } = await open(browser, baseURL!, true);
    const tokens: Array<string> = [];
    page.on('request', (r) => {
      const header = r.headers()['authorization'];
      if (r.url().includes('/api/') && header) tokens.push(header);
    });

    await page.goto('/admin/universities');
    await expect(page.getByRole('cell', { name: 'Made-up University' })).toBeVisible({ timeout: 30_000 });

    expect(tokens.length).toBeGreaterThan(0);
    const claims = JSON.parse(Buffer.from(tokens[0].replace(/^Bearer /, '').split('.')[1], 'base64url').toString());
    expect(claims.permissions).toEqual(['read:competitions', 'update:competitions']);
    await context.close();
  });

  test('answers a call it has no fixture for with [], and lists it', async ({ browser, baseURL }) => {
    const { context, page, calls } = await open(browser, baseURL!, true);

    await page.goto('/admin/universities');
    await expect(page.getByRole('cell', { name: 'Made-up University' })).toBeVisible({ timeout: 30_000 });
    const answer = await page.evaluate(() => fetch('/api/made-up/thing').then((r) => r.json()));

    expect(answer).toEqual([]);
    expect(calls.unanswered).toContain('GET /made-up/thing');
    expect(calls.asked).toContain('GET /seasons/active');
    expect(calls.unanswered).not.toContain('GET /seasons/active');
    await context.close();
  });

  test('writes one image per colour scheme, at the size asked', async ({ browser, baseURL }, testInfo) => {
    const { context, page } = await open(browser, baseURL!, true, { width: 1000, height: 700 });

    await page.goto('/admin/universities');
    await expect(page.getByRole('cell', { name: 'Made-up University' })).toBeVisible({ timeout: 30_000 });
    const written = await capture(page, testInfo.outputPath('universities'));

    expect(written).toEqual([testInfo.outputPath('universities-light.png'), testInfo.outputPath('universities-dark.png')]);
    for (const file of written) {
      const png = readFileSync(file);
      // A PNG's width and height are the first two numbers of its header chunk.
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1000, 700]);
    }
    await context.close();
  });
});
