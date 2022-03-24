import { Injectable } from '@angular/core';

import { of, fromEventPattern, Observable, from } from 'rxjs';
import { switchMap, shareReplay, map } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable()
export class FeatureSelectorService {
  /**
   * Observable that emits the selected map feature.
   */
  public feature: Observable<esri.Graphic[]>;

  /**
   * Observable that emits the selected map feature and replays up to the last
   * emitted feature. Useful for late-subscribers that need access to the previous
   * emission.
   */
  public snapshot: Observable<esri.Graphic[]>;

  constructor(private esriMapService: EsriMapService) {
    this.feature = this.esriMapService.store.pipe(
      map((instances) => instances?.view),
      switchMap((view) => {
        /**
         * Holds the map view click handler, to dispose of it on service destruction.
         */
        let handle: esri.Handle;

        const create = (handler) => {
          handle = view.on('click', handler);
        };

        const remove = () => {
          handle.remove();
        };

        return fromEventPattern(create, remove).pipe(
          switchMap((event: MouseEvent) => {
            return from(view.hitTest(event) as unknown as Promise<esri.HitTestResult>);
          }),
          switchMap((hitTestResult: esri.HitTestResult) => {
            return of(hitTestResult.results.map((v) => v.graphic));
          })
        );
      })
    );

    this.snapshot = this.feature.pipe(shareReplay(1));
  }
}
