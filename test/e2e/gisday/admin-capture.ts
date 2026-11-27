import { createReadStream, existsSync, statSync } from 'fs';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { extname, join, resolve, sep } from 'path';

import type { Browser, BrowserContext, Locator, Page } from '@playwright/test';

/**
 * GIS Day admin pages, photographed without signing in (#3806). No machine can sign in to a local site, because a
 * session cannot accept Auth0's consent screen, so every admin change with a visible result needs its images made this
 * way. Home built it for #3747 and the lab for #440 and #3346; this is the one copy.
 *
 * Nothing leaves the browser. Auth0 is answered by the browser as a signed-in admin, with unsigned made-up tokens, and
 * the API by fixtures. What is drawn is the real build's own components. docs/gisday-admin-capture.md says how to use it.
 */

/** The made-up tenant and application the stubbed sign-in answers as. Nothing is ever sent to either. */
export const STUB_AUTH0 = {
  domain: 'txgisday-dev.us.auth0.com',
  clientId: 'MK6AwXWdtd7XLsadK00plQIVT5UtcZ1u',
  audience: 'gisday.dev.api',
  rolesClaim: 'geoservices.prod/roles'
};

/** Who the stubbed sign-in says is signed in. */
export interface StubAdmin {
  /** In the access token, which the API reads; none by default. */
  permissions?: Array<string>;
  /** In the ID token, which the site reads to show the admin pages; `GIS Day Admin` by default. */
  roles?: Array<string>;
  /** The site to be, a key of `GISDAY_SITES` (#1835); txgisday.org by default. */
  site?: string;
}

/** One answer of the stubbed API. The first whose method and path match a request answers it. */
export interface ApiAnswer {
  method?: string;
  /** The path after `/api`, such as `/seasons/active`; a RegExp to match more than one. */
  path: string | RegExp;
  status?: number;
  json?: unknown;
  body?: string | Buffer;
  contentType?: string;
  headers?: Record<string, string>;
  /** How long the API takes, to photograph a page while it waits. */
  delayMs?: number;
}

/** What the stubbed API was asked: every call, and those no answer matched, which were answered `[]`. */
export interface ApiCalls {
  asked: Array<string>;
  unanswered: Array<string>;
}

/**
 * A browser context set up as captures need: the size, US Central (the times on GIS Day's pages), and no service worker.
 * The site registers one, and a request it makes is never seen by the stubs, so it would reach the server instead.
 */
export function captureContext(
  browser: Browser,
  options: { width?: number; height?: number; colorScheme?: 'light' | 'dark' } = {}
): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: options.width ?? 1280, height: options.height ?? 900 },
    timezoneId: 'America/Chicago',
    colorScheme: options.colorScheme ?? 'light',
    serviceWorkers: 'block'
  });
}

/**
 * Signs `context` in at `baseURL` as an admin, answering Auth0 itself. Call it before the first `goto`.
 *
 * A build's Auth0 settings are placeholders until a deployed container fills them in, so they are filled here, in every
 * script the server sends, with `STUB_AUTH0`, as `asSite` in site.ts fills the site. That works the same for a static
 * production build and for the dev server.
 */
export async function signInAsAdmin(context: BrowserContext, baseURL: string, admin: StubAdmin = {}): Promise<void> {
  const origin = new URL(baseURL).origin;
  const site = admin.site ?? 'txgisday';
  const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const jwt = (claims: object) => `${b64({ alg: 'RS256', typ: 'JWT', kid: 'stub' })}.${b64(claims)}.c3R1Yg`;
  let nonce = '';

  await context.addCookies([
    { name: `auth0.${STUB_AUTH0.clientId}.is.authenticated`, value: 'true', url: origin },
    { name: `_legacy_auth0.${STUB_AUTH0.clientId}.is.authenticated`, value: 'true', url: origin }
  ]);

  await context.route(
    (url) => url.origin === origin && /\.(js|html)$|\/$|^[^.]*$/.test(url.pathname) && !url.pathname.startsWith('/api/'),
    async (route) => {
      const response = await route.fetch();
      const type = response.headers()['content-type'] ?? '';

      if (!/javascript|html/.test(type)) {
        return route.fulfill({ response });
      }

      const body = (await response.text())
        .replace(/___ANGULAR_SITE___/g, site)
        .replace(/___ANGULAR_AUTH0_DOMAIN___/g, STUB_AUTH0.domain)
        .replace(/___ANGULAR_AUTH0_CLIENT_ID___/g, STUB_AUTH0.clientId)
        .replace(/___ANGULAR_AUTH0_AUDIENCE___/g, STUB_AUTH0.audience)
        .replace(/___ANGULAR_AUTH0_ROLES_CLAIM___/g, STUB_AUTH0.rolesClaim);

      return route.fulfill({ response, body });
    }
  );

  await context.route(`https://${STUB_AUTH0.domain}/**`, async (route) => {
    const url = new URL(route.request().url());
    const now = Math.floor(Date.now() / 1000);
    const who = { iss: `https://${STUB_AUTH0.domain}/`, sub: 'auth0|made-up-admin', iat: now, exp: now + 3600 };

    if (url.pathname === '/authorize') {
      nonce = url.searchParams.get('nonce') ?? '';
      const message = {
        type: 'authorization_response',
        response: { code: 'made-up', state: url.searchParams.get('state') }
      };

      return route.fulfill({
        contentType: 'text/html',
        body: `<script>parent.postMessage(${JSON.stringify(message)}, '*')</script>`
      });
    }

    if (url.pathname === '/oauth/token') {
      return route.fulfill({
        json: {
          id_token: jwt({
            ...who,
            aud: STUB_AUTH0.clientId,
            nonce,
            name: 'Example Admin',
            email: 'admin@example.edu',
            [STUB_AUTH0.rolesClaim]: admin.roles ?? ['GIS Day Admin']
          }),
          access_token: jwt({ ...who, aud: [STUB_AUTH0.audience], permissions: admin.permissions ?? [] }),
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'openid profile email'
        }
      });
    }

    return route.fulfill({ status: 404, body: '' });
  });
}

/**
 * Answers the API at `baseURL` from `answers`. A call no answer matches gets `[]` and is listed in `unanswered`, so a
 * capture can say what the page asked that it was not given.
 */
export async function stubApi(
  context: BrowserContext,
  baseURL: string,
  answers: ReadonlyArray<ApiAnswer>
): Promise<ApiCalls> {
  const origin = new URL(baseURL).origin;
  const calls: ApiCalls = { asked: [], unanswered: [] };

  await context.route(
    (url) => url.origin === origin && url.pathname.startsWith('/api/'),
    async (route) => {
      const method = route.request().method();
      const path = new URL(route.request().url()).pathname.replace(/^\/api/, '').replace(/(.)\/$/, '$1');
      const answer = answers.find(
        (a) => (a.method ?? 'GET') === method && (typeof a.path === 'string' ? a.path === path : a.path.test(path))
      );
      const call = `${method} ${path}`;

      calls.asked.push(call);

      if (!answer) {
        calls.unanswered.push(call);
        return route.fulfill({ json: [] });
      }

      if (answer.delayMs) {
        await new Promise((done) => setTimeout(done, answer.delayMs));
      }

      return route.fulfill({
        status: answer.status ?? 200,
        headers: answer.headers,
        contentType: answer.contentType ?? (answer.body === undefined ? 'application/json' : undefined),
        body: answer.body ?? JSON.stringify(answer.json ?? null)
      });
    }
  );

  return calls;
}

/**
 * Serves a static build, such as `dist/apps/gisday-angular`, as its container would: a path that is not a file gets
 * `index.html`, so a deep link loads the app. The placeholders are left for `signInAsAdmin` to fill.
 */
export async function serveBuild(dir: string, port = 0): Promise<{ url: string; close: () => Promise<void> }> {
  const root = resolve(dir);
  const types: Record<string, string> = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json'
  };

  if (!existsSync(join(root, 'index.html'))) {
    throw new Error(`${root} has no index.html: build it first.`);
  }

  const server = createServer((request, response) => {
    const asked = resolve(root, `.${decodeURIComponent(new URL(request.url ?? '/', 'http://x').pathname)}`);
    const file =
      asked.startsWith(root + sep) && existsSync(asked) && statSync(asked).isFile() ? asked : join(root, 'index.html');

    response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(response);
  });

  await new Promise<void>((done) => server.listen(port, '127.0.0.1', done));

  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    close: () => new Promise((done) => server.close(() => done()))
  };
}

/**
 * Photographs `page` (or one element of it) once per colour scheme, as `<out>-light.png` and `<out>-dark.png`, and returns
 * the files written. The page is left in the first scheme given.
 */
export async function capture(
  page: Page,
  out: string,
  options: { schemes?: Array<'light' | 'dark'>; element?: Locator; settleMs?: number } = {}
): Promise<Array<string>> {
  const schemes = options.schemes ?? ['light', 'dark'];
  const written: Array<string> = [];

  for (const scheme of [...schemes].reverse()) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.waitForTimeout(options.settleMs ?? 500);

    const path = schemes.length === 1 ? `${out}.png` : `${out}-${scheme}.png`;
    await (options.element ?? page).screenshot({ path });
    written.unshift(path);
  }

  return written;
}
