import { Injectable } from '@angular/core';
import { from, fromEventPattern, combineLatest } from 'rxjs';
import { switchMap, startWith, map } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable()
export class LayerListService {
  private _model: esri.LayerListViewModel;

  constructor(private moduleProvider: EsriModuleProviderService, private mapService: EsriMapService) {}

  public layers() {
    return combineLatest([from(this.moduleProvider.require(['LayerListViewModel'])), this.mapService.store]).pipe(
      switchMap(([[LayerListViewModel], instance]: [[esri.LayerListViewModelConstructor], MapServiceInstance]) => {
        this._model = new LayerListViewModel({
          view: instance.view
        });

        let handle: esri.Handle;

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
