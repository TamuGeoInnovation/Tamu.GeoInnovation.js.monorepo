import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { shareReplay, switchMap, pluck } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class EffluentZonesService {
  private zonesResourceUrl: string;
  private modules: Observable<[esri.QueryConstructor, esri.QueryTaskConstructor]>;

  constructor(private env: EnvironmentService, private moduleProvider: EsriModuleProviderService) {
    this.zonesResourceUrl = this.env.value('effluentZonesUrl');

    this.modules = from(this.moduleProvider.require(['Query', 'QueryTask'])).pipe(shareReplay(1)) as Observable<
      [esri.QueryConstructor, esri.QueryTaskConstructor]
    >;
  }

  public getZonesForTier(geometry?: esri.Geometry, tier?: number | string): Observable<Array<esri.Graphic>> {
    return this.modules.pipe(
      switchMap(([Query, QueryTask]) => {
        // Early return if none of the optional parameters are provided.
        //
        // The query will flat out fail without either of them
        if (geometry === undefined || tier === undefined) {
          return of(undefined);
        }

        const task = new QueryTask({ url: this.zonesResourceUrl });

        const q = new Query({
          returnGeometry: true,
          spatialRelationship: 'intersects',
          outFields: ['*']
        });

        if (geometry !== undefined) {
          q.geometry = geometry;
        }

        if (tier !== undefined) {
          q.where = `Tier = '${tier}'`;
        }

        return from(task.execute(q));
      }),
      pluck<esri.FeatureSet, Array<esri.Graphic>>('features')
    );
  }
}
