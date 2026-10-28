import { expect, test } from '@playwright/test';

import { definedMaps } from './definitions';
import { CORE_ROUTES, CORE_SPECS, describeQuickSet, quickSetFor, routeGrep } from './scope';

/**
 * The quick tier's own checks (#1717, after #1427).
 *
 * Pure: no browser, no environment. They run in milliseconds and are part of every quick run,
 * because a fault here does not fail loudly - it quietly runs fewer tests than it should, which is
 * the one way a tool like this can do harm.
 */

const DEFINITIONS = 'libs/ts/events/ngx/src/lib/definitions/';

const sources: Record<string, string> = {
  // Double-quoted name, because of the apostrophe. A pattern that only accepted single quotes
  // missed both basketball maps entirely (#1427).
  'mens-basketball.definitions.ts': `
    export const MensBasketball_Configuration: EventConfiguration = {
      id: 'mens-basketball',
      name: "Men's Basketball",
      discover: { type: 'event' }
    };
  `,
  '4h-roundup.definitions.ts': `
    export const Roundup_Configuration: EventConfiguration = {
      id: '4h-roundup-2026',
      name: '4-H Roundup',
      discover: { type: 'event' }
    };
  `,
  'move-in.definitions.ts': `
    export const MoveIn_Configuration: EventConfiguration = {
      id: 'move-in',
      name: 'Move-In',
      discover: { type: 'parking' }
    };
  `,
  'symbols.definitions.ts': `export const SOME_SYMBOL = 'not a map';`
};

const read = (file: string) => {
  const source = sources[file];

  if (source === undefined) {
    throw new Error(`the test has no source for ${file}`);
  }

  return source;
};

test.describe('choosing the quick set for a change', () => {
  test('always holds the core, even when nothing changed', () => {
    const set = quickSetFor([], read);

    expect(set.specs).toEqual([...CORE_SPECS].sort());
    expect(set.routes).toEqual(CORE_ROUTES);
    expect(set.stems).toEqual([]);
    expect(set.unmapped).toEqual([]);
  });

  test('selects every map a definitions file declares, not only the first', () => {
    // move-out.definitions.ts declares `move-out` and builds `spring-move-out`, `summer-i-move-out`
    // and `summer-ii-move-out` from a function, so only the first id can be read from the source.
    // The first quick run, on 12 October, loaded one of the four for exactly that reason.
    const grep = routeGrep(quickSetFor([`${DEFINITIONS}move-in.definitions.ts`], read));

    expect('/parking/move-in loads and serves its layers').toMatch(grep);
    expect('/events/fall-move-in loads and serves its layers').toMatch(grep);
    expect('/events/fall-move-in/map/d?day=1 opens where it does on production').toMatch(grep);
    expect('/events/move-out loads and serves its layers').not.toMatch(grep);
  });

  test('adds a changed event definition as its own route', () => {
    const set = quickSetFor([`${DEFINITIONS}mens-basketball.definitions.ts`], read);

    expect(set.routes).toContain('/events/mens-basketball');
    expect(set.unmapped).toEqual([]);
  });

  test("takes the route from the definition's declared id, not from the file name", () => {
    // 4h-roundup.definitions.ts declares `4h-roundup-2026`. Deriving the route from the file name
    // would produce /events/4h-roundup, which matches no test, so the change would appear to need
    // no testing at all.
    const set = quickSetFor([`${DEFINITIONS}4h-roundup.definitions.ts`], read);

    expect(set.routes).toContain('/events/4h-roundup-2026');
  });

  test("uses the discover type's section, so a parking map is not filed under events", () => {
    const set = quickSetFor([`${DEFINITIONS}move-in.definitions.ts`], read);

    expect(set.routes).toContain('/parking/move-in');
  });

  test('adds the specs that check a changed feature', () => {
    const set = quickSetFor(['libs/maps/feature/basemap/src/lib/shared/basemaps.definition.ts'], read);

    expect(set.specs).toEqual(
      expect.arrayContaining(['services.spec.ts', 'basemap-zoom.spec.ts', 'campus-basemap.spec.ts', 'basemap-gallery.spec.ts'])
    );
    expect(set.unmapped).toEqual([]);
  });

  test('checks that the map draws when the vector tile basemap code changes', () => {
    const set = quickSetFor(['libs/maps/esri/src/lib/services/map/vector-tile-sprites.ts'], read);

    expect(set.specs).toEqual(expect.arrayContaining(['blank-map.spec.ts']));
    expect(set.unmapped).toEqual([]);
  });

  test('checks which layers the event framework loads when it changes', () => {
    const set = quickSetFor(['libs/ts/events/ngx/src/lib/services/event/event.service.ts'], read);

    expect(set.specs).toEqual(expect.arrayContaining(['campus-layers.spec.ts', 'kiosk.spec.ts']));
    expect(set.unmapped).toEqual([]);
  });

  test('checks the kiosk maps when a kiosk, or the tailgating map its kiosk reuses, changes', () => {
    // The real definitions files, read from disk.
    for (const file of ['dining', 'tailgating', 'tailgating-kiosk']) {
      const set = quickSetFor([`${DEFINITIONS}${file}.definitions.ts`]);

      expect(set.specs).toContain('kiosk.spec.ts');
    }

    expect(quickSetFor([`${DEFINITIONS}tailgating-kiosk.definitions.ts`]).routes).toContain(
      '/kiosk/football-tailgating'
    );
  });

  test('checks the portal renderers when the code that reads them, or the services, change', () => {
    for (const file of [
      'libs/maps/esri/src/lib/services/map/portal-symbology.ts',
      'libs/aggiemap/ngx/common/src/lib/connections.ts'
    ]) {
      expect(quickSetFor([file], read).specs).toContain('portal-renderers.spec.ts');
    }
  });

  test('checks what a service says about itself when the connections change', () => {
    expect(quickSetFor(['libs/aggiemap/ngx/common/src/lib/connections.ts'], read).specs).toContain('service-metadata.spec.ts');
  });

  test('runs a changed smoke spec whole', () => {
    const set = quickSetFor(['test/smoke/aggiemap/bus.spec.ts', 'test/smoke/aggiemap/environments.json'], read);

    expect(set.specs).toContain('bus.spec.ts');
    expect(set.unmapped).toEqual([]);
  });

  test('says which changed files it could not map, instead of passing over them', () => {
    const set = quickSetFor(
      ['libs/maps/esri/src/lib/esri-runtime.ts', `${DEFINITIONS}symbols.definitions.ts`, 'docs/releases/unreleased.md'],
      read
    );

    expect(set.unmapped).toEqual(['libs/maps/esri/src/lib/esri-runtime.ts', `${DEFINITIONS}symbols.definitions.ts`]);
    expect(describeQuickSet(set)).toContain('libs/maps/esri/src/lib/esri-runtime.ts');
  });

  test('leaves out what cannot reach a deployed map', () => {
    const set = quickSetFor(['docs/releases/unreleased.md', 'README.md', 'libs/maps/esri/src/lib/x.spec.ts'], read);

    expect(set.specs).toEqual([...CORE_SPECS].sort());
    expect(set.unmapped).toEqual([]);
  });
});

test.describe('selecting tests by route', () => {
  const grep = routeGrep(quickSetFor([`${DEFINITIONS}mens-basketball.definitions.ts`], read));

  for (const title of [
    '/map loads and serves its layers',
    '/map opens where it does on production',
    '/events/mens-basketball does not say the event has passed long before it',
    "/events/mens-basketball (Men's Basketball) loads and serves its layers",
    '/events/gameday-parking/map/d?transport-type=shuttle opens where it does on production',
    'discovery lists at least 55 maps'
  ]) {
    test(`selects "${title}"`, () => {
      expect(title).toMatch(grep);
    });
  }

  test('errs towards more: a stem inside another id selects that map too', () => {
    // `mens-basketball` is inside `womens-basketball`. Running one map too many costs a minute;
    // the other mistake is the silent one.
    expect('/events/womens-basketball loads and serves its layers').toMatch(grep);
  });

  for (const title of [
    'test/smoke/aggiemap/maps.spec.ts /events/muster loads and serves its layers',
    '/events/ring-day/map/d?event-day=day2 opens where it does on production',
    '/events/t-camp loads and serves its layers',
    '/parking/ts-main-parking-2 loads and serves its layers'
  ]) {
    test(`leaves out "${title}"`, () => {
      expect(title).not.toMatch(grep);
    });
  }
});

test('every real definition that declares a map yields a route', () => {
  const maps = definedMaps();

  expect(maps.length).toBeGreaterThan(40);

  for (const map of maps) {
    expect(map.route, `${map.file} produced no usable route`).toMatch(
      /^\/(events|parking|operations|campus|kiosk)\/[a-z0-9-]+$/
    );
  }
});
