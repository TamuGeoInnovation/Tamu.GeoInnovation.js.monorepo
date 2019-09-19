import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { LayerListService } from './layer-list.service';

import { LegendSources } from '../../../../environments/environment';

import esri = __esri;
import { LegendItem } from '@tamu-gisc/common/types';

@Injectable()
export class LegendService {
  private _store: BehaviorSubject<LegendItem[]> = new BehaviorSubject([]);
  public store: Observable<LegendItem[]> = this._store.asObservable();

  constructor(private layerListService: LayerListService) {
    // Handle automatic layer addition and removal legend item display.
    // This does not handle removal on layer visibility change
    layerListService.store.subscribe((value) => {
      const layersLegendItems: any = value
        .filter((item) => item.layer && item.layer.visible)
        .filter((lyr: any) => lyr.layer.legendItems)
        .map((lyr: any) => lyr.layer.legendItems)
        .map((obj) => obj[0]);

      this._store.next([...LegendSources, ...layersLegendItems]);
    });
  }

  /**
   * Determines if the provided layer contains legend items and displays/hides them based on layer display value
   *
   * @param {esri.Layer} layer
   * @memberof LegendService
   */
  public toggleLayerLegendItems(layer: esri.Layer): void {
    // Check if the layer has legend items to begin with.
    if ((<any>layer).legendItems && (<any>layer).legendItems.length > 0) {
      // If the layer visibility is true, add the legend item.
      if (layer.visible) {
        this.addMany(<LegendItem[]>(<any>layer).legendItems);
      } else {
        // If the layer visibilty is false, remove the legend item.
        this.removeMany(<LegendItem[]>(<any>layer).legendItems);
      }
    }
  }

  /**
   * Tests an item id reference against the store to determine if the item exists.
   *
   * @param {string} id Valid legend item id reference
   * @returns {boolean} Returns true if it exists, false if it does not
   * @memberof LegendService
   */
  public itemExists(id: string): boolean {
    return this._store.value.findIndex((item) => item.id === id) > -1;
  }

  /**
   * Updates the service store with an array of items.
   *
   * Checks if the items being added exist before adding anything, to avoid duplicates.
   *
   * @param {LegendItem[]} items
   * @memberof LegendService
   */
  public addMany(items: LegendItem[]): void {
    // List of items that need to be added, that do not exist yet
    const toAdd = items.filter((item) => !this.itemExists(item.id));

    // Set concatenate current store with items to add
    this._store.next([...this._store.value, ...toAdd]);
  }

  /**
   * Updates the service store exclusing the items provided.
   *
   *
   * @param {LegendItem[]} items
   * @memberof LegendService
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
