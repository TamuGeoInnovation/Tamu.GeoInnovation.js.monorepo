import * as fs from 'fs';
import * as path from 'path';

import { DEFINITIONS_DIR, DEFINITIONS_PREFIX, parseDefinition } from './definitions';

/**
 * The quick tier: which of the suite to run for what a build changed (#1717, after #1427).
 *
 * The suite has three tiers, and the smoke README says when each is run and when it must not be:
 *
 * - **quick** clears a dev release. A fixed core, plus the tests for what changed since the last
 *   build that was cleared. Minutes.
 * - **release** clears production. Every map once.
 * - **full** runs nightly on GitHub against both environments. Everything.
 *
 * This module is the quick tier's decision and nothing else. The first version (#1427) narrowed only
 * when every changed file was a map definition and ran the whole suite otherwise, so in practice it
 * almost never narrowed. This one always narrows, and **says what it could not map**: a changed file
 * nothing here knows about is covered by the core alone, and the run lists it so the gap is read
 * rather than assumed away.
 *
 * **Quick samples; it does not prove.** A layer that breaks on a map nobody touched is found by the
 * release tier or the nightly run. Maps also break *without* a release, when a hosted GIS service is
 * republished, which nothing keyed to changed files can see.
 */

/** Specs that run whole in every quick run: they guard the build itself rather than one map. */
export const CORE_SPECS = [
  'analytics.spec.ts',
  'build-banner.spec.ts',
  'development-only.spec.ts',
  'esri-runtime.spec.ts',
  'gis-hosts.spec.ts',
  'mobile.spec.ts',
  'paint.spec.ts',
  'retired.spec.ts',
  'scope.spec.ts'
];

/** The main map, and one parking and one event map nobody touched: the same code draws them all. */
export const CORE_ROUTES = ['/map', '/parking/ts-main-parking', '/events/gameday-parking'];

/** Specs whose tests are one per route, with the route leading the title. Selected by route. */
export const ROUTE_SPECS = [
  'maps.spec.ts',
  'event-dates.spec.ts',
  'framing.spec.ts',
  'parking-spaces.spec.ts',
  'map-layers.spec.ts'
];

/**
 * Titles in the per-route specs that run whatever changed. `maps.spec.ts` holds the coverage floor,
 * which is what notices a map disappearing from the discovery pages instead of silently not being
 * tested.
 */
export const CORE_TITLES = ['lists at least'];

/**
 * Changed code that a spec checks directly. A path may match several; the list grows as a mapping
 * is needed, and anything it lacks is reported as unmapped rather than guessed at.
 */
const FEATURES: { paths: RegExp; specs: string[] }[] = [
  {
    paths: /^libs\/maps\/feature\/basemap\//,
    specs: ['services.spec.ts', 'basemap-zoom.spec.ts', 'campus-basemap.spec.ts', 'basemap-gallery.spec.ts', 'blank-map.spec.ts']
  },
  {
    // Where the vector tile basemap is made and its sprite override applied (#2487).
    paths: /^libs\/maps\/esri\/src\/lib\/services\/map\/(basemap-layers|vector-tile-sprites|map\.service)\.ts$/,
    specs: ['blank-map.spec.ts', 'basemap-zoom.spec.ts']
  },
  {
    paths: /^libs\/(maps\/feature\/popup|aggiemap\/ngx\/popups|ts\/events\/ngx\/src\/lib\/modules\/popups)\//,
    specs: ['popup.spec.ts', 'directions.spec.ts', 'search-sources.spec.ts']
  },
  { paths: /^libs\/maps\/feature\/trip-planner\//, specs: ['directions.spec.ts', 'map-coordinates.spec.ts'] },
  {
    paths: /^libs\/aggiemap\/ngx\/ui\/.*\/(sidebar-trip-planner|trip-planner-top)\//,
    specs: ['directions.spec.ts', 'map-coordinates.spec.ts']
  },
  {
    paths: /^libs\/maps\/(feature\/(coordinates|accessibility)\/|esri\/src\/lib\/geographic\.ts$)/,
    specs: ['map-coordinates.spec.ts']
  },
  { paths: /^libs\/maps\/feature\/(legend|layer-list)\//, specs: ['legend.spec.ts'] },
  { paths: /^libs\/ui-kits\/ngx\/search\//, specs: ['search.spec.ts', 'search-sources.spec.ts'] },
  { paths: /^libs\/maps\/feature\/perspective\//, specs: ['perspective.spec.ts'] },
  {
    paths: /^libs\/aggiemap\/ngx\/common\/src\/lib\/(connections|search-sources)\.ts$/,
    specs: ['services.spec.ts', 'search.spec.ts', 'search-sources.spec.ts']
  },
  { paths: /^libs\/aggiemap\/ngx\/core\/src\/lib\/pages\/map\//, specs: ['isolation.spec.ts', 'directions.spec.ts'] },
  {
    paths: /^libs\/aggiemap\/ngx\/common\/src\/lib\/connections\.ts$/,
    specs: ['portal-renderers.spec.ts', 'service-metadata.spec.ts']
  },
  { paths: /^libs\/maps\/esri\/src\/lib\/services\/map\/portal-symbology\.ts$/, specs: ['portal-renderers.spec.ts'] },
  { paths: /^libs\/ts\/events\/ngx\/src\/lib\/modules\/map\//, specs: ['isolation.spec.ts'] },
  {
    paths: /^libs\/ts\/events\/ngx\/src\/lib\/(services\/event\/|definitions\/campus\/)/,
    specs: ['campus-layers.spec.ts', 'kiosk.spec.ts', 'lot-links.spec.ts']
  },
  // The kiosk maps, and the Football Tailgating map whose layers and links its kiosk reuses (#1975).
  {
    paths: /^libs\/ts\/events\/ngx\/src\/lib\/definitions\/(dining|tailgating|tailgating-kiosk)\.definitions\.ts$/,
    specs: ['kiosk.spec.ts']
  },
  { paths: /^libs\/maps\/esri\/src\/lib\/services\/map\/(selection-layer|hit-order)\.ts$/, specs: ['selection.spec.ts'] },
  {
    paths: /^libs\/(ui-kits\/ngx\/forms\/src\/lib\/components\/autocomplete|aggiemap\/ngx\/discover\/src\/lib\/components\/all-maps)\//,
    specs: ['all-maps-search.spec.ts']
  }
];

/** Paths that cannot change what a deployed AggieMap map does. GIS Day is another site with its own checks. */
const IGNORABLE = [
  /^docs\//,
  /\.md$/,
  /^\.github\//,
  /^\.claude\//,
  /\.spec\.ts$/,
  /^scripts\//,
  /^tools\//,
  /^(apps|libs)\/gisday/
];

const SMOKE_DIR = 'test/smoke/aggiemap/';

export interface QuickSet {
  /** Spec files to run whole. */
  specs: string[];
  /** Routes whose tests in the per-route specs run, e.g. `/events/mens-basketball`. */
  routes: string[];
  /**
   * Stems of changed definition files, e.g. `move-out`. Every route whose id contains one runs too:
   * a file can declare several maps, and `move-out.definitions.ts` builds `spring-move-out` and two
   * more from a function, where no id can be read from the source (#1691).
   */
  stems: string[];
  /** Changed files nothing here maps to a test. The core is all that covers them. */
  unmapped: string[];
}

/**
 * Work out the quick set for repository-relative changed files.
 *
 * `readFile` is injected so this can be tested without touching the definitions directory.
 */
export function quickSetFor(
  changed: string[],
  readFile: (file: string) => string = (file) => fs.readFileSync(path.join(DEFINITIONS_DIR, file), 'utf8')
): QuickSet {
  const specs = new Set(CORE_SPECS);
  const routes = new Set(CORE_ROUTES);
  const stems = new Set<string>();
  const unmapped: string[] = [];

  for (const file of changed) {
    // A changed smoke spec runs whole, before the general rule that specs cannot reach a map.
    if (file.startsWith(SMOKE_DIR)) {
      if (file.endsWith('.spec.ts')) {
        specs.add(file.slice(SMOKE_DIR.length));
      }

      continue;
    }

    if (IGNORABLE.some((pattern) => pattern.test(file))) {
      continue;
    }

    const features = FEATURES.filter((feature) => feature.paths.test(file));
    features.forEach((feature) => feature.specs.forEach((spec) => specs.add(spec)));

    // The route comes from the id the definition declares, never from the file name:
    // 4h-roundup.definitions.ts declares `4h-roundup-2026` (#1427).
    const name = file.startsWith(DEFINITIONS_PREFIX) ? file.slice(DEFINITIONS_PREFIX.length) : null;
    const definition = name?.endsWith('.definitions.ts') ? parseDefinition(name, readFile(name)) : null;

    if (definition && name) {
      routes.add(definition.route);
      stems.add(name.slice(0, -'.definitions.ts'.length));
    } else if (features.length === 0) {
      unmapped.push(file);
    }
  }

  return { specs: [...specs].sort(), routes: [...routes], stems: [...stems], unmapped };
}

/** Escape a value for use inside a regular expression. */
function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The pattern that selects a quick set's tests in the per-route specs.
 *
 * A route must follow a space or start the title, and end at a space, slash, query or the title's
 * end, so `/map` selects the main map and neither `maps.spec.ts` nor `/events/ring-day/map/d`.
 */
export function routeGrep(set: QuickSet): RegExp {
  const routes = set.routes.map((route) => `(?<=^| )${escape(route)}(?=[ /?]|$)`);
  const stems = set.stems.map((stem) => `(?<=^| )/[a-z-]+/[a-z0-9-]*${escape(stem)}[a-z0-9-]*(?=[ /?]|$)`);

  return new RegExp([...routes, ...stems, ...CORE_TITLES.map(escape)].join('|'));
}

/** What a quick run chose and why, for the run's output. */
export function describeQuickSet(set: QuickSet): string {
  const lines = [
    `Quick tier: ${set.specs.length} spec files whole, and ${set.routes.length} routes in ${ROUTE_SPECS.join(', ')}.`,
    `  Whole: ${set.specs.join(' ')}`,
    `  Routes: ${set.routes.join(' ')}`,
    `  And every route whose id contains: ${set.stems.join(' ') || '(none)'}`
  ];

  if (set.unmapped.length > 0) {
    lines.push(
      `  ${set.unmapped.length} changed files map to no test of their own, so only the core covers them:`,
      ...set.unmapped.map((file) => `    ${file}`)
    );
  }

  lines.push('  This is not the release tier: maps that were not touched are not loaded.');

  return lines.join('\n');
}
