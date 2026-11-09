import * as fs from 'fs';
import * as path from 'path';

import { LayerSource } from '@tamu-gisc/common/types';
import { DEVELOPMENT_ONLY_LAYER_SOURCES, factory } from '@tamu-gisc/aggiemap/ngx/common';
import { EventDefinitions } from '@tamu-gisc/ts/events/ngx';

// The smoke suite's own lists, read where they are kept rather than copied: comparing them with the code is this test's
// whole purpose, and a copy would drift as the comments this replaces did. The suite is not an Nx project and its lists
// are TypeScript with their reasons beside them, so the import is relative (#2753).
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  DEVELOPMENT_ONLY_ALL_MAPS_PAGES,
  DEVELOPMENT_ONLY_ALL_MAPS_TILES,
  DEVELOPMENT_ONLY_CONTROLS,
  DEVELOPMENT_ONLY_SERVICES,
  LISTINGS_HIDDEN_FROM_PRODUCTION
} from '../../../../../../test/smoke/aggiemap/development-only';
import { getApplicationRoute } from './components/discover.utils';
import { VISIT_MAPS_TILES } from './components/visit-maps-nav/visit-maps-nav.component';
import { discoverRoutes } from './discover.routes';
import { DiscoveryService } from './services/discovery/discovery.service';

/**
 * The two ways to keep something off production, and the smoke suite's lists that prove them, agree (#2753).
 *
 * The rule: **a thing that reads a service is left out of a production build** (`DEVELOPMENT_ONLY_LAYER_SOURCES`, or
 * `developmentOnly` on a map); **structure is gated at run time** with `TestingService` (`visible: false` on a listing,
 * `isTesting` in a template). The smoke suite's lists in `test/smoke/aggiemap/development-only.ts` are what asserts each
 * gate worked on a deployed build. Until this, the two sides were kept together by comments ("take it out of here and
 * out of the smoke suite's list together"), which is #1090's shape: the gate existed and nothing asserted it.
 *
 * **What this cannot see.** A run-time gate inside a template or a service is code, not a list, so it cannot be
 * enumerated: a `DEVELOPMENT_ONLY_SERVICES` entry gated that way declares where (`runTimeGate`), and this test can only
 * read the declaration. `DEVELOPMENT_ONLY_SECTIONS` (sidebar tabs) and controls that are not links to a map have
 * nothing on the build side to compare with, for the same reason. All Maps tiles and pages do (#2788): a tile is
 * development-only by `isDev` in `VISIT_MAPS_TILES`, and a page by `developmentOnly` in its route's `data`. For all of those, the
 * smoke check proving the gate on production is the only check there is.
 */

/** Everything the code keeps off production that can be enumerated. */
interface BuildSide {
  /** Layers a production build leaves out, by definition key, with the addresses they read. */
  excludedLayers: Array<{ name: string; urls: string[] }>;
  /**
   * Maps whose route is development-only (`developmentOnly`), with the addresses their layers read.
   *
   * A map whose services production reads for another map can never be on `DEVELOPMENT_ONLY_SERVICES` - Sustainable
   * Transportation's TS/BikeMap is the main map's too (#2742). It is proven instead by `checkedMaps`: the smoke
   * suite opens its own address and requires it to land under `/map` on production (#2769).
   */
  developmentOnlyMaps: Array<{ route: string; urls: string[] }>;
  /** Maps listed on development and not on production (`visible: false`), by route. */
  hiddenListings: string[];
  /** All Maps tiles rendered only on development (`isDev`), by label. */
  developmentOnlyTiles: string[];
  /** All Maps pages whose route is development-only (`developmentOnly` in its `data`), by address. */
  developmentOnlyPages: string[];
}

/** What the smoke suite asserts. */
interface SuiteSide {
  services: Record<string, { pages: string[]; runTimeGate?: string }>;
  controls: Array<{ name: string; selector: string }>;
  hiddenForOtherReasons: Record<string, string>;
  /**
   * The addresses the smoke suite's development-only map check opens, expecting the main map on production
   * (`development-only.spec.ts`, #2742, #2767). It covers every map `developmentOnly` marks, read from
   * `declared-layers.generated.json`, so it asserts a map whose services production also reads for another map and
   * so can never be on `DEVELOPMENT_ONLY_SERVICES`: Sustainable Transportation's TS/BikeMap is the main map's too.
   */
  checkedMaps: string[];
  /** The All Maps tiles the smoke suite requires absent on production (`DEVELOPMENT_ONLY_ALL_MAPS_TILES`). */
  tiles: string[];
  /** The All Maps pages the smoke suite requires to go back to All Maps on production (`DEVELOPMENT_ONLY_ALL_MAPS_PAGES`). */
  pages: string[];
}

/** The route a control links to, when it is a link to a map: `a.map-entry[href="/map/d/bus"]` names `/map/d/bus`. */
const linkedRoute = (selector: string): string | null => /href="([^"]+)"/.exec(selector)?.[1] ?? null;

/** Every way the two sides disagree, as sentences; empty when they agree. */
function disagreements(build: BuildSide, suite: SuiteSide): string[] {
  const problems: string[] = [];
  const services = Object.entries(suite.services);
  const servicesIn = (urls: string[]) => services.filter(([key]) => urls.some((url) => url.includes(key)));
  const linkedRoutes = suite.controls.map((control) => linkedRoute(control.selector)).filter((route) => route !== null);

  // Build side first: everything the code keeps off production is asserted by the suite.
  for (const layer of build.excludedLayers) {
    if (servicesIn(layer.urls).length === 0) {
      problems.push(
        `${layer.name} is left out of a production build, but no DEVELOPMENT_ONLY_SERVICES entry matches ${layer.urls.join(', ')}`
      );
    }
  }

  for (const map of build.developmentOnlyMaps) {
    const asserted =
      suite.checkedMaps.includes(map.route) || servicesIn(map.urls).some(([, service]) => service.pages.includes(map.route));

    if (!asserted) {
      problems.push(
        `${map.route} is development-only, but neither the smoke suite's development-only map check nor a DEVELOPMENT_ONLY_SERVICES entry for its layers opens it`
      );
    }
  }

  for (const route of build.hiddenListings) {
    const asserted =
      services.some(([, service]) => service.pages.includes(route)) ||
      suite.checkedMaps.includes(route) ||
      linkedRoutes.includes(route) ||
      route in suite.hiddenForOtherReasons;

    if (!asserted) {
      problems.push(
        `${route} is hidden from production's listings (visible: false), but the suite checks it nowhere: list its route ` +
          `in a service's pages, add a DEVELOPMENT_ONLY_CONTROLS link to it, or say why in LISTINGS_HIDDEN_FROM_PRODUCTION`
      );
    }
  }

  // Then the suite: everything it asserts is gated by something it can name.
  for (const [key, service] of services) {
    const urls = [...build.excludedLayers, ...build.developmentOnlyMaps].flatMap((gated) => gated.urls);
    const gatedAtBuild = urls.some((url) => url.includes(key));

    if (!gatedAtBuild && !service.runTimeGate) {
      problems.push(
        `DEVELOPMENT_ONLY_SERVICES['${key}'] is gated by nothing: no excluded layer or development-only map reads it, and it declares no runTimeGate`
      );
    }

    if (gatedAtBuild && service.runTimeGate) {
      problems.push(
        `DEVELOPMENT_ONLY_SERVICES['${key}'] is left out at build time and also declares a runTimeGate; one of them is stale`
      );
    }
  }

  for (const route of linkedRoutes) {
    if (!build.hiddenListings.includes(route)) {
      problems.push(
        `a DEVELOPMENT_ONLY_CONTROLS link to ${route} expects it hidden on production, but its listing is not visible: false`
      );
    }
  }

  for (const route of Object.keys(suite.hiddenForOtherReasons)) {
    if (!build.hiddenListings.includes(route)) {
      problems.push(`LISTINGS_HIDDEN_FROM_PRODUCTION names ${route}, which is not hidden: take it out`);
    }
  }

  // All Maps tiles and pages, both ways (#2788).
  for (const [gated, checked, gate, list] of [
    [build.developmentOnlyTiles, suite.tiles, 'isDev', 'DEVELOPMENT_ONLY_ALL_MAPS_TILES'],
    [build.developmentOnlyPages, suite.pages, 'developmentOnly in its route data', 'DEVELOPMENT_ONLY_ALL_MAPS_PAGES']
  ] as const) {
    for (const name of gated.filter((name) => !checked.includes(name))) {
      problems.push(`${name} is development-only (${gate}), but ${list} does not name it, so nothing proves it off production`);
    }

    for (const name of checked.filter((name) => !gated.includes(name))) {
      problems.push(`${list} names ${name}, which is not development-only (${gate}): gate it, or take it out`);
    }
  }

  return problems;
}

/** Every address a layer source reads, its group's children included. */
const urlsOf = (sources: Array<LayerSource & { sources?: Array<LayerSource> }> | null | undefined): string[] =>
  (sources ?? []).flatMap((source) => [...(source.url ? [source.url] : []), ...urlsOf(source.sources)]);

/** The build side, read from the code as a development build has it. */
function buildSide(): BuildSide {
  const { Definitions, LayerSources } = factory({ environment: 'dev' });
  const listings = new DiscoveryService().getInternalDiscoverApplications();

  return {
    excludedLayers: DEVELOPMENT_ONLY_LAYER_SOURCES.map(({ definition }) => {
      const layerId = Definitions[definition].layerId;

      return {
        name: definition,
        urls: [Definitions[definition].url, ...urlsOf(LayerSources.filter((source) => source.id === layerId))]
      };
    }),
    developmentOnlyMaps: EventDefinitions.filter((event) => event.developmentOnly && event.configuration).map((event) => {
      const listing = listings.find((app) => app.configuration?.id === event.configuration.id);

      return {
        route: listing ? getApplicationRoute(listing).join('/') : `/${event.configuration.id}`,
        urls: urlsOf(event.sources)
      };
    }),
    hiddenListings: listings.filter((app) => app.visible === false).map((app) => getApplicationRoute(app).join('/')),
    developmentOnlyTiles: VISIT_MAPS_TILES.filter((tile) => tile.isDev).map((tile) => tile.label),
    developmentOnlyPages: discoverRoutes.filter((route) => route.data?.['developmentOnly']).map((route) => `/all-maps/${route.path}`)
  };
}

const DECLARED: Record<string, { address?: string }> = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../../../../test/smoke/aggiemap/declared-layers.generated.json'), 'utf8')
);

const SUITE: SuiteSide = {
  services: DEVELOPMENT_ONLY_SERVICES,
  controls: DEVELOPMENT_ONLY_CONTROLS,
  hiddenForOtherReasons: LISTINGS_HIDDEN_FROM_PRODUCTION,
  checkedMaps: Object.values(DECLARED).flatMap((map) => (map.address ? [map.address] : [])),
  tiles: DEVELOPMENT_ONLY_ALL_MAPS_TILES,
  pages: DEVELOPMENT_ONLY_ALL_MAPS_PAGES
};

describe('development-only gates and the smoke suite agree (#2753)', () => {
  it('in the repository as it is', () => {
    expect(disagreements(buildSide(), SUITE)).toEqual([]);
  });

  it('reads both kinds of build-time gate, so the agreement above is not empty', () => {
    const build = buildSide();

    expect(build.excludedLayers.map((layer) => layer.name)).toEqual(expect.arrayContaining(['NATURE_RX', 'MICROMOBILITY']));
    expect(build.developmentOnlyMaps.map((map) => map.route)).toEqual(
      expect.arrayContaining(['/transportation/micromobility', '/parking/ncaa-volleyball', '/transportation/sustainable-transportation'])
    );
    expect(build.developmentOnlyTiles).toEqual(expect.arrayContaining(['Code Maroon', 'Transportation']));
    expect(build.developmentOnlyPages).toEqual(['/all-maps/transportation']);
  });
});

/**
 * The check itself, on small cases. The first is the shape of the bus map (#2743): a listing gated at run time
 * (`visible: false`), with no service of its own, asserted by a `DEVELOPMENT_ONLY_CONTROLS` link rather than by the
 * services list - the choice that entry made among four lists, which the check has to be able to express.
 */
describe('the cross-check', () => {
  const none: BuildSide = {
    excludedLayers: [],
    developmentOnlyMaps: [],
    hiddenListings: [],
    developmentOnlyTiles: [],
    developmentOnlyPages: []
  };
  const empty: SuiteSide = { services: {}, controls: [], hiddenForOtherReasons: {}, checkedMaps: [], tiles: [], pages: [] };

  it('fails an All Maps tile or page gated in the code that the suite does not check, and the reverse (#2788)', () => {
    expect(disagreements({ ...none, developmentOnlyTiles: ['Transportation'] }, empty)).toEqual([
      'Transportation is development-only (isDev), but DEVELOPMENT_ONLY_ALL_MAPS_TILES does not name it, so nothing proves it off production'
    ]);
    expect(disagreements(none, { ...empty, pages: ['/all-maps/transportation'] })).toEqual([
      'DEVELOPMENT_ONLY_ALL_MAPS_PAGES names /all-maps/transportation, which is not development-only (developmentOnly in its route data): gate it, or take it out'
    ]);
  });
  const busControl = { name: 'the bus map in the Transportation section', selector: 'a.map-entry[href="/map/d/bus"]' };

  it("accepts a development-only map the smoke suite's map check opens, whose service is on no list (#2767)", () => {
    const build: BuildSide = {
      ...none,
      developmentOnlyMaps: [{ route: '/transportation/sustainable-transportation', urls: ['https://example.com/TS/BikeMap/MapServer/1'] }],
      hiddenListings: ['/transportation/sustainable-transportation']
    };

    expect(disagreements(build, { ...empty, checkedMaps: ['/transportation/sustainable-transportation'] })).toEqual([]);
    expect(disagreements(build, empty)).toHaveLength(2);
  });

  it('accepts a hidden listing asserted by a control linking to it, as the bus map is', () => {
    expect(disagreements({ ...none, hiddenListings: ['/map/d/bus'] }, { ...empty, controls: [busControl] })).toEqual([]);
  });

  it('fails a hidden listing that nothing in the suite checks', () => {
    expect(disagreements({ ...none, hiddenListings: ['/map/d/bus'] }, empty)).toEqual([
      expect.stringContaining('/map/d/bus is hidden from production')
    ]);
  });

  it('fails a control that expects a listing hidden which is not', () => {
    expect(disagreements(none, { ...empty, controls: [busControl] })).toEqual([
      expect.stringContaining('link to /map/d/bus expects it hidden')
    ]);
  });

  it('fails a layer left out at build that the suite does not watch', () => {
    const layer = { name: 'MICROMOBILITY', urls: ['https://example.edu/Hosted/Micromobility_view/FeatureServer'] };

    expect(disagreements({ ...none, excludedLayers: [layer] }, empty)).toEqual([
      expect.stringContaining('MICROMOBILITY is left out of a production build')
    ]);
    expect(
      disagreements(
        { ...none, excludedLayers: [layer] },
        { ...empty, services: { 'Hosted/Micromobility_view': { pages: [] } } }
      )
    ).toEqual([]);
  });

  it('fails a development-only map whose route the suite does not load', () => {
    const map = { route: '/parking/draft', urls: ['https://example.edu/Hosted/Draft_view/FeatureServer/0'] };

    expect(
      disagreements(
        { ...none, developmentOnlyMaps: [map] },
        { ...empty, services: { 'Hosted/Draft_view': { pages: ['/map'] } } }
      )
    ).toEqual([expect.stringContaining('/parking/draft is development-only')]);
  });

  it('fails a watched service gated by nothing, and one that claims both gates', () => {
    expect(disagreements(none, { ...empty, services: { 'Hosted/Orphan': { pages: [] } } })).toEqual([
      expect.stringContaining("['Hosted/Orphan'] is gated by nothing")
    ]);

    const layer = { name: 'NATURE_RX', urls: ['https://example.edu/Hosted/NatureRx_view/FeatureServer/0'] };

    expect(
      disagreements(
        { ...none, excludedLayers: [layer] },
        { ...empty, services: { 'Hosted/NatureRx_view': { pages: [], runTimeGate: 'somewhere' } } }
      )
    ).toEqual([expect.stringContaining('one of them is stale')]);
  });

  it('fails a reason kept for a listing that is no longer hidden', () => {
    expect(disagreements(none, { ...empty, hiddenForOtherReasons: { '/events/move-out': 'because' } })).toEqual([
      expect.stringContaining('/events/move-out, which is not hidden')
    ]);
  });
});
