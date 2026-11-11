import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { smokeBaseUrl } from './gis-hosts';

/**
 * Sections of the app that are not ready for production (#1090).
 *
 * `TestingService` treats a host containing `dev` or `localhost` as development, so the same build
 * renders two variants: one with these sections and one without. Nothing asserted that the second
 * variant actually hid them, and the Bus Routes tab was shipping to production as a result - a button
 * that opened a panel apologising for being unavailable.
 *
 * Listed by the title the sidebar tab renders, because that is what a visitor sees and what a template
 * change is most likely to get wrong. When a section goes to production, move it from this list to
 * `SECTIONS_ON_EVERY_ENVIRONMENT`, whose check requires it to be present everywhere instead. Taking it out of
 * this list alone only stops checking it.
 */
export const DEVELOPMENT_ONLY_SECTIONS = ['Experiments'];

/**
 * Sections that were development-only and now are on every environment, production included, so a gate put back
 * by mistake fails here rather than hiding the section quietly. Bus Routes since the maintainer's decision of
 * 9 November 2026 (#2789); Directions since the routing network was published on production (#2804).
 */
export const SECTIONS_ON_EVERY_ENVIRONMENT = ['Bus Routes', 'Directions'];

/**
 * Tiles in the All Maps page's "Visit Maps" row that are not ready for production (#912).
 *
 * A fourth list rather than an entry in `DEVELOPMENT_ONLY_SECTIONS`, because that one is sidebar tabs
 * on `/map` and these are links on `/all-maps`. The row moved into `VisitMapsNavComponent` and is now
 * rendered on every Maps page, so a tile that loses its gate loses it in more places than before -
 * which is the reason to assert it rather than read the template and assume.
 *
 * Listed by the label the tile renders. When a tile goes to production, take it out of this list; the
 * check then requires it to be present everywhere instead.
 */
export const DEVELOPMENT_ONLY_ALL_MAPS_TILES = ['Code Maroon', 'Transportation'];

/**
 * Pages that are not ready for production, which must not open there, each with where production lands instead
 * (#2788, #2801).
 *
 * Hiding a link leaves its page answering its address, so each page here is gated on its route too (`developmentOnly`
 * in the route's `data`, with the `developmentOnlyRoute` guard, which sends it one segment up its address) and opened by address.
 *
 * - The Transportation section lists only development-only maps, so on production it was a reachable, empty category.
 * - The trip planner's Options offers only accessible routing, which the routing network does not support yet.
 */
export const DEVELOPMENT_ONLY_PAGES: Record<string, string> = {
  '/all-maps/transportation': '/all-maps',
  '/map/d/trip/options': '/map/d/trip'
};

/**
 * Controls drawn on the map itself that are not ready for production, each with the issue keeping it
 * off and the address that should bring it up (#1541).
 *
 * `DEVELOPMENT_ONLY_SECTIONS` covers the sidebar's tabs and `DEVELOPMENT_ONLY_SERVICES` the services
 * a page requests. A control on the map is neither: it has no tab, and the Aerial Imagery date slider
 * asks for nothing new - it reads the captures out of the WMS capabilities the basemap already
 * fetches - so no list here would have noticed it reaching production.
 *
 * `page` carries whatever brings the control up, which for the date slider is the link it writes
 * itself: `?imagery=<date>` opens Aerial Imagery on that capture. Testing it through the link rather
 * than through the basemap gallery asks the sharper question, because a link is the way a visitor
 * would meet a development-only control without looking for it - someone shares one, and on
 * production it must do nothing.
 *
 * When a control goes to production, take it out of this list and out of the code's gate together;
 * the checks then require it to be present everywhere instead.
 */
export const DEVELOPMENT_ONLY_CONTROLS: Array<{
  name: string;
  selector: string;
  page: string;
  reason: string;
}> = [
  {
    name: 'the dated raster campus basemaps in the gallery',
    // One of them is enough: they are offered together or not at all.
    selector: '.basemap-title:text-is("Aggieland raster, October 2026")',
    page: '/map/d/settings',
    reason: '#1582: production offers one campus basemap; the dated versions are for comparing on dev'
  },
  {
    // A real check since the trip planner is on production (#2804): until then the planner was hidden there, and this
    // passed whether or not the link was gated (#2801). The mode picker's unit test proves the link's gate as well.
    name: "the trip planner's Options link",
    selector: '.options-container .action:text-is("Options")',
    page: '/map/d/trip',
    reason: '#2801: Options offers only accessible routing, which the routing network does not support yet'
  },
  {
    // ThemePickerComponent renders nothing where ThemeService.enabled is false (TestingService), and the page then
    // stays light whatever a visitor stored. The phone menu shows the same component, so one page proves the gate.
    name: 'the Appearance choice (dark mode)',
    selector: 'tamu-gisc-theme-picker .theme-picker',
    page: '/map/d/settings',
    reason: '#2865: dark mode, until the maintainer approves it for production'
  }
];

/**
 * GIS services with no production counterpart, each with the issue that keeps it off production and
 * the pages that request it.
 *
 * A service is not visible on production unless it is explicitly allowed, and this list is how it is
 * not allowed: production must make no request to any of them from any page listed here, and
 * development must request each one from every page it lists, so the check is proven able to see one.
 * Matched against request URLs as a substring. When a service is published for production, take it
 * out of this list and out of the code's development-only gate together.
 *
 * `pages` lists only the pages that really request the service. A service one map alone uses is
 * required of that map, not of every page (#1460: the Tailgating zones were required of the main map).
 *
 * `developmentGisServer` marks a service published only on the development GIS server, which a page
 * draws wherever it reads that server (`readsDevelopmentGisServer()` in connections.ts): a dev host,
 * but not localhost, which reads production's. It is required only where that server is read, and
 * forbidden everywhere else (#2001).
 *
 * `runTimeGate` names where the code hides a service gated at run time (`TestingService`), for those that no build-time
 * gate covers. A unit test (`development-only-gates.spec.ts` in `aggiemap-ngx-discover`) requires every entry to be
 * matched by a build-time gate - a layer in `DEVELOPMENT_ONLY_LAYER_SOURCES` or a map with `developmentOnly` - or to
 * say where its run-time gate is, and not both (#2753). It can read that a run-time gate is declared, not that the code
 * still has it: this smoke check is what proves that.
 */
export const DEVELOPMENT_ONLY_SERVICES: Record<
  string,
  { reason: string; pages: string[]; developmentGisServer?: true; runTimeGate?: string }
> = {
  // The September cache, still offered in the development gallery so it can be compared with the October one
  // (#2436), which became production's default with #2515 and is no longer listed here. No page requests it until a visitor picks it, so it lists no pages: the check that
  // production never requests it still applies, and the dev side is covered by the gallery's own spec.
  'Hosted/VTBase/VectorTileServer': {
    reason: '#1229, #2436: the previous vector tile campus basemap, kept for comparison',
    pages: [],
    runTimeGate: 'aggiemapGalleryBasemaps(isTesting) in libs/maps/feature/basemap/src/lib/shared/basemaps.definition.ts'
  },
  // The Code Maroon emergency feed, proxied through this origin. Production must never request it:
  // the proof of concept is not something to show the public, and an emergency alert drawn by an
  // unfinished feature is a worse failure than most. #1289. The application shell polls it, so every
  // page requests it.
  '/code-maroon/feed.xml': {
    reason: '#1289: the Code Maroon proof of concept',
    pages: ['/map', '/parking/visitor-parking', '/events/tailgating'],
    runTimeGate: 'isTesting in CodeMaroonAlertComponent (libs/aggiemap/ngx/core)'
  },
  // Nature Rx, which is on the map but not finished (#2673). Unlike everything else here, the service is
  // production's own and public - what is not ready is the feature, so a production build leaves the layer
  // and its two search sources out of the bundle altogether (`development-only-sources.ts`) rather than
  // hiding them. It lists no pages because the layer is off until a visitor turns it on, so nothing requests
  // it unprompted; the check that production never requests it still applies, and the layer's own unit spec
  // covers both sides of the gate.
  'Hosted/NatureRx_view/FeatureServer': {
    reason: '#2673: Nature Rx is on the map but not ready for production',
    pages: []
  },
  // Transportation's Micromobility map (#2712), on its approved paths service (#2812), which is published on the
  // development GIS server only and named there outright, so localhost requests it too. What is not ready is the map,
  // which `developmentOnly` keeps off production as a whole: it is listed nowhere there and its link opens the main
  // map. So production must never request this, and development requests it from the map's link.
  // The main map has it too, as a group off until a visitor turns it on (#2739), which a production build leaves out
  // (`development-only-sources.ts`). Off or not, the main map asks for its three layers' descriptions as it loads, so
  // development requests it from `/map` unprompted and production, which must not, is checked there.
  'Hosted/Approved_Micromobility_Paths_view/FeatureServer': {
    reason: '#2712, #2739, #2812: the Micromobility map, and its layers on the main map',
    pages: ['/transportation/micromobility', '/map']
  },
  // The NCAA Volleyball 1st & 2nd Round map (#2713), published on the development GIS server only and kept off
  // production by `developmentOnly` until Texas A&M is announced as a host on 29 November. Named on that server
  // outright, so localhost requests it too and `developmentGisServer` does not apply.
  'Hosted/NCAA_Volleyball_view/FeatureServer': {
    reason: '#2713: the NCAA Volleyball map, until Texas A&M is announced as a host',
    pages: ['/parking/ncaa-volleyball']
  }
  // TS/WomensBasketballParking/MapServer was listed here for #2001, required of /events/womens-basketball on
  // dev. #2143 (#2176) moved that map's development version to the hosted athletics view, reached through the
  // ordinary womensBasketballUrl, so no page requests the MapServer any more and the entry could only fail
  // (#2350). The development-only gate it matched went with it: nothing in the code reads
  // womensBasketballParkingUrl now.
};

/**
 * Maps hidden from production's listings for a reason of their own, not because they are unfinished (#2753).
 *
 * `visible: false` on a map's Discover entry lists it where development-only features are on and nowhere else, which is
 * also how a development-only map is listed. A unit test (`development-only-gates.spec.ts`) requires every map hidden that
 * way to be checked by this suite - its route in a `DEVELOPMENT_ONLY_SERVICES` entry's `pages`, or a
 * `DEVELOPMENT_ONLY_CONTROLS` link to it - or to be here, with why. So a hidden map is never hidden by accident, and one
 * listed here and no longer hidden fails too.
 */
export const LISTINGS_HIDDEN_FROM_PRODUCTION: Record<string, string> = {
  '/events/april-ring-day':
    'hidden by #899 (All Maps overhaul, 5 August 2026) with no reason recorded; ask before listing it',
  '/events/move-out':
    '#1691, #1704: hidden while its three dated periods are reviewed, so the page offers one entry per move-out',
  // It was checked by a control on the Transportation section's page, which production cannot open since #2788, so
  // that check could only time out. Sustainable Transportation's listing went the same way and needs no entry: its map
  // is `developmentOnly`, and the development-only map check opens its address (#2801).
  '/map/d/bus':
    '#2743, #1229: bus routes are development-only, and its only listing is in the Transportation section, itself development-only (#2788)'
};

/** Whether the environment under test renders the development variant. */
export function developmentSectionsVisible(): boolean {
  const baseUrl = smokeBaseUrl();
  const environments: Record<string, { baseUrl: string; developmentSectionsVisible?: boolean }> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === baseUrl);

  if (match?.developmentSectionsVisible === undefined) {
    throw new Error(`environments.json does not say whether development-only sections are visible on ${baseUrl}`);
  }

  return match.developmentSectionsVisible;
}

/** How many sidebar tabs with this title the page is rendering. A tab renders its title as `title`. */
export async function sidebarTabs(page: Page, title: string): Promise<number> {
  return page.locator(`tamu-gisc-sidebar-tab [title="${title}"]`).count();
}
