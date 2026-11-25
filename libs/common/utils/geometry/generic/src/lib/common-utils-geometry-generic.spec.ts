import type { Mock } from 'vitest';

import esri = __esri;

import { distanceInMetres } from '@tamu-gisc/common/utils/geometry';

import {
  findNearestIndex,
  getGeolocation,
  isCoordinatePair,
  parseCoordinates,
  TrackLocation
} from './common-utils-geometry-generic';

describe('getGeolocation', () => {
  const coords = {
    accuracy: 10,
    altitude: 100,
    altitudeAccuracy: 1,
    heading: 90,
    latitude: 4,
    longitude: 20,
    speed: 69
  };

  /**
   * `getGeolocation` has two call forms -- a Promise and an Observable. The previous version
   * exercised both inside one test and called `done()` from each, so `done()` fired twice and Jest
   * failed the test even though both paths worked. Split so each form completes independently.
   */
  const mockGeolocationSuccess = () => {
    (window.navigator as unknown as { geolocation: unknown }).geolocation = {
      getCurrentPosition: (success) => {
        success({ coords: coords, timestamp: 1 });
      }
    };
  };

  it('resolves the coordinates in promise form', async () => {
    mockGeolocationSuccess();

    await expect(getGeolocation(false)).resolves.toEqual(coords);
  });

  it('emits the coordinates in observable form', () =>
    new Promise<void>((done) => {
      mockGeolocationSuccess();

      getGeolocation(true).subscribe((c) => {
        expect(c).toEqual(coords);
        done();
      });
    }));

  it('should throw error on fail', () =>
    new Promise<void>((done) => {
      // TODO: The tests work but the geolocation mock probably needs to be a global
      (window.navigator as unknown as { geolocation: unknown }).geolocation = {
        getCurrentPosition: (_, fail) => {
          fail(new Error("I just don't feel like it"));
        }
      };
      getGeolocation(false).catch((err) => {
        expect(err).toEqual(new Error("I just don't feel like it"));
        done();
      });
    }));
});

describe('isCoordinatePair', () => {
  it('should return false for no comma', () => {
    expect(isCoordinatePair('123456')).toEqual(false);
  });

  it('should return false for too many commas', () => {
    expect(isCoordinatePair('1,234,56')).toEqual(false);
  });

  it('should return true for good input', () => {
    expect(isCoordinatePair('1234,56')).toEqual(true);
  });
});

describe('findNearestIndex', () => {
  const academicBuilding = { latitude: 30.6156, longitude: -96.3409 };
  const kyleField = { latitude: 30.61, longitude: -96.3404 };
  const evansLibrary = { latitude: 30.617, longitude: -96.3389 };
  const rellis = { latitude: 30.642, longitude: -96.471 };

  it('finds the point nearest by distanceInMetres', () => {
    const places = [rellis, kyleField, evansLibrary].map((geometry) => ({ geometry }));
    const metres = places.map((p) => distanceInMetres(academicBuilding, p.geometry));

    expect(findNearestIndex(academicBuilding, places)).toBe(metres.indexOf(Math.min(...metres)));
    expect(findNearestIndex(academicBuilding, places)).toBe(2);
  });

  it('tells apart two bike racks 3 metres apart', () => {
    const rack7055 = { latitude: 30.6105280760633, longitude: -96.33420986857938 };
    const rack7056 = { latitude: 30.610548341339005, longitude: -96.33423189296872 };
    const nearer7056 = { latitude: 30.61055, longitude: -96.33424 };

    expect(findNearestIndex(nearer7056, [{ geometry: rack7055 }, { geometry: rack7056 }])).toBe(1);
  });

  it('measures to the centre of an area, as the parking and bike searches return', () => {
    const square = (c: { latitude: number; longitude: number }) =>
      ({
        type: 'polygon',
        rings: [
          [
            [c.longitude - 0.0001, c.latitude - 0.0001],
            [c.longitude - 0.0001, c.latitude + 0.0001],
            [c.longitude + 0.0001, c.latitude + 0.0001],
            [c.longitude + 0.0001, c.latitude - 0.0001],
            [c.longitude - 0.0001, c.latitude - 0.0001]
          ]
        ]
      }) as unknown as esri.Polygon;

    expect(findNearestIndex(academicBuilding, [{ geometry: square(kyleField) }, { geometry: square(evansLibrary) }])).toBe(
      1
    );
  });

  it('takes the first of two at the same distance, and finds nothing in an empty list', () => {
    expect(findNearestIndex(kyleField, [{ geometry: kyleField }, { geometry: kyleField }])).toBe(0);
    expect(findNearestIndex(kyleField, [])).toBe(-1);
  });
});

describe('parseCoordinates', () => {
  it('should handle valid input', () => {
    expect(parseCoordinates('1234,56')).toEqual({ latitude: 1234, longitude: 56 });
  });
});

describe('TrackLocation', () => {
  let ok: (p: unknown) => void;
  let fail: (e: unknown) => void;
  let watchPosition: Mock;
  let clearWatch: Mock;

  const position = { coords: { latitude: 30.6, longitude: -96.3, accuracy: 10 }, timestamp: 1 };

  beforeEach(() => {
    watchPosition = vi.fn((o, f) => {
      ok = o;
      fail = f;

      return 7;
    });
    clearWatch = vi.fn();
    (window.navigator as unknown as { geolocation: unknown }).geolocation = { watchPosition, clearWatch };
  });

  it('passes only the position options on to the browser', () => {
    new TrackLocation({ enableHighAccuracy: true, timeout: 5000, keepWatching: true }).track();

    expect(watchPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      enableHighAccuracy: true,
      timeout: 5000
    });
  });

  it('without keepWatching, ends at the first error of any kind', () => {
    const error = vi.fn();
    new TrackLocation().track().subscribe({ error });

    fail({ code: 3 });

    expect(error).toHaveBeenCalledWith({ code: 3 });
    expect(clearWatch).toHaveBeenCalledWith(7);
  });

  it('with keepWatching, keeps watching through a timeout and a position not yet available (#1784)', () => {
    const next = vi.fn();
    const error = vi.fn();
    const failures = vi.fn();
    new TrackLocation({ keepWatching: failures }).track().subscribe({ next, error });

    fail({ code: 3 });
    fail({ code: 2 });
    ok(position);

    expect(error).not.toHaveBeenCalled();
    expect(clearWatch).not.toHaveBeenCalled();
    expect(failures.mock.calls).toEqual([[{ code: 3 }], [{ code: 2 }]]);
    expect(next).toHaveBeenCalledWith(position);
  });

  it('with keepWatching, still ends when location access is refused', () => {
    const error = vi.fn();
    const failures = vi.fn();
    new TrackLocation({ keepWatching: failures }).track().subscribe({ error });

    fail({ code: 1 });

    expect(error).toHaveBeenCalledWith({ code: 1 });
    expect(failures).not.toHaveBeenCalled();
    expect(clearWatch).toHaveBeenCalledWith(7);
  });
});
