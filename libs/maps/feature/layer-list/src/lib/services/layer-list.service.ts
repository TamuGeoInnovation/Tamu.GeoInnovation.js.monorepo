import { Injectable, inject } from '@angular/core';
import { from, fromEventPattern, combineLatest } from 'rxjs';
import { switchMap, startWith, map } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable()
export class LayerListService {
  private moduleProvider = inject(EsriModuleProviderService);
  private mapService = inject(EsriMapService);

  private _model: esri.LayerListViewModel;

  public layers() {
    const modules = this.moduleProvider.require(['LayerListViewModel', 'reactiveUtils']) as Promise<
      [typeof esri.LayerListViewModel, esri.reactiveUtils]
    >;

    return combineLatest([from(modules), this.mapService.store]).pipe(
      switchMap(([[LayerListViewModel, reactiveUtils], instance]) => {
        this._model = new LayerListViewModel({
          view: instance.view
        });

        let handle: esri.Handle;

        const add = (handler) => {
          handle = reactiveUtils.watch(() => this._model.operationalItems.length, handler);
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
