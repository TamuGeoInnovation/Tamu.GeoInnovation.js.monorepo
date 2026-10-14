import { isWithinPolygon, LatLon } from './common-utils-geometry';

describe('isWithinPolygon', () => {
  // About 1 metre in degrees of latitude, and of longitude at this latitude.
  const metre = 1 / 111195;
  const metreEast = metre / Math.cos((30.612 * Math.PI) / 180);

  // A square about 111 metres a side, in College Station.
  const south = 30.612;
  const west = -96.342;
  const north = south + 111 * metre;
  const east = west + 111 * metreEast;
  const square: Array<LatLon> = [
    { latitude: south, longitude: west },
    { latitude: north, longitude: west },
    { latitude: north, longitude: east },
    { latitude: south, longitude: east }
  ];
  const middle = (south + north) / 2;

  it('finds a point inside', () => {
    expect(isWithinPolygon({ latitude: middle, longitude: (west + east) / 2 }, square)).toBe(true);
  });

  it('finds a point outside', () => {
    expect(isWithinPolygon({ latitude: north + 20 * metre, longitude: west + 50 * metreEast }, square)).toBe(false);
  });

  it('accepts a point outside the edge but within the margin', () => {
    expect(isWithinPolygon({ latitude: north + 20 * metre, longitude: west + 50 * metreEast }, square, 30)).toBe(true);
  });

  it('refuses a point beyond the margin', () => {
    expect(isWithinPolygon({ latitude: north + 40 * metre, longitude: west + 50 * metreEast }, square, 30)).toBe(false);
  });

  it('measures the margin past a corner as a distance, not along each axis', () => {
    // 25 metres east and 25 north of the corner is 35 metres from it.
    const beyondCorner = { latitude: north + 25 * metre, longitude: east + 25 * metreEast };

    expect(isWithinPolygon(beyondCorner, square, 30)).toBe(false);
    expect(isWithinPolygon(beyondCorner, square, 40)).toBe(true);
  });

  it('works on an east or west side as on a north or south one', () => {
    expect(isWithinPolygon({ latitude: middle, longitude: west - 20 * metreEast }, square, 30)).toBe(true);
    expect(isWithinPolygon({ latitude: middle, longitude: east + 40 * metreEast }, square, 30)).toBe(false);
  });

  it('accepts the polygon closed, with its first corner repeated', () => {
    const closed = [...square, square[0]];

    expect(isWithinPolygon({ latitude: middle, longitude: (west + east) / 2 }, closed)).toBe(true);
    expect(isWithinPolygon({ latitude: north + 40 * metre, longitude: west + 50 * metreEast }, closed, 30)).toBe(false);
  });

  it('treats fewer than three corners as containing nothing', () => {
    expect(isWithinPolygon({ latitude: south, longitude: west }, square.slice(0, 2), 30)).toBe(false);
  });
});
