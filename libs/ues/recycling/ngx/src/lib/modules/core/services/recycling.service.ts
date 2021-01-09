import { Injectable } from '@angular/core';

import { BehaviorSubject, iif, Observable, of } from 'rxjs';
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
  public selectedLocationRecyclingStats: Observable<RecyclingResultsStatistics>;

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

    this.selectedLocationRecyclingStats = this.selectedLocationMeta.pipe(
      switchMap((meta) => {
        if (meta === undefined) {
          return of(undefined);
        } else {
          return of(meta).pipe(
            switchMap((m) => {
              const resolvedId = m.bldNum !== null ? m.bldNum : m.Name;

              return this.resultsService.getResultsForLocation({ id: resolvedId });
            }),
            map((results) => {
              const totalRecycled = results.reduce((acc, curr) => acc + curr.value, 0);
              const firstWithNonZeroValue = results.find((r) => r.value !== 0);

              return {
                records: results.length,
                total: totalRecycled % 1 === 0 ? totalRecycled : totalRecycled.toFixed(2),
                unit: firstWithNonZeroValue ? (firstWithNonZeroValue.value % 1 === 0 ? 'lbs' : 'tons') : undefined,
                results
              } as RecyclingResultsStatistics;
            })
          );
        }
      }),
      shareReplay(1)
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
  CreationDate: number;
  Creator: string;
  EditDate: number;
  Editor: string;
  GlobalID: string;
  Name: string;
  OBJECTID: number;
  bldNum: string;
  camPub: string;
  style: string;
}

export interface RecyclingResultsStatistics {
  records: number;
  total: number;
  unit: 'lbs' | 'tons';
  results: Result[];
}
