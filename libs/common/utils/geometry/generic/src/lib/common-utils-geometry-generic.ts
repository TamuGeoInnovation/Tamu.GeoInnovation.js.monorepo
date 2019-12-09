import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { Point } from '@tamu-gisc/common/types';

import { getSmallestIndex } from '@tamu-gisc/common/utils/number';
import { centroidFromGeometry, FeatureUnion } from '@tamu-gisc/common/utils/geometry/esri';

import * as gju from 'geojson-utils';

/**
 * Gets user geolocation if user allows.
 */
export function getGeolocation(asObservable?: false): Promise<Coordinates>;
export function getGeolocation(asObservable?: true): Observable<Coordinates>;
export function getGeolocation(asObservable?: boolean): Promise<Coordinates> | Observable<Coordinates> {
  const promise: Promise<Coordinates> = new Promise((r, rj) => {
    window.navigator.geolocation.getCurrentPosition(
      (e) => {
        r(e.coords);
      },
      (err) => {
        rj(err);
      }
    );
  });

  if (asObservable) {
    return from(promise);
  } else {
    return promise;
  }
}

export class TrackLocation {
  private _trackID: number;
  private _options: PositionOptions;
  private _location: BehaviorSubject<Position>;

  constructor(options?: PositionOptions) {
    this._options = { ...options };

    this._location = new BehaviorSubject(undefined);
  }

  /**
   *  Returns an observable wrapper around the native geolocation API.
   */
  public track(): Observable<Position> {
    this._trackID = navigator.geolocation.watchPosition(
      (position: Position) => {
        this._location.next(position);
      },
      (error) => {
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
 * Tests if a given search input string is a coordinate pair.
 * @param input Input string
 * @returns True if string is coordinate pair, false if not
 */
export function isCoordinatePair(input: string): boolean {
  if (!input.includes(',')) {
    return false;
  }
  const set = input.split(',');
  if (set.length !== 2) {
    return false;
  }
  return !isNaN(parseFloat(set[0].trim())) && !isNaN(parseFloat(set[1].trim()));
}

/**
 * Determines the index of the nearest feature to a static reference from a collection of centroid points.
 */
export function findNearestIndex(reference: Point, centroids: { geometry: Point }[]): number {
  const distances = relativeDistance(
    {
      latitude: reference.latitude,
      longitude: reference.longitude
    },
    centroids
  );

  const smallest = getSmallestIndex(distances);

  return smallest;
}

/**
 * Converts a coordindate string into TripPointGeometry.
 *
 * First number is assumed latitude.
 *
 * Second number is assumed longitude.
 *
 * @export
 * @param input Coordinate pair string
 */
export function parseCoordinates(input: string): Point {
  return {
    latitude: parseFloat(input.split(',')[0].trim()),
    longitude: parseFloat(input.split(',')[1].trim())
  };
}

/**
 * Calculates the relative distance of a collection of points relative to a reference.
 *
 *
 * @param reference Reference point used to calculated distance from/to
 * @param points Collection of points.
 * @returns Calculated distances.
 */
export function relativeDistance(reference: Point, points: RelativeDistancePoint[]): number[] {
  const distances = points.reduce((acc, curr) => {
    const currGeometry = centroidFromGeometry(curr.geometry);

    const distance = gju.pointDistance(
      { type: 'Point', coordinates: [reference.longitude, reference.latitude] },
      { type: 'Point', coordinates: [currGeometry.longitude, currGeometry.latitude] }
    );

    return [...acc, distance];
  }, []);

  return distances;
}

export interface RelativeDistancePoint {
  geometry: FeatureUnion;
}
