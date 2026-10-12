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
 * Whether a request URL went to a development host.
 *
 * A URL that will not parse is not a development host: this decides whether to fail a run, and a
 * malformed URL is not evidence of the thing being looked for.
 */
export function isDevelopmentHostRequest(url: string): boolean {
  try {
    return isDevelopmentHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * Whether the environment under test is itself a development one, in which case requests to
 * development hosts are expected and nothing is asserted.
 *
 * One-directional on purpose. Development legitimately requests production services - `tsgisHost` is
 * forced to the production host for every environment, and the campus maps are hard-coded to
 * `gis.tamu.edu` in both - so "development must use only development hosts" is not true and must not
 * be asserted.
 */
export function environmentIsDevelopment(baseUrl: string): boolean {
  try {
    return isDevelopmentHostname(new URL(baseUrl).hostname);
  } catch {
    return false;
  }
}
