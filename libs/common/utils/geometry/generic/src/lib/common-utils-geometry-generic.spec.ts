import { getGeolocation, isCoordinatePair, parseCoordinates } from './common-utils-geometry-generic';

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
    ((window.navigator as unknown) as { geolocation: {} }).geolocation = {
      getCurrentPosition: (success, _) => {
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
    ((window.navigator as unknown) as { geolocation: {} }).geolocation = {
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

describe('parseCoordinates', () => {
  it('should handle valid input', () => {
    expect(parseCoordinates('1234,56')).toEqual({ latitude: 1234, longitude: 56 });
  });
});
