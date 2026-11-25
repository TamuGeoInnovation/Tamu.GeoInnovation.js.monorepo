import * as gju from 'geojson-utils';

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

  describe('between places on campus', () => {
    const academicBuilding = { latitude: 30.6156, longitude: -96.3409 };
    const kyleField = { latitude: 30.61, longitude: -96.3404 };
    const msc = { latitude: 30.6122, longitude: -96.3416 };
    const evansLibrary = { latitude: 30.617, longitude: -96.3389 };
    const reedArena = { latitude: 30.6075, longitude: -96.3496 };
    const recCenter = { latitude: 30.6075, longitude: -96.3449 };
    const rellis = { latitude: 30.642, longitude: -96.471 };
    const bikeRack7055 = { latitude: 30.6105280760633, longitude: -96.33420986857938 };
    const bikeRack7056 = { latitude: 30.610548341339005, longitude: -96.33423189296872 };

    const pairs: Array<[string, typeof msc, typeof msc, number]> = [
      ['the Academic Building to Kyle Field', academicBuilding, kyleField, 624.528],
      ['the MSC to Evans Library', msc, evansLibrary, 592.987],
      ['Reed Arena to the Rec Center', reedArena, recCenter, 449.803],
      ['the Academic Building to RELLIS', academicBuilding, rellis, 12789.653],
      ['bike rack 7055 to bike rack 7056', bikeRack7055, bikeRack7056, 3.086],
      ['Kyle Field to Reed Arena', kyleField, reedArena, 923.297]
    ];

    it.each(pairs)('measures %s to the centimetre', (_, from, to, metres) => {
      expect(distanceInMetres(from, to)).toBeCloseTo(metres, 2);
    });

    // geojson-utils' pointDistance is the haversine with a 6371 km radius, and was the trip planner's
    // second distance until #3478. The two agree to 0.02 m over 12.8 km, so either can be used.
    it.each(pairs)('agrees with geojson-utils from %s', (_, from, to) => {
      const other = gju.pointDistance(
        { type: 'Point', coordinates: [from.longitude, from.latitude] },
        { type: 'Point', coordinates: [to.longitude, to.latitude] }
      );

      expect(Math.abs(distanceInMetres(from, to) - other)).toBeLessThan(0.02);
    });
  });
});
