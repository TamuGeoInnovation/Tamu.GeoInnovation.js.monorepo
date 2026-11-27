import { nearestLot, permitChosen } from './trip-planner-parking-stop';

/**
 * A drive with a parking pass adds the nearest lot the permit allows, and only when there is a permit and a lot (#3875).
 * A link with `mode=3` and no permit looked for lots anyway, found none, and threw, so the trip never finished.
 */
describe('permitChosen', () => {
  it('is false for the permit as the planner starts it, and for an empty one', () => {
    expect(permitChosen(undefined)).toBe(false);
    expect(permitChosen(null)).toBe(false);
    expect(permitChosen('')).toBe(false);
    expect(permitChosen('  ')).toBe(false);
  });

  it('is true for a chosen permit', () => {
    expect(permitChosen('FS')).toBe(true);
  });
});

describe('nearestLot', () => {
  const destination = { latitude: 30.615, longitude: -96.33 };

  /** A lot as the search service gives it: plain JSON with rings and no centroid (#1856), a square around a point. */
  const lot = (name: string, latitude: number, longitude: number) => ({
    attributes: { name },
    geometry: {
      rings: [
        [
          [longitude - 0.001, latitude - 0.001],
          [longitude + 0.001, latitude - 0.001],
          [longitude + 0.001, latitude + 0.001],
          [longitude - 0.001, latitude + 0.001],
          [longitude - 0.001, latitude - 0.001]
        ]
      ]
    }
  });

  it('is undefined with no lots, so the trip goes on without one', () => {
    expect(nearestLot([], destination)).toBeUndefined();
    expect(nearestLot(undefined, destination)).toBeUndefined();
  });

  it('is the lot nearest the destination, at its centre, from plain JSON rings', () => {
    const near = lot('Lot 100g', 30.616, -96.331);
    const far = lot('Lot 50', 30.6, -96.35);

    const found = nearestLot([far, near], destination);

    expect(found?.lot).toBe(near);
    expect(found?.centre.latitude).toBeCloseTo(30.616, 5);
    expect(found?.centre.longitude).toBeCloseTo(-96.331, 5);
  });
});
