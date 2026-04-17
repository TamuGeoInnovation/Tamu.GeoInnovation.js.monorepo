import { Injectable } from '@angular/core';
import { combineLatest, fromEventPattern, Observable, ReplaySubject } from 'rxjs';
import { map, scan, startWith, switchMap } from 'rxjs/operators';

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
    const excludedLayerIds = new Set(options?.excludedLayerIds ?? []);

    return combineLatest([this.moduleProvider.require(['LegendViewModel']), this.mapService.store]).pipe(
      switchMap(([[LegendViewModel], instances]: [[esri.LegendViewModelConstructor], MapServiceInstance]) => {
        // Use respectLayerVisibility: false so that ESRI never removes a layer from
        // activeLayerInfos when its visibility changes. This keeps toggled-off layers
        // in the list so the legend-collection component can collapse (not destroy) them.
        const model = new LegendViewModel({
          view: instances.view,
          respectLayerVisibility: false
        });

        let handle;

        const add = (handler) => {
          handle = model.activeLayerInfos.on('change', handler);
        };

        const remove = (): void => {
          handle.remove();
        };

        return fromEventPattern(add, remove).pipe(
          startWith({ target: model.activeLayerInfos }),
          map((event: IActiveLayerInfosChangeEvent) => {
            return event.target
              .filter((l) => l.layer.listMode !== 'hide')
              .filter((l) => !excludedLayerIds.has(l.layer.id))
              .toArray();
          }),
          // Track layers that have ever been visible. Initially-hidden layers (e.g. alternate
          // map-mode layers, base-map layers that are off by default) are never added to the
          // allowed set and therefore never appear in the legend. Once a layer has been seen
          // as visible it stays in the legend permanently so that toggling it off collapses
          // the entry instead of removing it.
          scan(
            (
              acc: { allowedIds: Set<string>; result: esri.ActiveLayerInfo[] },
              items: esri.ActiveLayerInfo[]
            ) => {
              const allowedIds = new Set(acc.allowedIds);
              items.filter((l) => l.layer.visible).forEach((l) => allowedIds.add(l.layer.id));
              return { allowedIds, result: items.filter((l) => allowedIds.has(l.layer.id)) };
            },
            { allowedIds: new Set<string>(), result: [] as esri.ActiveLayerInfo[] }
          ),
          map((acc) => acc.result)
        );
      })
    );
  }
}

interface LegendOptions {
  excludedLayerIds?: string[];
}

export interface IActiveLayerInfosChangeEvent {
  added: Array<esri.ActiveLayerInfo>;
  moved: Array<esri.ActiveLayerInfo>;
  removed: Array<esri.ActiveLayerInfo>;
  target: esri.LegendViewModel['activeLayerInfos'];
}
