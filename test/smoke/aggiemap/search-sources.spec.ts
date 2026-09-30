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
 *   the source's own query is run against its layer directly. The layer must be the one the row
 *   expects, must have every field the source's query, where clause and display use (read from
 *   `search-sources.ts`, so they cannot drift), and must answer the source's own query with features.
 *   Asking only whether the service answered missed a query asking for renamed fields (#1166) and, on
 *   dev, a bike racks address that is a bike lanes layer (#1122).
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
      /**
       * The query the details' share link must end with. When set, the link is also opened, and must
       * reopen the same feature.
       */
      shareQuery?: string;
    }
  | { kind: 'deep-link'; query: string; popupShows: RegExp }
  | {
      kind: 'service';
      url: string;
      usedBy: string;
      /** The layer's name, so an address that now points at another layer fails. */
      layerName: RegExp;
    }
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
    popupShows: /Central Campus Garage/,
    // Garages are not in the parking lots layer, so a `?lot=` link could not find one (#1163).
    shareQuery: '?garage=CCG'
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
  'all-parking': {
    kind: 'service',
    url: `${connections.tsMainUrl}/6`,
    usedBy: 'Directions, drive mode',
    layerName: /^Parking Lots$/
  },
  'visitor-parking': {
    kind: 'service',
    url: `${connections.tsMainUrl}/6`,
    usedBy: 'Directions, drive mode',
    layerName: /^Parking Lots$/
  },
  // Hard-coded in search-sources.ts rather than in connections.ts, so it is copied here (#1162).
  'night-parking': {
    kind: 'service',
    url: 'https://arc.ts.tamu.edu/arcgis/rest/services/TS/AVPVisBSUBVenNWRetNSCMed/MapServer/6',
    usedBy: 'Directions, drive mode',
    layerName: /parking/i
  },
  'bike-racks': {
    kind: 'service',
    url: connections.bikeRacksUrl,
    usedBy: 'Directions, bike mode',
    layerName: /bike rack/i
  },
  'university-departments': {
    kind: 'not-on-main-map',
    usedBy: 'the football, move-in, ring day and effluent apps define their own copy'
  },
  'one-parking': {
    kind: 'not-on-main-map',
    usedBy: 'the football, move-in, ring day and operations apps define their own copy'
  }
};

/** `search-sources.ts` as text: it imports Angular, so it cannot be loaded here. */
const SEARCH_SOURCES_TEXT = fs.readFileSync(
  path.join(
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
  ),
  'utf8'
);

/** The sources `search-sources.ts` defines. */
function definedSources(): string[] {
  // Top-level entries are indented six spaces; an `altLookup` names a source at eight, and is not a new one.
  return [...SEARCH_SOURCES_TEXT.matchAll(/^ {6}source: '([a-z-]+)',$/gm)].map((match) => match[1]);
}

interface SourceQuery {
  /** What the source asks for, as it sends it; `*` when it does not narrow the fields. */
  outFields: string[];
  /** Every field the source's query, where clause and display template name. */
  fieldsUsed: string[];
}

/**
 * A source's query, read from its entry in `search-sources.ts`: its `outFields`, the keys of its
 * `where` clause (not `scoringWhere`), and the fields its `displayTemplate` shows.
 */
function sourceQuery(source: string): SourceQuery {
  const start = SEARCH_SOURCES_TEXT.search(new RegExp(`^ {6}source: '${source}',$`, 'm'));

  if (start === -1) {
    throw new Error(`${source} was not found in search-sources.ts`);
  }

  // The entry runs until the next top-level key (`    NIGHT_PARKING: {`) or the end of the map.
  const rest = SEARCH_SOURCES_TEXT.slice(start);
  const end = rest.search(/\n {4}[A-Z_]+: \{|\n {2}\};/);
  const entry = end === -1 ? rest : rest.slice(0, end);

  const outFields = (entry.match(/outFields: [`'"]([^`'"]*)[`'"]/)?.[1] ?? '*')
    .split(',')
    .map((field) => field.trim())
    .filter((field) => field.length > 0);

  const whereKeys = [...(entry.match(/\bwhere: \{[^}]*?keys: \[([^\]]*)\]/)?.[1].matchAll(/'([^']+)'/g) ?? [])]
    .map((match) => match[1])
    // `keys: ['1']` with `=` is the "every feature" clause, not a field.
    .filter((key) => key !== '1');

  const displayFields = [...(entry.match(/displayTemplate: '([^']*)'/)?.[1].matchAll(/\{attributes\.([^}]+)\}/g) ?? [])].map(
    (match) => match[1]
  );

  return {
    outFields,
    fieldsUsed: [...new Set([...outFields.filter((field) => field !== '*'), ...whereKeys, ...displayFields])]
  };
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

/** A layer field matches a name the source uses exactly, or as the last part of a joined layer's qualified name. */
function hasField(layerFields: string[], field: string): boolean {
  return layerFields.some((name) => name === field || name.endsWith(`.${field}`));
}

async function getJson(
  request: import('@playwright/test').APIRequestContext,
  url: string,
  params: Record<string, string>
): Promise<{ body?: Record<string, unknown>; problem?: string }> {
  let response;

  try {
    response = await request.get(url, { params: { ...params, f: 'json' }, timeout: 30_000, failOnStatusCode: false });
  } catch (error) {
    return { problem: `request failed: ${(error as Error).message.split('\n')[0]}` };
  }

  let body: Record<string, unknown> & { error?: { code?: number; message?: string } };

  try {
    body = await response.json();
  } catch {
    return { problem: `HTTP ${response.status()}, not JSON` };
  }

  if (body.error) {
    return { problem: `${body.error.code ?? 'error'} ${body.error.message ?? ''}`.trim() };
  }

  return { body };
}

/**
 * Everything wrong with a Directions-only source's layer: the wrong layer, a field the source uses that
 * the layer lacks, or the source's own query failing or finding nothing. Empty when all is well.
 */
async function sourceProblems(
  request: import('@playwright/test').APIRequestContext,
  source: string,
  url: string,
  layerName: RegExp
): Promise<string[]> {
  const layer = await getJson(request, url, {});

  if (layer.problem) {
    return [`the layer answered "${layer.problem}"`];
  }

  const problems: string[] = [];
  const name = String(layer.body?.['name'] ?? '');
  const layerFields = ((layer.body?.['fields'] as { name: string }[] | undefined) ?? []).map((field) => field.name);
  const { outFields, fieldsUsed } = sourceQuery(source);

  if (!layerName.test(name)) {
    problems.push(`the layer is "${name}", not one matching ${layerName}`);
  }

  const missing = fieldsUsed.filter((field) => !hasField(layerFields, field));

  if (missing.length > 0) {
    problems.push(`the layer has no field ${missing.map((field) => `"${field}"`).join(', ')}`);
  }

  const query = await getJson(request, `${url}/query`, {
    where: '1=1',
    outFields: outFields.join(','),
    returnGeometry: 'false',
    resultRecordCount: '1'
  });

  if (query.problem) {
    problems.push(`its own query answered "${query.problem}"`);
  } else if (((query.body?.['features'] as unknown[] | undefined) ?? []).length === 0) {
    problems.push('its own query found no features');
  }

  return problems;
}

test.describe('search sources on the main map', () => {
  test('every Directions-only source has a query that can be read from search-sources.ts', () => {
    // Guards the parsing the service rows depend on: an entry that cannot be found, or a query that
    // reads as no fields, would otherwise be checked against nothing.
    for (const [source, sourceCase] of Object.entries(SOURCE_CASES)) {
      if (sourceCase.kind === 'service') {
        expect(sourceQuery(source).outFields.length, `${source}: no outFields were read`).toBeGreaterThan(0);
      }
    }

    expect(
      sourceQuery('all-parking').fieldsUsed,
      'all-parking should read its four outFields and display field'
    ).toHaveLength(5);
    expect(sourceQuery('night-parking').fieldsUsed, 'night-parking should read its where key').toContain('Night_Lot');
    expect(sourceQuery('bike-racks').fieldsUsed, 'bike-racks should read its display field').toEqual(['Type']);
  });

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
      const { category, term, result, popupShows, shareQuery } = sourceCase;

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

          if (shareQuery) {
            // The copy field is a button named "Click to copy to clipboard." whose text is the link it copies.
            const shareLink = popup.getByRole('button').filter({ hasText: new RegExp(`${escapeRegExp(shareQuery)}$`) });
            await expect(shareLink, `the details for "${result}" do not share ${shareQuery}`).toBeVisible();

            await openMainMap(page, shareQuery);
            const reopened = page.locator(POPUP);
            await expect(reopened, `/map${shareQuery} did not reopen "${result}"`).not.toHaveClass(/hidden/, {
              timeout: 30_000
            });
            await expect(reopened, `/map${shareQuery} did not show "${result}"'s data`).toContainText(popupShows, {
              timeout: 15_000
            });
          }
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
      const { url, usedBy, layerName } = sourceCase;

      test(`${source}: its layer answers its own query (used by ${usedBy})`, async ({ request }) => {
        await checkOrRecordKnown(source, known, async () => {
          const problems = await sourceProblems(request, source, url, layerName);

          expect(problems, `${source} (${url}): ${problems.join('; ')}`).toEqual([]);
        });
      });
    } else {
      test(`${source}: not used on the main map`, () => {
        test.skip(true, `defined in search-sources.ts but not used on the main map; ${sourceCase.usedBy}`);
      });
    }
  }
});
