import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { SearchService, SearchResult } from '@tamu-gisc/search';

import { relativeDistance, centroidFromEsriGeometry } from '../../../utilities/utils';

import { Point } from '../../../../types/types';

@Injectable()
export class BikeService {
  constructor(private http: HttpClient, private search: SearchService) {}

  /**
   * Returns the coordinates of a nearby bike-share unit.
   *
   * If no units are found within a reasonable distance, return undefined.
   *
   * @param {Point} point
   * @returns {Observable<Bike>}
   * @memberof BikeService
   */
  public getNearbyBike(point: Point): Observable<Bike> {
    return this.http
      .get('http://localhost:27000/bikes/nearest', {
        params: {
          latitude: `${point.latitude}`,
          longitude: `${point.longitude}`,
          format: 'json'
        }
      })
      .pipe(
        switchMap((result: NearestJSONResponse) => {
          if (result && result.data.geometry && result.data.geometry.length > 0) {
            return of(result.data.geometry[0]);
          } else {
            return of(undefined);
          }
        })
      );
  }

  /**
   * Gets all bike rack points on campus and determines the nearest to the provided
   * point.
   *
   * @param {Point} point
   * @returns {Observable<Point>}
   * @memberof BikeService
   */
  public getNearestBikeRack(point: Point): Observable<Point> {
    return this.search
      .search({
        sources: ['bike-racks'],
        values: [1],
        stateful: false
      })
      .pipe(
        switchMap((result: SearchResult) => {
          if (result && result.results && result.results.length > 0) {
            const features = result.features();

            const distances = relativeDistance(point, features);

            const smallest = Math.min(...distances);

            const smallestIndex = distances.findIndex((d) => d == smallest);

            const feature: any = features[smallestIndex];

            return of(centroidFromEsriGeometry(feature.geometry));
          } else {
            return of(undefined);
          }
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }
}

export interface Bike {
  bikeId: string;
  lat: number;
  lon: number;
}

export interface NearestJSONResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    geometry: Bike[];
  };
}
