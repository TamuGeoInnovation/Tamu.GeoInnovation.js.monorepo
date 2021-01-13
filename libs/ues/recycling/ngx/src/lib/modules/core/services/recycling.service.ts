import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { Result } from '@tamu-gisc/ues/recycling/common/entities';

import { ResultsService } from '../../data-access/results/results.service';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class RecyclingService {
  public selectedLocationGraphic: BehaviorSubject<esri.Graphic> = new BehaviorSubject(undefined);
  public selectedLocationMeta: Observable<RecyclingLocationMetadata>;
  public selectedLocationResults: Observable<Result[]>;
  public selectedLocationRecyclingStats: Observable<RecyclingResultsStatistics>;

  public allLocationResults: Observable<Partial<Result>[]>;
  public allLocationRecyclingStats: Observable<RecyclingResultsStatistics>;

  public allOrSelectedRecyclingStats: Observable<RecyclingResultsStatistics>;

  constructor(private mapService: EsriMapService, private resultsService: ResultsService) {
    this.mapService.hitTest
      .pipe(
        map((snapshot) => {
          const [graphic] = snapshot.graphics;
          return graphic;
        }),
        filter((g) => {
          return g !== undefined;
        }),
        // Filter out multiple emissions by feature id. This will prevent many xhr requests and limit other
        // unnecessary UI reactive changes.
        distinctUntilChanged((oldGraphic, newGraphic) => {
          return oldGraphic.attributes.OBJECTID === newGraphic.attributes.OBJECTID;
        }),
        shareReplay(1)
      )
      .subscribe((graphic) => {
        this.selectedLocationGraphic.next(graphic);
      });

    this.selectedLocationMeta = this.selectedLocationGraphic.pipe(
      switchMap((g) => {
        if (g === undefined) {
          return of(undefined);
        } else {
          return of(g).pipe(pluck('attributes'));
        }
      }),
      shareReplay(1)
    );

    this.selectedLocationResults = this.selectedLocationMeta.pipe(
      switchMap((meta) => {
        if (meta === undefined) {
          return of(undefined);
        } else {
          return of(meta).pipe(
            switchMap((m) => {
              const resolvedId = m.bldNum !== null ? m.bldNum : m.Name;

              return this.resultsService.getResultsForLocation({ id: resolvedId });
            })
          );
        }
      }),
      shareReplay(1)
    );

    this.selectedLocationRecyclingStats = this.selectedLocationResults.pipe(
      map((results) => {
        if (results === undefined) {
          return undefined;
        } else {
          const totalRecycled = results.reduce((acc, curr) => {
            const isTonUnit = curr.value % 1 !== 0;

            if (isTonUnit) {
              // Convert tons to pounds
              return acc + parseInt((curr.value * 2000).toFixed(0), 10);
            }

            return acc + curr.value;
          }, 0);

          return {
            records: results.length,
            total: totalRecycled,
            results
          } as RecyclingResultsStatistics;
        }
      })
    );

    this.allLocationResults = this.resultsService.getResults().pipe(
      map((groups) => {
        return groups.map((group) => {
          return {
            date: new Date(group.identity as string),
            value: group.items.reduce((acc, curr) => {
              const isTonUnit = curr.value % 1 !== 0;

              if (isTonUnit) {
                // Convert tons to pounds
                return acc + parseInt((curr.value * 2000).toFixed(0), 10);
              }

              return acc + curr.value;
            }, 0),
            location: undefined
          };
        });
      }),
      shareReplay(1)
    );

    this.allLocationRecyclingStats = this.allLocationResults.pipe(
      map((results) => {
        if (results === undefined) {
          return undefined;
        } else {
          const totalRecycled = results.reduce((acc, curr) => {
            const isTonUnit = curr.value % 1 !== 0;

            if (isTonUnit) {
              // Convert tons to pounds
              return acc + parseInt((curr.value * 2000).toFixed(0), 10);
            }

            return acc + curr.value;
          }, 0);

          return {
            records: results.length,
            total: totalRecycled,
            results
          } as RecyclingResultsStatistics;
        }
      })
    );

    this.allOrSelectedRecyclingStats = this.selectedLocationRecyclingStats.pipe(
      switchMap((stats) => {
        if (stats === undefined) {
          return this.allLocationRecyclingStats;
        } else {
          return of(stats);
        }
      })
    );
  }

  public clearSelected() {
    this.selectedLocationGraphic.next(undefined);
  }

  public setLocation(location: esri.Graphic) {
    this.selectedLocationGraphic.next(location);
  }
}

export interface RecyclingLocationMetadata {

  OBJECTID: number;
  ID: number;
  Name: string;
  bldNum: string;
  camPub: string;
  style: string;
  public_view: "Yes" | 'No'
}

export interface RecyclingResultsStatistics {
  records: number;
  total: number;
  results: Result[];
}
