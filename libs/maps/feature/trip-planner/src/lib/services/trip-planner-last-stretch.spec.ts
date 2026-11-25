import {
  LAST_STRETCH_MAX_METRES,
  lastStretch,
  lastStretchFinishText,
  routeEndVertex
} from './trip-planner-last-stretch';

/**
 * A walk to tent O62 on Ortega Lawn, as the development network answered it on 4 November 2026: the route ends on the
 * walkway north of the lawn, 35 m from the tent's centre (#2639).
 */
const ROUTE_END = [-96.33793961699996, 30.610767360000068, 5.53];
const TENT_O62 = { latitude: 30.610546211004003, longitude: -96.33819865050025 };

describe('lastStretch', () => {
  it('draws from where the route ends to a tent off the path', () => {
    const stretch = lastStretch(ROUTE_END, TENT_O62);

    expect(stretch.from).toEqual([ROUTE_END[0], ROUTE_END[1]]);
    expect(stretch.to).toEqual([TENT_O62.longitude, TENT_O62.latitude]);
    expect(stretch.metres).toBeGreaterThan(30);
    expect(stretch.metres).toBeLessThan(40);
  });

  it('is not drawn when the route already ends at the destination', () => {
    expect(lastStretch([TENT_O62.longitude, TENT_O62.latitude + 0.00002], TENT_O62)).toBeNull();
  });

  it('is not drawn when the destination is too far from the path for a straight line to be a walk', () => {
    // About 1.1 km north.
    expect(lastStretch([TENT_O62.longitude, TENT_O62.latitude + 0.01], TENT_O62)).toBeNull();
    expect(LAST_STRETCH_MAX_METRES).toBeLessThan(1100);
  });

  it('is not drawn without a route end or a destination', () => {
    expect(lastStretch(undefined, TENT_O62)).toBeNull();
    expect(lastStretch(ROUTE_END, undefined)).toBeNull();
    expect(lastStretch(ROUTE_END, { latitude: NaN, longitude: NaN })).toBeNull();
  });
});

describe('routeEndVertex', () => {
  it('is the last vertex of the last feature with a path', () => {
    const features = [
      { geometry: { paths: [[[1, 1], [2, 2]]] } },
      { geometry: { paths: [[[2, 2], ROUTE_END]] } },
      // The Finish step can come back with no geometry.
      { geometry: undefined }
    ];

    expect(routeEndVertex(features)).toBe(ROUTE_END);
  });

  it('is undefined for no features', () => {
    expect(routeEndVertex([])).toBeUndefined();
    expect(routeEndVertex(undefined)).toBeUndefined();
  });
});

describe('lastStretchFinishText', () => {
  it('names the destination and the distance to it, to 5 m', () => {
    const stretch = lastStretch(ROUTE_END, TENT_O62);

    expect(lastStretchFinishText(stretch, 'Tent O62', '3:15 PM')).toBe(
      'Leave the path and walk about 35 m to Tent O62, arriving at 3:15 PM'
    );
  });
});
