import { Pipe, PipeTransform } from '@angular/core';
import { filter, from, map, Observable, switchMap, toArray } from 'rxjs';

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
      map((layerIds) => {
        const layer = layerIds.find((activeId) => {
          return activeId === `cat-${category.attributes.catId}`;
        });

        if (layer !== undefined) {
          return true;
        }

        return false;
      })
    );
  }
}

