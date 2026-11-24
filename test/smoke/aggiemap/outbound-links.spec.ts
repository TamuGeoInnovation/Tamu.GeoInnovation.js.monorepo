import * as fs from 'fs';
import * as path from 'path';

import { expect, test } from '@playwright/test';

import { smokeBaseUrl } from './gis-hosts';
import { BROWSER_IDENTITY, addressesIn, checkLink, judgeLoad, outboundLinks, scheduleUrls } from './outbound-links';

/**
 * Every map's links to other people's websites still work (#3285).
 *
 * #3278's commencement link pointed at a page that had gone, on three maps, and Transportation Services found it, not
 * us: a link is configuration, so the map went on loading and passing everything else. This loads each link as a
 * browser does and judges the page, by #3285's rules: a redirect passes and says where it landed; a refusal, a timeout
 * or an origin's mislabelled error is inconclusive, never red; and a link fails the run only if it fails twice, spaced
 * out, since these are other people's websites. A link known to be dead and waiting on another team is listed in
 * `allowedOutboundLinkFailures` in environments.json, with its issue, and stays visible without turning the run red.
 *
 * Not in the quick tier: it asks the internet a question whose answer changes without a commit. The nightly run is
 * where it belongs.
 */

const BASE_URL = smokeBaseUrl();

/** How long to wait before a failed link's second strike: long enough that a blip has passed. */
const SECOND_STRIKE_MS = 30_000;

/** Links known to be dead in this environment's run, each with the issue that tracks it. */
function allowedFailures(): Record<string, string> {
  const environments: Record<string, { baseUrl: string; allowedOutboundLinkFailures?: Record<string, string> }> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === BASE_URL);

  return match?.allowedOutboundLinkFailures ?? {};
}

const ALLOWED = allowedFailures();
const LINKS = outboundLinks();

test.use(BROWSER_IDENTITY);

test.describe('how a link is judged', () => {
  test('a redirect passes, and says where it landed', () => {
    expect(
      judgeLoad({
        url: 'https://transport.tamu.edu/busroutes/',
        finalUrl: 'https://aggiespirit.ts.tamu.edu/RouteMap',
        status: 200,
        title: 'Route Map',
        text: 'Bus routes'
      })
    ).toEqual(
      expect.objectContaining({ verdict: 'pass', reason: '200 (lands on https://aggiespirit.ts.tamu.edu/RouteMap)' })
    );
  });

  test('a page that says it is not found fails, whatever its status', () => {
    // Aggie One Stop's own branded page, as #3278's dead link served it.
    const branded = 'Page Not Found. Sorry, the page you requested could not be found. Try searching Aggie One Stop.';

    expect(judgeLoad({ url: 'u', status: 404, title: 'Page Not Found', text: branded }).verdict).toBe('fail');
    expect(judgeLoad({ url: 'u', status: 200, title: 'Page Not Found | Aggie One Stop', text: 'Howdy' }).verdict).toBe(
      'fail'
    );
  });

  test('a refusal, a timeout, or a storage error behind a 404 is inconclusive, never red', () => {
    expect(judgeLoad({ url: 'u', status: 403, title: '', text: 'Forbidden' }).verdict).toBe('inconclusive');
    expect(judgeLoad({ url: 'u', error: 'Timeout 30000ms exceeded.' }).verdict).toBe('inconclusive');
    expect(
      judgeLoad({
        url: 'u',
        status: 404,
        text: '<Error><Code>NoSuchKey</Code><Message>The specified key does not exist.</Message><Key>error/403.html</Key></Error>'
      }).verdict
    ).toBe('inconclusive');
  });

  test('a server error fails', () => {
    expect(judgeLoad({ url: 'u', status: 503, title: 'Service Unavailable', text: 'Down for maintenance' }).verdict).toBe(
      'fail'
    );
  });
});

test.describe('where the links come from', () => {
  test("reads every event definition's scheduleUrl, one or a list", () => {
    expect(scheduleUrls(`  scheduleUrl: 'https://12thman.com/sports/football/schedule',`)).toEqual([
      'https://12thman.com/sports/football/schedule'
    ]);
    expect(scheduleUrls(`  scheduleUrl: ['https://a.tamu.edu/one', 'https://b.tamu.edu/two'],`)).toEqual([
      'https://a.tamu.edu/one',
      'https://b.tamu.edu/two'
    ]);
  });

  test('reads the application its links, not the services it calls', () => {
    expect(addressesIn('footer.component.html', '<a href="http://itaccessibility.tamu.edu">Accessibility</a>')).toEqual([
      'http://itaccessibility.tamu.edu'
    ]);
    expect(
      addressesIn(
        'bus.ts',
        `const a = 'https://transport.tamu.edu/busroutes/?utm_source=aggiemap'; const b = 'https://gis.tamu.edu/arcgis/rest/services/X/FeatureServer';`
      )
    ).toEqual(['https://transport.tamu.edu/busroutes/?utm_source=aggiemap']);
  });

  test('finds the definitions’ schedule links and the application’s own', () => {
    const urls = LINKS.map((link) => link.url);

    expect(urls).toContain('https://www.aggienetwork.com/ring/ringday/');
    expect(urls).toContain('http://itaccessibility.tamu.edu');
    expect(urls.length).toBeGreaterThanOrEqual(20);
    expect(urls.filter((url) => /arcgis\/rest|\/api\//i.test(url))).toEqual([]);
  });
});

/**
 * A check nobody has seen fail is not known to work. #3278's dead link is fixed in the definitions, so the check is
 * pointed at it here rather than by breaking a definition again: Aggie One Stop's branded "Page Not Found" is red,
 * and a live link is green.
 */
test.describe('the check, on a link known to be dead and one known to work', () => {
  test('calls #3278’s dead commencement link dead', async ({ page }) => {
    test.setTimeout(60_000);
    const judged = await checkLink(page, 'https://aggie.tamu.edu/graduation');

    expect(judged.verdict, judged.reason).toBe('fail');
  });

  test('calls a working schedule link working', async ({ page }) => {
    test.setTimeout(60_000);
    const judged = await checkLink(page, 'https://www.aggienetwork.com/ring/ringday/');

    expect(judged.verdict, judged.reason).toBe('pass');
  });
});

test.describe('every outbound link', () => {
  for (const link of LINKS) {
    test(link.url, async ({ page }) => {
      test.setTimeout(120_000);
      test.info().annotations.push({ type: 'written in', description: link.from.join(', ') });

      let judged = await checkLink(page, link.url);

      // Two strikes: one failure may be a blip on someone else's website.
      if (judged.verdict === 'fail') {
        await page.waitForTimeout(SECOND_STRIKE_MS);
        judged = await checkLink(page, link.url);
      }

      test.info().annotations.push({ type: judged.verdict, description: judged.reason });

      if (judged.verdict === 'inconclusive') {
        // Reported, never red: a refusal or a timeout says nothing about whether the page is there.
        return;
      }

      const known = ALLOWED[link.url];

      if (known) {
        test.info().annotations.push({ type: 'known failure', description: known });
        expect(judged.verdict, `${link.url} works again; remove it from allowedOutboundLinkFailures (${known})`).toBe(
          'fail'
        );
        return;
      }

      expect(judged.verdict, `${link.url}, in ${link.from.join(', ')}: ${judged.reason}`).toBe('pass');
    });
  }
});
