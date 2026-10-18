import { distanceInMetres } from './distance';

describe('distanceInMetres', () => {
  const msc = { latitude: 30.6122, longitude: -96.3414 };

  it('is zero from a point to itself', () => {
    expect(distanceInMetres(msc, msc)).toBe(0);
  });

  it('measures a short distance north to within a few centimetres', () => {
    // 0.0001 degrees of latitude is about 11.12 metres.
    expect(distanceInMetres(msc, { ...msc, latitude: msc.latitude + 0.0001 })).toBeCloseTo(11.12, 1);
  });

  it('allows for longitude shrinking away from the equator', () => {
    // 0.0001 degrees of longitude at 30.6 degrees north is about 9.57 metres.
    expect(distanceInMetres(msc, { ...msc, longitude: msc.longitude + 0.0001 })).toBeCloseTo(9.57, 1);
  });

  it('measures a campus-sized distance', () => {
    // The MSC to Kyle Field, about 256 metres.
    const kyleField = { latitude: 30.6101, longitude: -96.3403 };

    expect(distanceInMetres(msc, kyleField)).toBeGreaterThan(230);
    expect(distanceInMetres(msc, kyleField)).toBeLessThan(260);
  });

  it('is the same in either direction', () => {
    const other = { latitude: 30.6131, longitude: -96.3406 };

    expect(distanceInMetres(msc, other)).toBeCloseTo(distanceInMetres(other, msc), 9);
  });
});
