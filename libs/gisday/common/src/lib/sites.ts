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
 * - `homeLinks`: the links under Explore Events on the homepage: the how-to video and, where `tamu` is on, the
 *   mentoring sign-up and the TX GIS Hero form. gisday.tamu.edu leaves them out (#2431); txgisday.org keeps them.
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
  | 'tamuLinks'
  | 'homeLinks';

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

  /**
   * The site's own address, such as `https://txgisday.org`, which a link preview names as the page it shows (#2649).
   */
  address: string;

  /** The sentence a link preview shows under the site's name, and that search engines show (#2649). */
  description: string;

  /**
   * The image a link preview shows, relative to the front end's root: 1200 × 630, the size Tradewing, LinkedIn and
   * Facebook crop to, made from the homepage banner (#2649).
   */
  preview: string;

  /** The features this site leaves out. Everything else is on. */
  off: Array<GisdayFeature>;

  /**
   * The address people write to about the event, such as a would-be presenter. A site with none sends them
   * to its Contact page instead (#2077).
   */
  contact?: string;

  /**
   * The Auth0 connection the site signs in with, such as `tradewing`. Auth0 then goes straight to that connection's
   * own sign-in page instead of its page of choices. A site with none shows Auth0's page (#2575).
   */
  signInWith?: string;

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
    address: 'https://txgisday.org',
    description:
      'Three days of workshops and programs celebrating geospatial technology dedicated to students and faculty as they educate, innovate, and collaborate.',
    preview: 'assets/images/sites/txgisday/preview.png',
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
    address: 'https://gisday.tamu.edu',
    description:
      'Three days of workshops and programs celebrating geospatial technology dedicated to students and faculty as they educate, innovate, and collaborate.',
    preview: 'assets/images/sites/tamu/preview.png',
    off: ['homeLinks'],
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
    address: 'https://gisday.ucgis.org',
    // The homepage's first line, until UCGIS sends its own (#2649).
    description:
      'Workshops, demonstrations, and programs from UCGIS member universities, celebrating the advancement of geospatial technology.',
    preview: 'assets/images/sites/ucgis/preview.png',
    off: ['competitions', 'faq', 'sponsors', 'classes', 'checkIns', 'pastYears', 'tamu', 'tamuLinks'],
    // Its deployment names it by key; the address is here too so the site's server can give link previews this
    // site's page (#2649).
    hosts: ['gisday.ucgis.org'],
    // UCGIS's members sign in with their UCGIS Tradewing accounts, and only those; organizers too, with the admin role
    // given to their Tradewing account in Auth0 (decided 5 November 2026, #2575).
    signInWith: 'tradewing'
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

/**
 * The tags at the top of a site's page that link previews and search engines read (#2649). They never run the app,
 * so the page each site serves has to carry its own name, description and image from the start; the app only changes
 * them once it runs in a browser.
 */
export function siteHead(site: GisdaySite): string {
  const text = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const image = `${site.address}/${site.preview}`;

  return [
    `<title>${text(site.name)}</title>`,
    `<meta name="description" content="${text(site.description)}" />`,
    `<meta property="og:site_name" content="${text(site.name)}" />`,
    `<meta property="og:title" content="${text(site.name)}" />`,
    `<meta property="og:description" content="${text(site.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${text(site.address)}/" />`,
    `<meta property="og:image" content="${text(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${text(site.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`
  ].join('\n    ');
}

/** Where a site's head goes in the app's page, between these two comments. */
export const SITE_HEAD_START = '<!-- site head -->';
export const SITE_HEAD_END = '<!-- /site head -->';

/**
 * The app's page with a site's head in place of whatever was between the markers. A page without both markers is an
 * error rather than a page left as it was, since that page would quietly show txgisday.org to every link preview.
 */
export function withSiteHead(page: string, site: GisdaySite): string {
  const start = page.indexOf(SITE_HEAD_START);
  const end = page.indexOf(SITE_HEAD_END);

  if (start < 0 || end < start) {
    throw new Error(`The page has no ${SITE_HEAD_START} ... ${SITE_HEAD_END} block to put ${site.name}'s head in.`);
  }

  return page.slice(0, start + SITE_HEAD_START.length) + '\n    ' + siteHead(site) + '\n    ' + page.slice(end);
}
