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

        // A new list when a layer is added or removed, or when one is titled: a layer with no title of its
        // own takes its service's name once it loads, after its item is listed, and the list is sorted by
        // title (#1939).
        const add = (handler) => {
          handle = reactiveUtils.watch(() => this._model.operationalItems.map((item) => item.title).join('\n'), handler);
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
