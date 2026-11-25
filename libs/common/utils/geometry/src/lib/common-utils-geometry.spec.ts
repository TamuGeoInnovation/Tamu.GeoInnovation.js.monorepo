import {
  distanceToPolygonEdge,
  formatLatLonLines,
  geolocationPermission,
  isLatLonPolygon,
  isWithinPolygon,
  LatLon,
  parseLatLon,
  parseLatLonLines
} from './common-utils-geometry';

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

  describe('distanceToPolygonEdge', () => {
    it('measures from a point outside to the nearest side, in metres', () => {
      expect(distanceToPolygonEdge({ latitude: north + 20 * metre, longitude: west + 50 * metreEast }, square)).toBeCloseTo(
        20,
        0
      );
      expect(distanceToPolygonEdge({ latitude: middle, longitude: east + 40 * metreEast }, square)).toBeCloseTo(40, 0);
    });

    it('measures past a corner to the corner itself', () => {
      const beyondCorner = { latitude: north + 30 * metre, longitude: east + 40 * metreEast };

      expect(distanceToPolygonEdge(beyondCorner, square)).toBeCloseTo(50, 0);
    });

    it('measures from a point inside to the nearest side too', () => {
      expect(distanceToPolygonEdge({ latitude: south + 10 * metre, longitude: (west + east) / 2 }, square)).toBeCloseTo(
        10,
        0
      );
    });
  });
});

describe('parseLatLon', () => {
  it('reads a latitude and longitude, latitude first', () => {
    expect(parseLatLon('30.6155, -96.3410')).toEqual({ latitude: 30.6155, longitude: -96.341 });
  });

  it('reads extra spaces, no space, a space alone and whole numbers', () => {
    expect(parseLatLon('  30.6155 ,   -96.3410  ')).toEqual({ latitude: 30.6155, longitude: -96.341 });
    expect(parseLatLon('30.6155,-96.3410')).toEqual({ latitude: 30.6155, longitude: -96.341 });
    expect(parseLatLon('30.6155 -96.3410')).toEqual({ latitude: 30.6155, longitude: -96.341 });
    expect(parseLatLon('30, -96')).toEqual({ latitude: 30, longitude: -96 });
  });

  it('reads the edges of the ranges', () => {
    expect(parseLatLon('90, 180')).toEqual({ latitude: 90, longitude: 180 });
    expect(parseLatLon('-90, -180')).toEqual({ latitude: -90, longitude: -180 });
  });

  it('refuses values out of range', () => {
    expect(parseLatLon('200, 500')).toBeUndefined();
    expect(parseLatLon('91, 0')).toBeUndefined();
    expect(parseLatLon('0, 181')).toBeUndefined();
  });

  it('refuses a longitude given first rather than swapping it', () => {
    expect(parseLatLon('-96.3410, 30.6155')).toBeUndefined();
  });

  it('refuses anything but two values', () => {
    expect(parseLatLon('30.6')).toBeUndefined();
    expect(parseLatLon('1,2,3')).toBeUndefined();
    expect(parseLatLon('30.6,')).toBeUndefined();
    expect(parseLatLon(', -96.3')).toBeUndefined();
    expect(parseLatLon('30.6,,-96.3')).toBeUndefined();
  });

  it('refuses a value that is not wholly a number', () => {
    expect(parseLatLon('30.6abc, -96.3')).toBeUndefined();
    expect(parseLatLon('a, b')).toBeUndefined();
  });

  it('refuses empty and missing text', () => {
    expect(parseLatLon('')).toBeUndefined();
    expect(parseLatLon('   ')).toBeUndefined();
    expect(parseLatLon(undefined)).toBeUndefined();
  });
});

describe('parseLatLonLines', () => {
  it('reads corners as Google Maps copies them, one per line', () => {
    const text = '30.61134149709473, -96.34182507980555\n  30.612176343177023,-96.34258857834743  \r\n\n30.6132 -96.3409\n';

    expect(parseLatLonLines(text)).toEqual([
      { latitude: 30.61134149709473, longitude: -96.34182507980555 },
      { latitude: 30.612176343177023, longitude: -96.34258857834743 },
      { latitude: 30.6132, longitude: -96.3409 }
    ]);
  });

  it('reads blank text as no corners', () => {
    expect(parseLatLonLines('')).toEqual([]);
    expect(parseLatLonLines(' \n ')).toEqual([]);
    expect(parseLatLonLines(undefined)).toEqual([]);
  });

  it('refuses a line that is not a latitude and longitude in range', () => {
    expect(parseLatLonLines('30.61, -96.34\nRudder Plaza')).toBeUndefined();
    expect(parseLatLonLines('30.61, -96.34, 12')).toBeUndefined();
    expect(parseLatLonLines('30.61, -96.34\n130.61, -96.34')).toBeUndefined();
  });

  it('reads back what formatLatLonLines writes', () => {
    const corners = [
      { latitude: 30.61134149709473, longitude: -96.34182507980555 },
      { latitude: 30.612176343177023, longitude: -96.34258857834743 }
    ];

    expect(parseLatLonLines(formatLatLonLines(corners))).toEqual(corners);
    expect(formatLatLonLines(null)).toBe('');
  });
});

describe('isLatLonPolygon', () => {
  const corner = { latitude: 30.61, longitude: -96.34 };

  it('accepts three or more corners in range', () => {
    expect(isLatLonPolygon([corner, corner, corner])).toBe(true);
  });

  it('refuses corners that are not in order around the zone, so its sides cross', () => {
    const sw = { latitude: 30.612, longitude: -96.342 };
    const nw = { latitude: 30.613, longitude: -96.342 };
    const ne = { latitude: 30.613, longitude: -96.341 };
    const se = { latitude: 30.612, longitude: -96.341 };

    expect(isLatLonPolygon([sw, nw, ne, se])).toBe(true);
    expect(isLatLonPolygon([sw, nw, ne, se, sw])).toBe(true);
    // A bow tie: south-west to north-east crosses north-west to south-east.
    expect(isLatLonPolygon([sw, ne, nw, se])).toBe(false);
  });

  it('refuses fewer than three corners, anything out of range, and anything not a list', () => {
    expect(isLatLonPolygon([corner, corner])).toBe(false);
    expect(isLatLonPolygon([corner, corner, { latitude: 95, longitude: -96.34 }])).toBe(false);
    expect(isLatLonPolygon([corner, corner, { latitude: '30.61', longitude: -96.34 }])).toBe(false);
    expect(isLatLonPolygon(null)).toBe(false);
    expect(isLatLonPolygon('30.61, -96.34')).toBe(false);
  });
});

/**
 * #2559: the form reads whether it may use the location before asking, and hears when that changes.
 */
describe('geolocationPermission', () => {
  /**
   * Lets a promise the browser answered settle.
   */
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

  const withPermissions = (permissions: unknown) =>
    Object.defineProperty(navigator, 'permissions', { value: permissions, configurable: true });

  afterEach(() => {
    delete (navigator as unknown as { permissions?: unknown }).permissions;
  });

  it('says unknown, at once, where the browser has no Permissions API', () => {
    withPermissions(undefined);
    const states: Array<string> = [];

    geolocationPermission().subscribe((s) => states.push(s));

    expect(states).toEqual(['unknown']);
  });

  it('says unknown where the browser does not know the location as a permission', async () => {
    withPermissions({ query: () => Promise.reject(new TypeError('geolocation is not a valid permission name')) });
    const states: Array<string> = [];

    geolocationPermission().subscribe((s) => states.push(s));
    await settle();

    expect(states).toEqual(['unknown']);
  });

  it('reads the state, then each change, and stops listening when unsubscribed', async () => {
    const status = new EventTarget() as EventTarget & { state: PermissionState };
    status.state = 'denied';
    const query = vi.fn(() => Promise.resolve(status));
    withPermissions({ query });
    const states: Array<string> = [];

    const subscription = geolocationPermission().subscribe((s) => states.push(s));
    await settle();

    status.state = 'granted';
    status.dispatchEvent(new Event('change'));

    subscription.unsubscribe();
    status.state = 'denied';
    status.dispatchEvent(new Event('change'));

    expect(query).toHaveBeenCalledWith({ name: 'geolocation' });
    expect(states).toEqual(['denied', 'granted']);
  });
});
