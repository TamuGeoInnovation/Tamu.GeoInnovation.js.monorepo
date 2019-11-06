import esri = __esri;
import {
  centroidFromGeometry,
  centroidFromPolygonGeometry,
  FeatureUnion,
  getGeometryType,
  pointFromMultiPointGeometry,
  pointFromPointGeometry,
  pointFromPolylineGeometry
} from '@tamu-gisc/common/utils/geometry/esri';

describe('centroidFromGeometry', () => {
  it('should error on invalid input', () => {
    expect(() => centroidFromGeometry(({} as unknown) as FeatureUnion)).toThrowError(
      new Error('Could not get centroid from search geometry because type could not be identified.')
    );
  });

  it('should work for valid inputs', () => {
    expect(centroidFromGeometry(({ rings: [[[20, 4], [20, 4], [20, 4], [20, 4]]] } as unknown) as esri.Polygon)).toEqual({
      latitude: 4,
      longitude: 20
    });
    expect(centroidFromGeometry(({ points: [[20, 4]] } as unknown) as esri.Multipoint)).toEqual({
      latitude: 4,
      longitude: 20
    });
    expect(centroidFromGeometry(({ y: 4, x: 20 } as unknown) as esri.Point)).toEqual({ latitude: 4, longitude: 20 });
    expect(
      centroidFromGeometry(({
        paths: [],
        extent: { center: { latitude: 1, longitude: 2 } }
      } as unknown) as esri.Polyline)
    ).toEqual({ latitude: 1, longitude: 2 });
  });
});

describe('centroidFromPolygonGeometry', () => {
  it('should error on invalid input', () => {
    expect(() => centroidFromPolygonGeometry(({ centroid: null, rings: null } as unknown) as esri.Polygon)).toThrowError(
      new Error('Feature provided does not contain rings.')
    );
  });

  it('should work for esri.Polygon', () => {
    expect(centroidFromPolygonGeometry(({ centroid: { latitude: 4, longitude: 20 } } as unknown) as esri.Polygon)).toEqual({
      latitude: 4,
      longitude: 20
    });
  });

  it('should work for Turf Point', () => {
    expect(
      centroidFromPolygonGeometry(({ rings: [[[20, 4], [20, 4], [20, 4], [20, 4]]] } as unknown) as esri.Polygon)
    ).toEqual({
      latitude: 4,
      longitude: 20
    });
  });
});

describe('getGeometryType', () => {
  it('should error on invalid inputs', () => {
    expect(() => getGeometryType(null)).toThrowError(
      new Error('Could not determine geometry type because geometry was not provided.')
    );
    expect(() => getGeometryType(({} as unknown) as esri.Geometry)).toThrowError(
      new Error('Could not resolve geometry type.')
    );
  });

  it('should return "point"', () => {
    expect(getGeometryType(({ latitude: 4, longitude: 20 } as unknown) as esri.Geometry)).toEqual('point');
  });

  it('should return "multipoint"', () => {
    expect(getGeometryType(({ points: [] } as unknown) as esri.Geometry)).toEqual('multipoint');
  });

  it('should return "polygon"', () => {
    expect(getGeometryType(({ rings: [] } as unknown) as esri.Geometry)).toEqual('polygon');
  });

  it('should return "polyline"', () => {
    expect(getGeometryType(({ paths: [] } as unknown) as esri.Geometry)).toEqual('polyline');
  });
});

describe('pointFromMultiPointGeometry', () => {
  it('should error on invalid input', () => {
    expect(() => pointFromMultiPointGeometry(({ points: null } as unknown) as esri.Multipoint)).toThrowError(
      new Error('Feature provided does not contain points.')
    );
  });

  it('should work for basic input', () => {
    expect(pointFromMultiPointGeometry(({ points: [[20, 4]] } as unknown) as esri.Multipoint)).toEqual({
      latitude: 4,
      longitude: 20
    });
  });
});

describe('pointFromPointGeometry', () => {
  it('should error on invalid input', () => {
    expect(() => pointFromPointGeometry(null)).toThrowError(new Error('Feature provided does not have x or y.'));
  });

  it('should work for Point', () => {
    const point = { latitude: 4, longitude: 20 };
    expect(pointFromPointGeometry(point)).toEqual(point);
  });

  it('should work for esri.Point', () => {
    expect(pointFromPointGeometry(({ y: 4, x: 20 } as unknown) as esri.Point)).toEqual({ latitude: 4, longitude: 20 });
  });
});

describe('pointFromPolylineGeometry', () => {
  it('should error on invalid input', () => {
    expect(() => pointFromPolylineGeometry(null)).toThrowError(new Error('Feature provided does not contain paths.'));
    expect(() => pointFromPolylineGeometry(({ paths: undefined } as unknown) as esri.Polyline)).toThrowError(
      new Error('Feature provided does not contain paths.')
    );
  });

  it('should error on invalid input', () => {
    expect(
      pointFromPolylineGeometry(({
        paths: [],
        extent: { center: { latitude: 1, longitude: 2 } }
      } as unknown) as esri.Polyline)
    ).toEqual({ latitude: 1, longitude: 2 });
  });
});
