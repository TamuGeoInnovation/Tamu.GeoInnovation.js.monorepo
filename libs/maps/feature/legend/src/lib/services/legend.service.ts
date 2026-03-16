import { Injectable } from '@angular/core';
import { combineLatest, fromEventPattern, Observable, ReplaySubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import esri = __esri;

@Injectable()
export class LegendService {
  private _legendItems: ReplaySubject<Array<esri.ActiveLayerInfo>> = new ReplaySubject(1);
  public legendItems: Observable<Array<esri.ActiveLayerInfo>> = this._legendItems.asObservable();

  constructor(
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService,
    private env: EnvironmentService
  ) {}

  public legend(options?: LegendOptions) {
    const respectLayerVisibility = options?.respectLayerVisibility ?? true;
    const excludedLayerIds = new Set(options?.excludedLayerIds ?? []);

    return combineLatest([this.moduleProvider.require(['LegendViewModel']), this.mapService.store]).pipe(
      switchMap(([[LegendViewModel], instances]: [[esri.LegendViewModelConstructor], MapServiceInstance]) => {
        const model = new LegendViewModel({
          view: instances.view,
          respectLayerVisibility
        });

        // Create add/remove watch handlers for the activeLayerInfos property of the view model.
        // These are used to create a subscribable event stream.
        let handle;

        const add = (handler) => {
          handle = model.activeLayerInfos.on('change', handler);
        };

        const remove = (): void => {
          handle.remove();
        };

        // For every item, attempt to create a layer
        return fromEventPattern(add, remove).pipe(
          startWith({ target: model.activeLayerInfos }),
          map((event: IActiveLayerInfosChangeEvent) => {
            return event.target
              .filter((l) => l.layer.listMode !== 'hide')
              .filter((l) => !excludedLayerIds.has(l.layer.id))
              .toArray();
          })
        );
      })
    );
  }
}

interface LegendOptions {
  respectLayerVisibility?: boolean;
  excludedLayerIds?: string[];
}

export interface IActiveLayerInfosChangeEvent {
  added: Array<esri.ActiveLayerInfo>;
  moved: Array<esri.ActiveLayerInfo>;
  removed: Array<esri.ActiveLayerInfo>;
  target: esri.LegendViewModel['activeLayerInfos'];
}
