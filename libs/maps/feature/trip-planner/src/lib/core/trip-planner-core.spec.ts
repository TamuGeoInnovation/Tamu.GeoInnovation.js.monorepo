import { attributeOf, featureName, hasCoordinates, TripPoint, TripPointAttributes } from './trip-planner-core';

/**
 * A stop's attributes are read whatever their case (#2707). The buildings service publishes `latitude`, `number` and
 * `bldg_number`; the services stops came from before it publish `Latitude`, `Number` and `Bldg_Number`.
 */
describe('attributeOf', () => {
  it('reads a field from the buildings service by the name the other services use', () => {
    const building = { number: '0468', latitude: 30.616607, bldg_number: '0468' };

    expect(attributeOf(building, 'Number')).toBe('0468');
    expect(attributeOf(building, 'Latitude')).toBe('30.616607');
    expect(attributeOf(building, 'Bldg_Number')).toBe('0468');
  });

  it('still reads a field spelled as the name asks', () => {
    expect(attributeOf({ Latitude: '30.6' }, 'Latitude')).toBe('30.6');
  });

  it('treats a missing, null or empty field as absent', () => {
    expect(attributeOf({ number: '' }, 'Number')).toBeUndefined();
    expect(attributeOf({ number: null }, 'Number')).toBeUndefined();
    expect(attributeOf({}, 'Number')).toBeUndefined();
    expect(attributeOf(undefined, 'Number')).toBeUndefined();
  });
});

/**
 * A stop set by clicking the map is named after the feature clicked (#2723). Nature Rx names its spaces in `area_name`,
 * which the stop did not read, so a click on Eli Whitely Park's marker set a stop reading `30.6146, -96.3493`.
 */
describe('a stop set by a map click', () => {
  const clicked = (attributes?: Record<string, unknown>) =>
    new TripPoint({
      source: 'map-event',
      originAttributes: attributes as unknown as TripPointAttributes,
      originGeometry: { latitude: 30.614612, longitude: -96.349321 },
      originParameters: { type: 'map-event', value: { latitude: 30.614612, longitude: -96.349321 } }
    }).normalize().attributes.name;

  it("is named after a Nature Rx space's area_name", () => {
    expect(clicked({ objectid: 7, area_name: 'Eli Whitely Park', location: 'Southside' })).toBe('Eli Whitely Park');
  });

  it('is still named after a building or a lot', () => {
    expect(clicked({ bldgname: 'Harrington Education Center Office Tower' })).toBe(
      'Harrington Education Center Office Tower'
    );
    expect(clicked({ lotname: 'Lot 100g' })).toBe('Lot 100g');
  });

  it('is named by its coordinates on bare ground', () => {
    expect(clicked()).toBe('30.6146, -96.3493');
  });
});

/**
 * A point whose latitude is null has no coordinates to show or route (#1848).
 *
 * Esri fills a point's `latitude` and `longitude` in only a geographic or Web Mercator reference and leaves them
 * **null** in any other - dev's main 2D basemap is Texas Centric, where both are null (#1875). `TripPointGeometry`
 * types them as `number | undefined`, so null is not in the type but arrives at run time.
 *
 * `isNaN` was the guard in three places and does not catch it, because `Number(null)` is `0`, so `isNaN(null)` is
 * `false`. These cases all failed before `hasCoordinates` replaced it.
 */
describe('hasCoordinates (#1848)', () => {
  const geometry = (latitude: unknown, longitude: unknown) =>
    ({ latitude, longitude }) as unknown as Parameters<typeof hasCoordinates>[0];

  it('rejects null, which isNaN accepts', () => {
    // The whole bug in one line: isNaN would say these are fine.
    expect(isNaN(null as unknown as number)).toBe(false);

    expect(hasCoordinates(geometry(null, null))).toBe(false);
    expect(hasCoordinates(geometry(30.6146, null))).toBe(false);
    expect(hasCoordinates(geometry(null, -96.3493))).toBe(false);
  });

  it('rejects an absent or unusable coordinate', () => {
    expect(hasCoordinates(undefined)).toBe(false);
    expect(hasCoordinates(geometry(undefined, undefined))).toBe(false);
    expect(hasCoordinates(geometry(NaN, NaN))).toBe(false);
    expect(hasCoordinates(geometry('30.6146', '-96.3493'))).toBe(false);
  });

  it('accepts a pair of numbers, zero included', () => {
    expect(hasCoordinates(geometry(30.6146, -96.3493))).toBe(true);
    expect(hasCoordinates(geometry(0, 0))).toBe(true);
  });
});

/**
 * What a null latitude did before `hasCoordinates`, through the stop that carries it (#1848).
 *
 * On a projected basemap a map click gives a point with null coordinates. Each of these is a separate symptom of the
 * one guard: the name threw on `.toFixed`, the fallback name read "null, null", and the stop was marked normalized -
 * the flag whose own comment says it exists to stop "errors adding them to map and executing a route task".
 */
describe('a stop whose coordinates are null (#1848)', () => {
  const nullGeometry = { latitude: null, longitude: null } as unknown as { latitude: number; longitude: number };

  const stop = (attributes?: Record<string, unknown>) =>
    new TripPoint({
      source: 'map-event',
      originAttributes: attributes as unknown as TripPointAttributes,
      originGeometry: nullGeometry,
      originParameters: { type: 'map-event', value: nullGeometry }
    }).normalize();

  it('does not throw while being named', () => {
    // Before the fix: TypeError: Cannot read properties of null (reading 'toFixed')
    expect(() => stop()).not.toThrow();
  });

  it('is left unnamed rather than named "null, null"', () => {
    expect(stop().attributes.name).toBe('');
  });

  it('is not marked normalized, so it is never sent to the route task', () => {
    expect(stop().normalized).toBe(false);
  });

  it("still takes the feature's own name when it has one", () => {
    expect(stop({ bldgname: 'Harrington Education Center Office Tower' }).attributes.name).toBe(
      'Harrington Education Center Office Tower'
    );
  });
});

/** `featureName` is unchanged by #1848; kept here so the two are read together. */
describe('featureName', () => {
  it('reads a name field whatever its case, and treats empty as absent', () => {
    expect(featureName({ BldgName: 'Evans Library' })).toBe('Evans Library');
    expect(featureName({ area_name: '' })).toBeUndefined();
    expect(featureName(undefined)).toBeUndefined();
  });
});
