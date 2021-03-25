import { Injectable } from '@angular/core';
import { forkJoin, fromEventPattern, Observable, ReplaySubject } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable()
export class LegendService {
  private _legendItems: ReplaySubject<Array<esri.ActiveLayerInfo>> = new ReplaySubject(1);
  public legendItems: Observable<Array<esri.ActiveLayerInfo>> = this._legendItems.asObservable();

  constructor(private moduleProvider: EsriModuleProviderService, private mapService: EsriMapService) {}

  public legend() {
    return forkJoin([this.moduleProvider.require(['LegendViewModel']), this.mapService.store.pipe(take(1))]).pipe(
      switchMap(([[LegendViewModel], instances]: [[esri.LegendViewModelConstructor], MapServiceInstance]) => {
        const model = new LegendViewModel({
          view: instances.view
        });

        // Create add/remove watch handlers for the activeLayerInfos property of the view model.
        // These are used to create a subscribable event stream.
        let handle;

        const add = (handler) => {
          handle = model.activeLayerInfos.on('change', handler);
        };

        const remove = (handler): void => {
          handle.remove();
        };

        // For every item, attempt to create a layer
        return fromEventPattern(add, remove).pipe(
          startWith({ target: model.activeLayerInfos }),
          map((event: IActiveLayerInfosChangeEvent) => {
            return event.target.toArray();
          })
        );
      })
    );
  }
}

export interface IActiveLayerInfosChangeEvent {
  added: Array<esri.ActiveLayerInfo>;
  moved: Array<esri.ActiveLayerInfo>;
  removed: Array<esri.ActiveLayerInfo>;
  target: esri.LegendViewModel['activeLayerInfos'];
}
