import { Injectable } from '@angular/core';
import { fromEventPattern, Observable, ReplaySubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import LegendViewModel from '@arcgis/core/widgets/Legend/LegendViewModel';

import { EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable()
export class LegendService {
  private _legendItems: ReplaySubject<Array<__esri.ActiveLayerInfo>> = new ReplaySubject(1);
  public legendItems: Observable<Array<__esri.ActiveLayerInfo>> = this._legendItems.asObservable();

  constructor(
    private mapService: EsriMapService,
    private env: EnvironmentService
  ) {}

  public legend(options?: LegendOptions) {
    const respectLayerVisibility = options?.respectLayerVisibility ?? true;
    const excludedLayerIds = new Set(options?.excludedLayerIds ?? []);

    return this.mapService.store.pipe(
      switchMap((instances: MapServiceInstance) => {
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
  added: Array<__esri.ActiveLayerInfo>;
  moved: Array<__esri.ActiveLayerInfo>;
  removed: Array<__esri.ActiveLayerInfo>;
  target: __esri.LegendViewModel['activeLayerInfos'];
}
