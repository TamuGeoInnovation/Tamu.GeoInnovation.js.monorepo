import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { shareReplay, switchMap, pluck } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IEffluentSample } from '@tamu-gisc/ues/common/ngx';
import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class SamplingLocationsService {
  private samplesResource: Array<IEffluentSample>;
  private modules: Observable<[esri.QueryConstructor, esri.QueryTaskConstructor]>;
  private sampleLocationsResourceUrl: string;

  constructor(private env: EnvironmentService, private moduleProvider: EsriModuleProviderService) {
    this.samplesResource = this.env.value('effluentSamples');
    this.sampleLocationsResourceUrl = this.env.value('effluentSampleLocationsUrl');

    this.modules = from(this.moduleProvider.require(['Query', 'QueryTask'])).pipe(shareReplay(1)) as Observable<
      [esri.QueryConstructor, esri.QueryTaskConstructor]
    >;
  }

  public getSamplingLocation(location: string | { tier: number; sample: number }) {
    let loc = { tier: undefined, sample: undefined };

    if (typeof location === 'string') {
      loc.tier = location.split('-')[0];
      loc.sample = location.split('-').pop();
    } else if (location instanceof Object) {
      loc = { ...location };
    }

    if (loc.tier === undefined && loc.sample === undefined) {
      return null;
    }

    const l = this.samplesResource.find((r) => {
      return r.sample === `${loc.tier}-${loc.sample}`;
    });

    if (!l) {
      return null;
    }

    return JSON.parse(JSON.stringify(l));
  }

  public getSamplesForTier(tier?: number): Array<IEffluentSample> {
    if (tier !== undefined) {
      const filtered = this.samplesResource.filter((sample) => {
        const st = parseInt(sample.sample.split('-')[0], 10);

        return st === tier;
      });

      return JSON.parse(JSON.stringify(filtered));
    } else {
      return JSON.parse(JSON.stringify(this.samplesResource));
    }
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
}
