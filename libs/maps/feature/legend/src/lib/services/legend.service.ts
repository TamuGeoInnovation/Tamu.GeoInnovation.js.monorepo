import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, fromEventPattern, Observable, ReplaySubject } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';
import { LayerSource, LegendItem } from '@tamu-gisc/common/types';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable()
export class LegendService {
  private _store: BehaviorSubject<LegendItem[]> = new BehaviorSubject([]);
  public store: Observable<LegendItem[]> = this._store.asObservable();

  private _legendItems: ReplaySubject<Array<esri.ActiveLayerInfo>> = new ReplaySubject(1);
  public legendItems: Observable<Array<esri.ActiveLayerInfo>> = this._legendItems.asObservable();

  private _handle: esri.WatchHandle;
  private _model: ReplaySubject<esri.LegendViewModel> = new ReplaySubject(1);

  constructor(
    private layerListService: LayerListService,
    private environment: EnvironmentService,
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService
  ) {
    const LegendSources = this.environment.value('LegendSources', true);
    // Handle automatic layer addition and removal legend item display.
    // This does not handle removal on layer visibility change

    if (LegendSources) {
      this.layerListService.layers({ watchProperties: 'visible' }).subscribe((value) => {
        const layersLegendItems = value
          .filter((item) => item.layer && item.layer.visible && item.outsideExtent === false)
          .filter((lyr) => (<LayerSource>(<unknown>lyr.layer)).legendItems)
          .map((lyr) => (<LayerSource>(<unknown>lyr.layer)).legendItems)
          .map((obj) => obj[0]);

        this._store.next([...LegendSources, ...layersLegendItems]);
      });
    }
  }

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

  /**
   * Determines if the provided layer contains legend items and displays/hides them based on layer display value
   */
  public toggleLayerLegendItems(layer: esri.Layer): void {
    // Check if the layer has legend items to begin with.
    if ((<LayerSource>(<unknown>layer)).legendItems && (<LayerSource>(<unknown>layer)).legendItems.length > 0) {
      // If the layer visibility is true, add the legend item.
      if (layer.visible) {
        this.addMany((<LayerSource>(<unknown>layer)).legendItems);
      } else {
        // If the layer visibility is false, remove the legend item.
        this.removeMany((<LayerSource>(<unknown>layer)).legendItems);
      }
    }
  }

  /**
   * Tests an item id reference against the store to determine if the item exists.
   *
   * @param {string} id Valid legend item id reference
   * @returns {boolean} Returns true if it exists, false if it does not
   */
  public itemExists(id: string): boolean {
    return this._store.value.findIndex((item) => item.id === id) > -1;
  }

  /**
   * Updates the service store with an array of items.
   *
   * Checks if the items being added exist before adding anything, to avoid duplicates.
   */
  public addMany(items: LegendItem[]): void {
    // List of items that need to be added, that do not exist yet
    const toAdd = items.filter((item) => !this.itemExists(item.id));

    // Set concatenate current store with items to add
    this._store.next([...this._store.value, ...toAdd]);
  }

  /**
   * Updates the service store excluding the items provided.
   */
  public removeMany(items: LegendItem[]): void {
    // Array of ID's that do not exists, and should be marked for removal.
    const idsToRemove = items.filter((item) => this.itemExists).map((item) => item.id);

    // New filtered array that does not include the items marked for removal.
    const removed = this._store.value.filter((storeItem) => !idsToRemove.includes(storeItem.id));

    // Set new store value with removed items
    this._store.next([...removed]);
  }
}

export interface IActiveLayerInfosChangeEvent {
  added: Array<esri.ActiveLayerInfo>;
  moved: Array<esri.ActiveLayerInfo>;
  removed: Array<esri.ActiveLayerInfo>;
  target: esri.LegendViewModel['activeLayerInfos'];
}
