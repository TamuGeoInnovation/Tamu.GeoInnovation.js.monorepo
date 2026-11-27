import { Injectable, inject } from '@angular/core';
import { from, combineLatest } from 'rxjs';
import { switchMap, startWith, map } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService, watchAsObservable } from '@tamu-gisc/maps/esri';

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

        // A new list when a layer is added or removed, or when one is titled: a layer with no title of its
        // own takes its service's name once it loads, after its item is listed, and the list is sorted by
        // title (#1939).
        return watchAsObservable(reactiveUtils, () =>
          this._model.operationalItems.map((item) => item.title).join('\n')
        ).pipe(
          startWith(-1),
          map(() => this._model.operationalItems.toArray())
        );
      })
    );
  }
}
