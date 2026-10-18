import esri = __esri;

/** A WGS 84 position, in degrees. */
export interface LongitudeLatitude {
  longitude: number;
  latitude: number;
}

/** Projects a point to WGS 84, once Esri's project operator has loaded; see `toGeographic`. */
let projector: Promise<(point: esri.Point) => esri.Point> | undefined;

/**
 * A point's WGS 84 longitude and latitude, whatever the spatial reference of the view it came from (#1875).
 *
 * Esri fills in a point's `longitude` and `latitude` only in a geographic or Web Mercator reference. On dev
 * the main map's 2D basemap is in Texas Centric (wkid 32139), where both are null, so a click's `mapPoint`
 * there has no latitude to show. Such a point is projected with Esri's project operator, which is loaded
 * on first use and kept.
 */
export async function toGeographic(point: esri.Point): Promise<LongitudeLatitude> {
  if (typeof point.longitude === 'number' && typeof point.latitude === 'number') {
    return { longitude: point.longitude, latitude: point.latitude };
  }

  projector ??= loadProjector();

  const geographic = (await projector)(point);

  return { longitude: geographic.x, latitude: geographic.y };
}

function loadProjector(): Promise<(point: esri.Point) => esri.Point> {
  const loading = Promise.all([
    import('@arcgis/core/geometry/operators/projectOperator.js'),
    import('@arcgis/core/geometry/SpatialReference.js')
  ]).then(async ([operator, { default: SpatialReference }]) => {
    await operator.load();

    return (point: esri.Point) => operator.execute(point, SpatialReference.WGS84) as esri.Point;
  });

  // A failed load is not kept, so the next call tries again.
  loading.catch(() => (projector = undefined));

  return loading;
}
