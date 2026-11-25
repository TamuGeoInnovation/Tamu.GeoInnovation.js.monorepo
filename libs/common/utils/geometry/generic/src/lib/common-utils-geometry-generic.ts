import { Observable, BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { Point } from '@tamu-gisc/common/types';

import { minBy } from '@tamu-gisc/common/utils/collection';
import { distanceInMetres } from '@tamu-gisc/common/utils/geometry';
import { centroidFromGeometry, FeatureUnion } from '@tamu-gisc/common/utils/geometry/esri';

// Lives in the framework-free geometry library, so code that loads no map library can use it too
// (#1766). Re-exported here so existing callers are unchanged.
export { getGeolocation } from '@tamu-gisc/common/utils/geometry';

export interface TrackLocationOptions extends PositionOptions {
  /**
   * Keep watching through a timeout or a position that is not available yet, both common on a first fix,
   * indoors or beside buildings, and error only when location access is refused (#1784). A function
   * is also told of each failure it keeps watching through, for example to count them.
   *
   * Without it, the first error of any kind ends tracking.
   */
  keepWatching?: boolean | ((error: GeolocationPositionError) => void);
}

/**
 * `GeolocationPositionError.PERMISSION_DENIED`, which is not defined outside a browser.
 */
const PERMISSION_DENIED = 1;

export class TrackLocation {
  private _trackID: number;
  private _options: PositionOptions;
  private _keepWatching: TrackLocationOptions['keepWatching'];
  private _location: BehaviorSubject<GeolocationPosition>;

  constructor(options?: TrackLocationOptions) {
    const { keepWatching, ...positionOptions } = { ...options };

    this._options = positionOptions;
    this._keepWatching = keepWatching;

    this._location = new BehaviorSubject(undefined);
  }

  /**
   *  Returns an observable wrapper around the native geolocation API.
   */
  public track(): Observable<GeolocationPosition> {
    this._trackID = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        this._location.next(position);
      },
      (error) => {
        // The browser's watch carries on after any error but a refusal, so there is nothing to restart.
        if (this._keepWatching && error?.code !== PERMISSION_DENIED) {
          if (typeof this._keepWatching === 'function') {
            this._keepWatching(error);
          }

          return;
        }

        this._location.error(error);
        this.dispose();
      },
      this._options
    );

    return this._location.asObservable().pipe(skip(1));
  }

  /**
   *  Releases any geolocation watch handlers.
   */
  public dispose() {
    if (this._trackID !== undefined) {
      navigator.geolocation.clearWatch(this._trackID);
    }
  }
}

/**
 * The index of the point nearest to a reference, measured with `distanceInMetres` to each point's
 * centroid, or -1 for an empty list. The first one wins a tie.
 */
export function findNearestIndex(reference: Point, points: RelativeDistancePoint[]): number {
  return points.indexOf(minBy(points, (p) => distanceInMetres(reference, centroidFromGeometry(p.geometry))));
}

export interface RelativeDistancePoint {
  geometry: FeatureUnion;
}
