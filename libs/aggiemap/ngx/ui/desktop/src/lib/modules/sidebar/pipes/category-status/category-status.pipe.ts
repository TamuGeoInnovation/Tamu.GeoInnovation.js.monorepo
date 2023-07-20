import { Pipe, PipeTransform } from '@angular/core';
import { filter, from, map, Observable, switchMap, toArray, withLatestFrom } from 'rxjs';

import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';
import { CategoryEntry } from '@tamu-gisc/aggiemap/ngx/data-access';

import { CategoryLocationMenuService } from '../../services/category-location-menu/category-location-menu.service';

import esri = __esri;

@Pipe({
  name: 'categoryStatus'
})
export class CategoryStatusPipe implements PipeTransform {
  private _activeLayerIds = this.ls.layers().pipe(
    switchMap((items) => {
      return from(items).pipe(
        // Only filter out category layers
        filter((item) => item.layer.id.startsWith('cat-')),

        // Filter out layers with no graphics. This is to reflect a layer that has been turned off.
        filter((item) => (item.layer as esri.GraphicsLayer).graphics.length > 0),

        // Map to layer id
        map((layer) => layer.layer.id),
        toArray()
      );
    })
  );

  constructor(private readonly ms: CategoryLocationMenuService, private readonly ls: LayerListService) {}

  public transform(category: CategoryEntry, ...args: unknown[]): Observable<boolean> {
    return this._activeLayerIds.pipe(
      withLatestFrom(this.ms.categoriesDictionary),
      map(([layerIds, catDict]) => {
        const layer = this._isCategoryActive(category, layerIds);

        // If layer is found, the category has actively mapped locations.
        // This will not reflect against child categories.
        if (layer !== undefined) {
          return true;
        }

        // If no layer is found, check the dictionary and see if it owns any additional categories
        // that might be active.
        const hasActiveChildren = this._hasActiveChildren(category, layerIds, catDict);

        if (hasActiveChildren) {
          return true;
        }

        return false;
      })
    );
  }
  /**
   * Determines if the category is active by checking if the category layer id is in the list of active layer ids.
   */
  private _isCategoryActive(category: CategoryEntry, layerIds: string[]): boolean {
    return layerIds.includes(`cat-${category.attributes.catId}`);
  }
  /**
   * Determines if the category has any active children by checking if their category id's are in the list of active layer ids.
   */
  private _hasActiveChildren(category: CategoryEntry, layerIds: string[], catDict: Record<number, number[]>): boolean {
    const children = catDict[category.attributes.catId];

    if (children !== undefined) {
      const childLayers = layerIds.filter((activeId) => {
        return children.includes(parseInt(activeId.split('-')[1], 10));
      });

      return childLayers.length > 0;
    }

    return false;
  }
}

