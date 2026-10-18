/**
 * The parts of GIS Day that a site can leave out (#1835).
 *
 * - `competitions`: the Competitions menu and pages, the profile's Student Competitions, and the
 *   competition and submission endpoints.
 * - `faq`: the FAQ page.
 * - `sponsors`: the Sponsor menu and pages, and the homepage's sponsor section.
 * - `classes`: the profile's Classes, and the class endpoints.
 * - `checkIns`: event check-in, the profile's Check-ins, and the check-in endpoints.
 * - `pastYears`: the footer's Past Years, and past years' pages (`/seasons/<year>`, `/wayback`).
 * - `tamu`: what only Texas A&M's site has: the Organizing Committee, Student Opportunities and Resume
 *   Bank on the About page, the High School Portal, the homepage's mentoring and TX GIS Hero links, the
 *   Texas wording on the homepage and About page, and the university's and state's required links in
 *   the footer.
 */
export type GisdayFeature = 'competitions' | 'faq' | 'sponsors' | 'classes' | 'checkIns' | 'pastYears' | 'tamu';

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

  /** The small square logo beside the name in the header, relative to the front end's root. */
  logo: string;

  /** The large image in the middle of the homepage, relative to the front end's root. */
  banner: string;

  /** Who runs the site, for the footer's copyright line. */
  owner: string;

  /** The browser tab's icon, relative to the front end's root. */
  favicon: string;

  /** The features this site leaves out. Everything else is on. */
  off: Array<GisdayFeature>;
}

export const GISDAY_SITES = {
  txgisday: {
    name: 'TxGIS Day',
    logo: 'assets/images/2022-TIN-sq-1080px.png',
    banner: 'assets/images/2022-TIN-sq-1080px.png',
    owner: 'GeoInnovation Service Center',
    favicon: 'favicon.ico',
    off: []
  },
  // gisday.ucgis.org, for UCGIS member universities (#1837). Its images are UCGIS's own, from its websites; the
  // banner's white surround was made transparent so it sits on the homepage's background.
  ucgis: {
    name: 'UCGIS GIS Day',
    logo: 'assets/images/sites/ucgis/logo.png',
    banner: 'assets/images/sites/ucgis/banner.png',
    owner: 'University Consortium for Geographic Information Science',
    favicon: 'assets/images/sites/ucgis/favicon.png',
    off: ['competitions', 'faq', 'sponsors', 'classes', 'checkIns', 'pastYears', 'tamu']
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
