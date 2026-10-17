/**
 * The parts of GIS Day that a site can leave out (#1835).
 *
 * - `competitions`: the Competitions menu and pages, the profile's Student Competitions, and the
 *   competition and submission endpoints.
 * - `faq`: the FAQ page.
 * - `sponsors`: the Sponsor menu and pages, and the homepage's sponsor section.
 * - `classes`: the profile's Classes, and the class endpoints.
 * - `checkIns`: event check-in, the profile's Check-ins, and the check-in endpoints.
 */
export type GisdayFeature = 'competitions' | 'faq' | 'sponsors' | 'classes' | 'checkIns';

/**
 * One deployment of the GIS Day site: its name, its images, and the features it leaves out.
 *
 * Every site runs the same image. A deployment picks its site by key (`ANGULAR_SITE` for the front
 * end, `GISDAY_SITE` for the API), and anything it does not name, or a key that is not here, is
 * txgisday.org.
 */
export interface GisdaySite {
  /** As it appears in the header, on the homepage and in the browser tab, such as "TxGIS Day". */
  name: string;

  /** The logo in the header and on the homepage, relative to the front end's root. */
  logo: string;

  /** The browser tab's icon, relative to the front end's root. */
  favicon: string;

  /** The features this site leaves out. Everything else is on. */
  off: Array<GisdayFeature>;
}

export const GISDAY_SITES = {
  txgisday: {
    name: 'TxGIS Day',
    logo: 'assets/images/2022-TIN-sq-1080px.png',
    favicon: 'favicon.ico',
    off: []
  }
} satisfies Record<string, GisdaySite>;

/**
 * The site a deployment's key names, or txgisday.org's for any key that is missing or unknown, so a
 * deployment with no key set, or a placeholder that was never replaced, is the main site.
 */
export function gisdaySite(key?: string): GisdaySite {
  return GISDAY_SITES[key as keyof typeof GISDAY_SITES] ?? GISDAY_SITES.txgisday;
}

export function siteHas(site: GisdaySite, feature: GisdayFeature): boolean {
  return !site.off.includes(feature);
}
