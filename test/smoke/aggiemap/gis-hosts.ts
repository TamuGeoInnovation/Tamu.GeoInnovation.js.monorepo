/**
 * Which GIS host a request went to, and whether that host belongs to a development environment
 * (#1483).
 *
 * The application picks its GIS host from its own hostname: `getDefaultGisHosts()` in
 * `connections.ts` treats a hostname containing `dev` as development and reaches for
 * `gis-dev.it.tamu.edu`. A URL hard-coded in a definition escapes that mechanism entirely, and until
 * this existed nothing noticed. `development-only.spec.ts` only checks a named list of services, and
 * `services.spec.ts` probes connections directly rather than watching what a page asks for - so a
 * layer pointed at a development host would have shipped to production with every check green.
 *
 * The failure it guards against is a quiet one: the layer works for anyone inside the network and is
 * missing or stale for everyone else.
 */

/**
 * A hostname belongs to a development environment when one of its dot- or dash-separated parts is
 * exactly `dev`.
 *
 * Matches `gis-dev.it.tamu.edu`, `arc.ts-dev.tamu.edu` and `dev.aggiemap.tamu.edu`. Does not match
 * `gis.tamu.edu`, `arc.ts.tamu.edu` or `aggiemap.tamu.edu`, and does not match a host that merely
 * begins with those letters, such as `devices.example.com` - a substring test would, and would then
 * fail a run for a host that is nothing to do with us.
 */
const DEVELOPMENT_HOST = /(^|[.-])dev([.-]|$)/i;

/** Whether a hostname is a development host. */
export function isDevelopmentHostname(hostname: string): boolean {
  return DEVELOPMENT_HOST.test(hostname);
}

/**
 * Whether a URL's host is a development host: a request a page made, or the environment under test.
 *
 * A URL that will not parse is not a development host: this decides whether to fail a run, and a
 * malformed URL is not evidence of the thing being looked for.
 *
 * For the environment under test, a development one is expected to request development hosts, so
 * nothing is asserted. That is one-directional on purpose. Development legitimately requests
 * production services - `tsgisHost` is forced to the production host for every environment, and the
 * campus maps are hard-coded to `gis.tamu.edu` in both - so "development must use only development
 * hosts" is not true and must not be asserted.
 */
export function isDevelopmentUrl(url: string): boolean {
  try {
    return isDevelopmentHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** The GIS host the application picks for an environment, as `getDefaultGisHosts()` does. */
export function gisHostFor(baseUrl: string): 'gis-dev.it.tamu.edu' | 'gis.it.tamu.edu' {
  return isDevelopmentUrl(baseUrl) ? 'gis-dev.it.tamu.edu' : 'gis.it.tamu.edu';
}

const DEFAULT_BASE_URL = 'https://aggiemap.tamu.edu';

/**
 * The environment under test: `AGGIEMAP_SMOKE_BASE_URL`, production when unset, without surrounding
 * space or trailing slashes (#2604).
 *
 * Every spec reads it here and nowhere else, so a trailing slash cannot reach one spec and not another,
 * and `${baseUrl}/map` and the `environments.json` lookup both work without each caller stripping it.
 */
export function smokeBaseUrl(env: Record<string, string | undefined> = process.env): string {
  const given = env.AGGIEMAP_SMOKE_BASE_URL?.trim();

  return (given || DEFAULT_BASE_URL).replace(/\/+$/, '');
}
