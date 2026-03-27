import { Injectable } from '@angular/core';
import { fromEventPattern } from 'rxjs';
import { switchMap, startWith, map } from 'rxjs/operators';

import LayerListViewModel from '@arcgis/core/widgets/LayerList/LayerListViewModel';

import { EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';

@Injectable()
export class LayerListService {
  private _model: __esri.LayerListViewModel;

  constructor(private mapService: EsriMapService) {}

  public layers() {
    return this.mapService.store.pipe(
      switchMap((instance: MapServiceInstance) => {
        this._model = new LayerListViewModel({
          view: instance.view
        });

        let handle: __esri.Handle;

        const add = (handler) => {
          handle = this._model.operationalItems.watch('length', handler);
        };

        const remove = (): void => {
          handle.remove();
        };

        // For every item, attempt to create a layer
        return fromEventPattern(add, remove).pipe(
          startWith(-1),
          map(() => this._model.operationalItems.toArray())
        );
      })
    );
  }
}
