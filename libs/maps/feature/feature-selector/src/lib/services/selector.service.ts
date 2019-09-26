import { Injectable, OnInit, OnDestroy } from '@angular/core';

import { of, fromEventPattern, Observable, from } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable()
export class FeatureSelectorService implements OnDestroy {
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

  /**
   * Holds the map view click handler, to dispose of it on service destruction.
   */
  private _listener: esri.Handle;

  constructor(private esriMapService: EsriMapService) {
    this.feature = this.esriMapService.store.pipe(
      switchMap((instances) => {
        return of(instances.view);
      }),
      switchMap((view) => {
        const create = (handler) => {
          this._listener = view.on('click', handler);
        };

        const remove = (handler) => {
          this._listener.remove();
        };

        return fromEventPattern(create, remove).pipe(
          switchMap((event: MouseEvent) => {
            return from((view.hitTest(event) as any) as Promise<esri.HitTestResult>);
          }),
          switchMap((hitTestResult: esri.HitTestResult) => {
            return of(hitTestResult.results.map((v) => v.graphic));
          })
        );
      })
    );

    this.snapshot = this.feature.pipe(shareReplay(1));
  }

  public ngOnDestroy() {
    if (this._listener !== undefined) {
      this._listener.remove();
    }
  }
}
