// node capture.mjs <base url> <out png> <state: counts | busy> <api: before | after>
// Admin > Dashboards > Accounts from a local build, with Auth0's sign-in and the GIS Day API answered by the browser:
// nothing reaches Auth0 or an API. The "busy" state is Auth0 rate-limiting the API, answered as each build's API does:
// development's API answered 500 (#3747), this branch's answers 503 with Retry-After.
import { chromium } from '/w/node_modules/playwright/index.mjs';

const [base, out, state, api] = process.argv.slice(2);
const DOMAIN = 'https://txgisday-dev.us.auth0.com';
const CLIENT = 'MK6AwXWdtd7XLsadK00plQIVT5UtcZ1u';
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (claims) => `${b64({ alg: 'RS256', typ: 'JWT', kid: 'stub' })}.${b64(claims)}.c3R1Yg`;

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
const row = (key, name, c) => ({
  key,
  name,
  total: c.reduce((a, b) => a + b, 0),
  counts: Object.fromEntries(types.map((t, i) => [t, c[i] ?? 0]))
});
const rows = [
  row('texas a&m university', 'Texas A&M University', [96, 31, 14, 0, 0, 2]),
  row('university of texas at austin', 'University of Texas at Austin', [12, 6, 3, 0, 0, 0]),
  row('esri', 'Esri', [0, 0, 0, 9, 0, 0]),
  row('texas water development board', 'Texas Water Development Board', [0, 0, 0, 0, 7, 0])
];
const accounts = rows.reduce((a, r) => a + r.total, 0);
const made = Array.from({ length: accounts }, (_, i) =>
  new Date(Date.UTC(2026, 0, 5) + Math.floor((i * i) / accounts) * 86_400_000 * 1.3).toISOString()
);
const dashboard = {
  window: { from: '2025-11-22T06:00:00.000Z', to: '2026-11-21T06:00:00.000Z' },
  accounts,
  allAccounts: accounts + 41,
  rows,
  made
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'America/Chicago' });
await context.addCookies([
  { name: `auth0.${CLIENT}.is.authenticated`, value: 'true', url: base },
  { name: `_legacy_auth0.${CLIENT}.is.authenticated`, value: 'true', url: base }
]);

let nonce = '';
await context.route(`${DOMAIN}/**`, async (route) => {
  const url = new URL(route.request().url());
  const now = Math.floor(Date.now() / 1000);

  if (url.pathname === '/authorize') {
    nonce = url.searchParams.get('nonce') ?? '';
    const response = { code: 'stub', state: url.searchParams.get('state') };

    return route.fulfill({
      contentType: 'text/html',
      body: `<script>parent.postMessage(${JSON.stringify({ type: 'authorization_response', response })}, '*')</script>`
    });
  }

  if (url.pathname === '/oauth/token') {
    return route.fulfill({
      json: {
        id_token: jwt({
          iss: `${DOMAIN}/`,
          aud: CLIENT,
          sub: 'auth0|stub-admin',
          iat: now,
          exp: now + 3600,
          nonce,
          name: 'Stub Admin',
          email: 'admin@example.edu',
          'geoservices.prod/roles': ['GIS Day Admin']
        }),
        access_token: jwt({
          iss: `${DOMAIN}/`,
          aud: ['gisday.dev.api'],
          sub: 'auth0|stub-admin',
          iat: now,
          exp: now + 3600,
          permissions: ['read:users']
        }),
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile email'
      }
    });
  }

  return route.fulfill({ status: 404, body: '' });
});

const unhandled = new Set();
await context.route(`${base}/api/**`, async (route) => {
  const path = new URL(route.request().url()).pathname.replace(/^\/api/, '').replace(/\/$/, '');

  if (path === '/seasons') return route.fulfill({ json: seasons });
  if (path === '/seasons/active') return route.fulfill({ json: seasons[0] });
  if (path.startsWith('/users/dashboard/season/')) {
    if (state === 'counts') return route.fulfill({ json: dashboard });
    if (api === 'before') return route.fulfill({ status: 500, json: { statusCode: 500, message: 'Internal server error' } });

    return route.fulfill({
      status: 503,
      headers: { 'Retry-After': '12' },
      json: {
        statusCode: 503,
        message: 'The account counts are temporarily unavailable: the sign-in service is busy. Try again in 12 seconds.',
        error: 'Service Unavailable'
      }
    });
  }

  unhandled.add(`${route.request().method()} ${path}`);
  return route.fulfill({ json: [] });
});

const page = await context.newPage();
await page.goto(`${base}/admin/dashboards/accounts?season=s-2026`);
const expected =
  state === 'counts'
    ? 'accounts with a GIS Day profile'
    : api === 'before'
      ? 'could not be read'
      : 'temporarily unavailable';
await page.getByText(expected, { exact: false }).first().waitFor({ timeout: 30_000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: out });
console.log(
  out,
  '| shows:',
  expected,
  '| at',
  new URL(page.url()).pathname,
  '| other API calls answered []:',
  [...unhandled].join(', ') || 'none'
);
await browser.close();
