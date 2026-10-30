import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Sections of the app that are not ready for production (#1090).
 *
 * `TestingService` treats a host containing `dev` or `localhost` as development, so the same build
 * renders two variants: one with these sections and one without. Nothing asserted that the second
 * variant actually hid them, and the Bus Routes tab was shipping to production as a result - a button
 * that opened a panel apologising for being unavailable.
 *
 * Listed by the title the sidebar tab renders, because that is what a visitor sees and what a template
 * change is most likely to get wrong. When a section goes to production, take it out of this list; the
 * checks then require it to be present everywhere instead.
 */
export const DEVELOPMENT_ONLY_SECTIONS = ['Directions', 'Bus Routes', 'Experiments'];

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
export const DEVELOPMENT_ONLY_ALL_MAPS_TILES = ['Code Maroon'];

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
 */
export const DEVELOPMENT_ONLY_SERVICES: Record<
  string,
  { reason: string; pages: string[]; developmentGisServer?: true }
> = {
  // The September cache, still offered in the development gallery so it can be compared with the October one
  // (#2436), which became production's default with #2515 and is no longer listed here. No page requests it until a visitor picks it, so it lists no pages: the check that
  // production never requests it still applies, and the dev side is covered by the gallery's own spec.
  'Hosted/VTBase/VectorTileServer': {
    reason: '#1229, #2436: the previous vector tile campus basemap, kept for comparison',
    pages: []
  },
  // The Code Maroon emergency feed, proxied through this origin. Production must never request it:
  // the proof of concept is not something to show the public, and an emergency alert drawn by an
  // unfinished feature is a worse failure than most. #1289. The application shell polls it, so every
  // page requests it.
  '/code-maroon/feed.xml': {
    reason: '#1289: the Code Maroon proof of concept',
    pages: ['/map', '/parking/visitor-parking', '/events/tailgating']
  },
  // The routing network Transportation published for #659. The trip planner connects to it, on the development GIS
  // server, only where development-only features are on. Production's Routing folder is empty, so it must never
  // request this: a trip planner pointed at it there would have directions that nobody has agreed to publish. The
  // planner asks the network which travel modes it supports as soon as it exists, which is the request seen here.
  RoutingProPublish: {
    reason: '#659: the development-only routing network',
    pages: ['/map/d/trip']
  }
  // TS/WomensBasketballParking/MapServer was listed here for #2001, required of /events/womens-basketball on
  // dev. #2143 (#2176) moved that map's development version to the hosted athletics view, reached through the
  // ordinary womensBasketballUrl, so no page requests the MapServer any more and the entry could only fail
  // (#2350). The development-only gate it matched went with it: nothing in the code reads
  // womensBasketballParkingUrl now.
};

/** Whether the environment under test renders the development variant. */
export function developmentSectionsVisible(): boolean {
  const baseUrl = (process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu').replace(/\/$/, '');
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
