import { expect, Page, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// connections.ts has no imports, so it loads without the Angular dependency graph (see services.spec.ts).
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';
import { blockAnalytics } from './analytics';

/**
 * Every search source the main map defines is exercised, each by the route a visitor uses to reach it
 * (#1138).
 *
 * The main map searches several sources at once, so one source can die while the others keep
 * returning results and search still looks healthy. The bike racks source did exactly that on
 * production (#1122), and so did night parking (#1162); nothing noticed either.
 *
 * Sources are reached three ways, so a row says which:
 *
 * - `typed`: typed into the search box. The term must be answered by that source, under that
 *   source's heading, and choosing the result must open its details.
 * - `deep-link`: a URL parameter such as `?bldg=` opens a feature through that source.
 * - `service`: used only by the Directions tab. Planning a route to reach it is out of scope here, so
 *   the source's service is asked directly whether it answers with features. That catches a moved or
 *   stopped service, not a wrong where clause.
 *
 * `not-on-main-map` records a source the main map defines but never uses, so the guard below still
 * knows it was considered.
 *
 * A source known to fail in an environment is listed in environments.json under
 * `allowedSearchSourceFailures`, tied to its issue. Its check still runs, and the result is recorded
 * as an annotation rather than failing the run, including when it starts passing again.
 *
 * Add a source by adding a row. The guard fails if `search-sources.ts` gains a source with none.
 */

type SourceCase =
  | {
      kind: 'typed';
      /** The heading the results list shows for this source. */
      category: string;
      term: string;
      /** The result as displayed. The list title-cases it, so the comparison ignores case. */
      result: string;
      popupShows: RegExp;
    }
  | { kind: 'deep-link'; query: string; popupShows: RegExp }
  | { kind: 'service'; url: string; usedBy: string }
  | { kind: 'not-on-main-map'; usedBy: string };

const BASE_URL = process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu';

/** The app picks its GIS host from its own hostname, as services.spec.ts mirrors. */
const GIS_HOST = new URL(BASE_URL).hostname.includes('dev') ? 'gis-dev.it.tamu.edu' : 'gis.it.tamu.edu';
const connections = Connections(GIS_HOST);

/**
 * One row per source in `libs/aggiemap/ngx/common/src/lib/search-sources/search-sources.ts`, keyed by
 * its `source` id. Terms were chosen against the production services on 30 September.
 */
const SOURCE_CASES: Record<string, SourceCase> = {
  building: {
    kind: 'typed',
    category: 'Building',
    term: 'Sterling C. Evans',
    result: 'Sterling C. Evans Library (0468)',
    popupShows: /Sterling C\. Evans Library/
  },
  'parking-garage': {
    kind: 'typed',
    category: 'Parking Garage',
    term: 'Central Campus Garage',
    result: 'Central Campus Garage',
    popupShows: /Central Campus Garage/
  },
  'parking-lot': {
    kind: 'typed',
    category: 'Parking Lot',
    term: 'Lot 100b',
    result: 'Lot 100b',
    popupShows: /Lot 100b/i
  },
  'points-of-interest': {
    kind: 'typed',
    category: 'Points of Interest',
    term: 'Bonfire Memorial',
    result: 'Bonfire Memorial',
    popupShows: /Bonfire Memorial/
  },
  'building-exact': { kind: 'deep-link', query: '?bldg=0468', popupShows: /Sterling C\. Evans Library/ },
  'building-exact-abbr': { kind: 'deep-link', query: '?BldgAbbrv=WCBA', popupShows: /Wehner Building/ },
  'points-of-interest-exact': { kind: 'deep-link', query: '?poi=1', popupShows: /Bonfire Memorial/ },
  'bus-stops-exact': { kind: 'deep-link', query: '?busstop=4719', popupShows: /Blinn/ },
  // BuildingDepartmentListComponent searches this source, but no template uses that component.
  'university-departments-exact': {
    kind: 'not-on-main-map',
    usedBy: 'BuildingDepartmentListComponent, which no template includes'
  },
  'all-parking': { kind: 'service', url: `${connections.tsMainUrl}/6`, usedBy: 'Directions, drive mode' },
  'visitor-parking': { kind: 'service', url: `${connections.tsMainUrl}/6`, usedBy: 'Directions, drive mode' },
  // Hard-coded in search-sources.ts rather than in connections.ts, so it is copied here (#1162).
  'night-parking': {
    kind: 'service',
    url: 'https://arc.ts.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer/6',
    usedBy: 'Directions, drive mode'
  },
  'bike-racks': { kind: 'service', url: connections.bikeRacksUrl, usedBy: 'Directions, bike mode' },
  'university-departments': {
    kind: 'not-on-main-map',
    usedBy: 'the football, move-in, ring day and effluent apps define their own copy'
  },
  'one-parking': {
    kind: 'not-on-main-map',
    usedBy: 'the football, move-in, ring day and operations apps define their own copy'
  }
};

/** The sources `search-sources.ts` defines, read as text: it imports Angular, so it cannot be loaded here. */
function definedSources(): string[] {
  const file = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'libs',
    'aggiemap',
    'ngx',
    'common',
    'src',
    'lib',
    'search-sources',
    'search-sources.ts'
  );
  const source = fs.readFileSync(file, 'utf8');

  // Top-level entries are indented six spaces; an `altLookup` names a source at eight, and is not a new one.
  return [...source.matchAll(/^ {6}source: '([a-z-]+)',$/gm)].map((match) => match[1]);
}

interface EnvironmentSettings {
  baseUrl: string;
  allowedSearchSourceFailures?: Record<string, string>;
}

/** Sources known to fail in this environment, each tied to an issue, from environments.json. */
function allowedFailures(): Record<string, string> {
  const environments: Record<string, EnvironmentSettings> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );
  const normalised = BASE_URL.replace(/\/$/, '');
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === normalised);

  return match?.allowedSearchSourceFailures ?? {};
}

const ALLOWED = allowedFailures();

const PROBE_GLOBAL = '__tamuGiscMapProbe';
const POPUP = 'tamu-gisc-feature-popup .popup';

/** Opens the main map and waits until its layers have loaded, so a query is not racing the map. */
async function openMainMap(page: Page, query = ''): Promise<void> {
  await blockAnalytics(page);
  await page.goto(`/map${query}`);

  await expect
    .poll(
      async () =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
          PROBE_GLOBAL
        ),
      { message: `the main map never finished loading`, timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Runs a source's check. A source known to fail here has its result recorded as an annotation instead
 * of failing the run, so a known failure stays visible, and so does its recovery.
 */
async function checkOrRecordKnown(source: string, known: string | undefined, check: () => Promise<void>): Promise<void> {
  if (!known) {
    await check();
    return;
  }

  try {
    await check();
    test.info().annotations.push({
      type: 'known failure now passing',
      description: `${source} passes again; remove it from allowedSearchSourceFailures (${known})`
    });
  } catch (error) {
    test.info().annotations.push({
      type: 'known failure',
      description: `${source}: ${(error as Error).message.split('\n')[0]} (${known})`
    });
  }
}

/** Why a service does not answer with features, or null if it does. */
async function serviceProblem(request: import('@playwright/test').APIRequestContext, url: string): Promise<string | null> {
  let response;

  try {
    response = await request.get(`${url}/query`, {
      params: { where: '1=1', outFields: '*', returnGeometry: 'false', resultRecordCount: '1', f: 'json' },
      timeout: 30_000,
      failOnStatusCode: false
    });
  } catch (error) {
    return `request failed: ${(error as Error).message.split('\n')[0]}`;
  }

  let body: { error?: { code?: number; message?: string }; features?: unknown[] };

  try {
    body = await response.json();
  } catch {
    return `HTTP ${response.status()}, not JSON`;
  }

  if (body.error) {
    return `${body.error.code ?? 'error'} ${body.error.message ?? ''}`.trim();
  }

  return (body.features?.length ?? 0) > 0 ? null : 'answered with no features';
}

test.describe('search sources on the main map', () => {
  test('every source in search-sources.ts has a case', () => {
    const defined = definedSources();

    // Guards the parsing: if it stops finding sources, the comparison below would pass on nothing.
    expect(defined.length, 'no sources were read from search-sources.ts').toBeGreaterThan(10);
    expect(
      defined.filter((source) => !(source in SOURCE_CASES)),
      'sources with no case here'
    ).toEqual([]);
    expect(
      Object.keys(SOURCE_CASES).filter((source) => !defined.includes(source)),
      'cases for sources that no longer exist'
    ).toEqual([]);
  });

  for (const [source, sourceCase] of Object.entries(SOURCE_CASES)) {
    const known = ALLOWED[source];

    if (sourceCase.kind === 'typed') {
      const { category, term, result, popupShows } = sourceCase;

      test(`${source}: typing "${term}" finds "${result}" under ${category} and shows its data`, async ({ page }) => {
        await openMainMap(page);

        await checkOrRecordKnown(source, known, async () => {
          const input = page.getByPlaceholder('Find Building or Parking');
          await input.click();
          await input.pressSequentially(term, { delay: 80 });

          // Within this source's heading, so a match from another source does not count.
          const section = page.locator('.search-results-container .result-category', {
            has: page.locator('.category-name', { hasText: new RegExp(`^\\s*${escapeRegExp(category)}\\s*$`) })
          });
          const option = section.getByRole('option', { name: new RegExp(`^${escapeRegExp(result)}$`, 'i') });

          await expect(option, `searching "${term}" did not list "${result}" under ${category}`).toBeVisible({
            timeout: 20_000
          });

          await option.click();

          const popup = page.locator(POPUP);
          await expect(popup, `choosing "${result}" did not open its details`).not.toHaveClass(/hidden/, {
            timeout: 15_000
          });
          await expect(popup, `the details for "${result}" did not show its data`).toContainText(popupShows);
        });
      });
    } else if (sourceCase.kind === 'deep-link') {
      const { query, popupShows } = sourceCase;

      test(`${source}: /map${query} opens its details`, async ({ page }) => {
        await openMainMap(page, query);

        await checkOrRecordKnown(source, known, async () => {
          const popup = page.locator(POPUP);
          await expect(popup, `/map${query} did not open any details`).not.toHaveClass(/hidden/, { timeout: 30_000 });
          await expect(popup, `/map${query} did not show the expected data`).toContainText(popupShows, { timeout: 15_000 });
        });
      });
    } else if (sourceCase.kind === 'service') {
      const { url, usedBy } = sourceCase;

      test(`${source}: its service answers with features (used by ${usedBy})`, async ({ request }) => {
        await checkOrRecordKnown(source, known, async () => {
          const problem = await serviceProblem(request, url);

          expect(problem, `${source}: ${url} answered "${problem}"`).toBeNull();
        });
      });
    } else {
      test(`${source}: not used on the main map`, () => {
        test.skip(true, `defined in search-sources.ts but not used on the main map; ${sourceCase.usedBy}`);
      });
    }
  }
});
