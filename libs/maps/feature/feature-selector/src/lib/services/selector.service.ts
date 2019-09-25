import { Injectable, OnInit, OnDestroy } from '@angular/core';

import { of, fromEventPattern, Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable()
export class FeatureSelectorService implements OnInit, OnDestroy {
  public feature: Observable<esri.HitTestResultResults[]>;

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
            return of(hitTestResult.results);
          })
        );
      })
    );
  }

  public ngOnInit() {}

  public ngOnDestroy() {
    if (this._listener !== undefined) {
      this._listener.remove();
    }
  }
}
