import * as fs from 'fs';
import * as path from 'path';

/**
 * Reading the event definitions as text (#1427).
 *
 * The definitions cannot be imported here - that pulls the Angular dependency graph into the
 * Playwright process and fails, first on the JIT compiler and then on bundler-only module
 * resolution. `global-setup.ts` explains it at length. They are read as text instead, which works
 * because the configuration's `id` and `name` and the `status` marker are literals in every file.
 *
 * This module exists because two callers now need the same parse: `retired.ts`, which has read it
 * this way since #1098, and the scoped smoke run, which needs a changed file's route.
 */

export const REPO_ROOT = path.join(__dirname, '..', '..', '..');
export const DEFINITIONS_DIR = path.join(REPO_ROOT, 'libs', 'ts', 'events', 'ngx', 'src', 'lib', 'definitions');

/** Repository-relative, with forward slashes, as `git diff --name-only` prints it. */
export const DEFINITIONS_PREFIX = 'libs/ts/events/ngx/src/lib/definitions/';

export const RETIRED_MARKER = /\bstatus:\s*'retired'/;

/**
 * A copy of the application's `mapSegment` (`libs/ts/events/ngx/src/lib/guards/map-address/map-address.guard.ts`),
 * the first segment of a map's address: a map in the Transportation section is at `/transportation`, whatever its
 * `type`, and every other map is under its type (#2767).
 *
 * A copy because the suite cannot import that file, which imports Angular. The copy this replaced decided by `type`
 * alone, and #2767 left it building `/parking/` for the two Transportation maps, so the quick tier ran nothing at their
 * real addresses (#2775). `scope.spec.ts` now fails when this disagrees with the application's own answer, recorded in
 * `declared-layers.generated.json`. Keep the two the same, line for line.
 */
export function mapSegment(discover: { type: string; mapType?: string; mapTypes?: readonly string[] }): string {
  if ((discover.mapTypes ?? [discover.mapType]).includes('transportation')) {
    return 'transportation';
  }

  return discover.type === 'event' ? 'events' : discover.type === 'satellite-campus' ? 'campus' : discover.type;
}

export interface DefinedMap {
  id: string;
  name: string;
  /** File name only, e.g. `mens-basketball.definitions.ts`. */
  file: string;
  /** Root-relative route, e.g. `/events/mens-basketball`. */
  route: string;
  retired: boolean;
}

/**
 * Parse one definitions file's source.
 *
 * Returns null when the file declares no `EventConfiguration` - several files in the directory are
 * shared helpers or symbol art rather than a map.
 */
export function parseDefinition(file: string, source: string): DefinedMap | null {
  // The name may be single- or double-quoted: an apostrophe in the name forces double quotes, as in
  // `name: "Men's Basketball"`. Matching only single quotes missed both basketball maps, which is
  // how #1427 found this - the scoped run refused to narrow rather than narrowing wrongly.
  const configuration = source.match(
    /: EventConfiguration = \{\r?\n\s+id: '([^']+)',\r?\n\s+name: (?:'([^']*)'|"([^"]*)")/
  );

  if (!configuration) {
    return null;
  }

  const name = configuration[2] ?? configuration[3];

  // The route section is `mapSegment`'s, given what the discover block declares: its section (`mapType` or `mapTypes`)
  // and its `type`, which defaults to `event`.
  const discover = source.slice(source.indexOf('discover: {'));
  const mapTypes = discover.match(/\bmapTypes: \[([^\]]*)\]/)?.[1];

  const segment = mapSegment({
    type: discover.match(/\btype: '([a-z-]+)'/)?.[1] ?? 'event',
    mapType: discover.match(/\bmapType: '([a-z-]+)'/)?.[1],
    mapTypes: mapTypes === undefined ? undefined : [...mapTypes.matchAll(/'([a-z-]+)'/g)].map((match) => match[1])
  });

  return {
    id: configuration[1],
    name,
    file,
    route: `/${segment}/${configuration[1]}`,
    retired: RETIRED_MARKER.test(source)
  };
}

/** Every map the definitions declare, retired ones included. */
export function definedMaps(): DefinedMap[] {
  return fs
    .readdirSync(DEFINITIONS_DIR)
    .filter((file) => file.endsWith('.definitions.ts'))
    .map((file) => parseDefinition(file, fs.readFileSync(path.join(DEFINITIONS_DIR, file), 'utf8')))
    .filter((map): map is DefinedMap => map !== null);
}
