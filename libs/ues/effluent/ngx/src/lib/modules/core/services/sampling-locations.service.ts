import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { shareReplay, switchMap, pluck, map } from 'rxjs/operators';

import { IChartConfiguration } from '@tamu-gisc/ui-kits/ngx/charts';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { ResultsService } from '../../data-access/results/results.service';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class SamplingLocationsService {
  private modules: Observable<[esri.QueryConstructor, esri.QueryTaskConstructor]>;

  private sampleLocationsResourceUrl: string;

  constructor(
    private env: EnvironmentService,
    private moduleProvider: EsriModuleProviderService,
    private resultsService: ResultsService
  ) {
    this.sampleLocationsResourceUrl = this.env.value('effluentSampleLocationsUrl');

    this.modules = from(this.moduleProvider.require(['Query', 'QueryTask'])).pipe(shareReplay(1)) as Observable<
      [esri.QueryConstructor, esri.QueryTaskConstructor]
    >;
  }

  public getSamplingLocationsForTier(geometry?: esri.Geometry, tier?: number | string): Observable<Array<esri.Graphic>> {
    return this.modules.pipe(
      switchMap(([Query, QueryTask]) => {
        if (geometry === undefined && tier === undefined) {
          return of(undefined);
        }

        const task = new QueryTask({ url: this.sampleLocationsResourceUrl });

        const q = new Query({
          returnGeometry: true,
          spatialRelationship: 'intersects',
          outFields: ['*']
        });

        if (geometry) {
          q.geometry = geometry;
        }

        if (tier) {
          q.where = `Tier = '${tier}'`;
        }

        return from(task.execute(q));
      }),
      pluck<esri.FeatureSet, Array<esri.Graphic>>('features')
    );
  }

  public getChartDataForSample(tier: number, sample: number): Observable<IChartConfiguration['data']> {
    return this.resultsService.getResultsForSample({ tier: tier, sample: sample }).pipe(
      switchMap((results) => {
        if (results.length > 0) {
          return this.getChartConfiguration({
            values: results.map((r) => r.value),
            dates: results.map((r) => r.date)
          });
        } else {
          return this.getChartConfiguration({ values: [], dates: [] });
        }
      })
    );
  }

  private getChartConfiguration(factors: {
    values: Array<number>;
    dates: Array<Date>;
  }): Observable<IChartConfiguration['data']> {
    return of(factors).pipe(
      map((f) => {
        return factors.dates.map((d, i, a) => {
          return {
            x: d,
            y: factors.values[i]
          };
        });
      }),
      map((dataset) => {
        return {
          datasets: [
            {
              data: dataset,
              fill: false
            }
          ]
        };
      })
    );
  }
}
