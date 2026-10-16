import {
  findNearestIndex,
  getGeolocation,
  isCoordinatePair,
  parseCoordinates,
  relativeDistance,
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

  it('emits the coordinates in observable form', (done) => {
    mockGeolocationSuccess();

    getGeolocation(true).subscribe((c) => {
      expect(c).toEqual(coords);
      done();
    });
  });

  it('should throw error on fail', (done) => {
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
  });
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
  it('should find nearest index', () => {
    expect(findNearestIndex({ latitude: 40, longitude: 50 }, [{ geometry: { latitude: 40, longitude: 50 } }])).toEqual(0);
  });
});

describe('parseCoordinates', () => {
  it('should handle valid input', () => {
    expect(parseCoordinates('1234,56')).toEqual({ latitude: 1234, longitude: 56 });
  });
});

describe('relativeDistance', () => {
  it('should output relative distances', () => {
    expect(relativeDistance({ latitude: 40, longitude: 50 }, [{ geometry: { latitude: 40, longitude: 50 } }])).toEqual([0]);
  });
});

describe('TrackLocation', () => {
  let ok: (p: unknown) => void;
  let fail: (e: unknown) => void;
  let watchPosition: jest.Mock;
  let clearWatch: jest.Mock;

  const position = { coords: { latitude: 30.6, longitude: -96.3, accuracy: 10 }, timestamp: 1 };

  beforeEach(() => {
    watchPosition = jest.fn((o, f) => {
      ok = o;
      fail = f;

      return 7;
    });
    clearWatch = jest.fn();
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
    const error = jest.fn();
    new TrackLocation().track().subscribe({ error });

    fail({ code: 3 });

    expect(error).toHaveBeenCalledWith({ code: 3 });
    expect(clearWatch).toHaveBeenCalledWith(7);
  });

  it('with keepWatching, keeps watching through a timeout and a position not yet available (#1784)', () => {
    const next = jest.fn();
    const error = jest.fn();
    const failures = jest.fn();
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
    const error = jest.fn();
    const failures = jest.fn();
    new TrackLocation({ keepWatching: failures }).track().subscribe({ error });

    fail({ code: 1 });

    expect(error).toHaveBeenCalledWith({ code: 1 });
    expect(failures).not.toHaveBeenCalled();
    expect(clearWatch).toHaveBeenCalledWith(7);
  });
});
