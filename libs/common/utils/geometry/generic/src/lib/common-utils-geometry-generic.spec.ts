import {
  findNearestIndex,
  getGeolocation,
  isCoordinatePair,
  parseCoordinates,
  relativeDistance
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

  it('should work for successes', (done) => {
    // TODO: The tests work but the geolocation mock probably needs to be a global
    //
    // eslint-disable-next-line @typescript-eslint/ban-types
    (window.navigator as unknown as { geolocation: {} }).geolocation = {
      getCurrentPosition: (success) => {
        success({ coords: coords, timestamp: 1 });
      }
    };
    getGeolocation(false).then((c) => {
      expect(c).toEqual(coords);
      done();
    });
    getGeolocation(true).subscribe((c) => {
      expect(c).toEqual(coords);
      done();
    });
  });

  it('should throw error on fail', (done) => {
    // TODO: The tests work but the geolocation mock probably needs to be a global
    //
    // eslint-disable-next-line @typescript-eslint/ban-types
    (window.navigator as unknown as { geolocation: {} }).geolocation = {
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
