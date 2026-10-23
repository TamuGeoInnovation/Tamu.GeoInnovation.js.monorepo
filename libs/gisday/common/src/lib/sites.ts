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
 *   Bank on the About page, the High School Portal, the homepage's mentoring and TX GIS Hero links, and
 *   the Texas A&M wording on the homepage, About page and footer.
 * - `tamuLinks`: the university's and state's required links in the footer. Texas A&M runs txgisday.org
 *   as well as its own site, so both keep them (#2012).
 */
export type GisdayFeature =
  | 'competitions'
  | 'faq'
  | 'sponsors'
  | 'classes'
  | 'checkIns'
  | 'pastYears'
  | 'tamu'
  | 'tamuLinks';

/**
 * One deployment of the GIS Day site: its name, its images, and the features it leaves out.
 *
 * Every site runs the same image. A deployment picks its site by key (`ANGULAR_SITE` for the front
 * end, `GISDAY_SITE` for the API), and anything it does not name, or a key that is not here, is
 * txgisday.org. A site can also be chosen by the address it is reached at (`hosts`), so one deployment
 * can serve more than one site: txgisday.org's also answers for Texas A&M's (#2012).
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

  /**
   * The address people write to about the event, such as a would-be presenter. A site with none sends them
   * to its Contact page instead (#2077).
   */
  contact?: string;

  /**
   * The addresses that show this site whatever the deployment's key, such as `gisday.tamu.edu`. A site
   * with none is reached only by its key.
   */
  hosts?: Array<string>;

  /**
   * The university brand the site wears in place of GIS Day's blue and its own logo: `tamu` is Texas A&M's
   * maroon, with the university's lockup in the header, as AggieMap has (#2012).
   */
  brand?: 'tamu';

  /**
   * The organizations whose sessions this site lists, by the name of their place, such as "Texas A&M University
   * GIS Day(s)". An event belongs to an organization through its location's place. A site with none lists every
   * organization's sessions (#2142).
   */
  sessionsFrom?: Array<string>;
}

export const GISDAY_SITES = {
  txgisday: {
    name: 'TxGIS Day',
    logo: 'assets/images/2022-TIN-sq-1080px.png',
    banner: 'assets/images/2022-TIN-sq-1080px.png',
    owner: 'GeoInnovation Service Center',
    favicon: 'favicon.ico',
    off: [],
    contact: 'gis@tamu.edu'
  },
  // gisday.tamu.edu, Texas A&M's own GIS Day, in the university's brand (#2012). It is served by txgisday.org's
  // deployment and shares its database; the address alone decides which site a visitor sees.
  tamu: {
    name: 'Texas A&M GIS Day',
    logo: 'assets/images/logo/TAM-LogoBox.svg',
    banner: 'assets/images/logo/TAM-LogoBox.svg',
    owner: 'GeoInnovation Service Center',
    favicon: 'assets/images/logo/TAM-LogoBox.svg',
    off: [],
    contact: 'gis@tamu.edu',
    hosts: ['gisday.tamu.edu', 'tamu.txgisday.org'],
    brand: 'tamu',
    // It shares txgisday.org's database, where every organization's sessions can be entered, so it lists only
    // Texas A&M's (#2142).
    sessionsFrom: ['Texas A&M University GIS Day(s)']
  },
  // gisday.ucgis.org, for UCGIS member universities (#1837). Its images are UCGIS's own, from its websites; the
  // banner's white surround was made transparent so it sits on the homepage's background.
  ucgis: {
    name: 'UCGIS GIS Day',
    logo: 'assets/images/sites/ucgis/logo.png',
    banner: 'assets/images/sites/ucgis/banner.png',
    owner: 'University Consortium for Geographic Information Science',
    favicon: 'assets/images/sites/ucgis/favicon.png',
    off: ['competitions', 'faq', 'sponsors', 'classes', 'checkIns', 'pastYears', 'tamu', 'tamuLinks']
  }
} satisfies Record<string, GisdaySite>;

/**
 * The site a deployment's key names, or txgisday.org's for any key that is missing or unknown, so a
 * deployment with no key set, or a placeholder that was never replaced, is the main site.
 *
 * Given the address the site was reached at, a site listing that address in `hosts` wins over the key,
 * so gisday.tamu.edu is Texas A&M's site although its deployment is txgisday.org's (#2012).
 */
export function gisdaySite(key?: string, host?: string): GisdaySite {
  const byHost = host
    ? Object.values(GISDAY_SITES).find((site: GisdaySite) => site.hosts?.includes(host.toLowerCase()))
    : undefined;

  return byHost ?? GISDAY_SITES[key as keyof typeof GISDAY_SITES] ?? GISDAY_SITES.txgisday;
}

export function siteHas(site: GisdaySite, feature: GisdayFeature): boolean {
  return !site.off.includes(feature);
}

/**
 * The guids of the places, among those given, whose sessions the site lists, or null when it lists every
 * organization's (#2142). Names are matched ignoring case and surrounding spaces.
 */
export function siteSessionPlaces(site: GisdaySite, places: Array<{ guid?: string; name?: string }>): Array<string> | null {
  if (!site.sessionsFrom) {
    return null;
  }

  const names = site.sessionsFrom.map((name) => name.trim().toLowerCase());

  return (places ?? [])
    .filter((place) => place?.guid && place.name && names.includes(place.name.trim().toLowerCase()))
    .map((place) => place.guid as string);
}
