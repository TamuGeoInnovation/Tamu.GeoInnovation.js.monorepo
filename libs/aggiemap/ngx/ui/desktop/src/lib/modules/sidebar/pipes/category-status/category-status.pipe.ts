import { Pipe, PipeTransform } from '@angular/core';
import { map, Observable, withLatestFrom } from 'rxjs';

import { CategoryEntry } from '@tamu-gisc/aggiemap/ngx/data-access';

import { CategoryLocationMenuService } from '../../services/category-location-menu/category-location-menu.service';

@Pipe({
  name: 'categoryStatus'
})
export class CategoryStatusPipe implements PipeTransform {
  constructor(private readonly ms: CategoryLocationMenuService) {}

  public transform(category: CategoryEntry): Observable<boolean> {
    return this.ms.layerIds.pipe(
      withLatestFrom(this.ms.categoriesDictionary),
      map(([layerIds, catDict]) => {
        const isCategoryActive = this._isCategoryActive(category, layerIds);

        // If layer is found, the category has actively mapped locations.
        // This will not reflect against child categories.
        if (isCategoryActive) {
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
   * Determines if the category has any active children by checking the following conditions
   *
   * 1) The category has children categories
   * 2) If 1. is true, check if any of the children categories are active
   * 3) Perform a recursive check against the children categories to see if any of them have active children
   * 4) The return value is the result of 2. or 3.
   */
  private _hasActiveChildren(category: CategoryEntry, layerIds: string[], catDict: Record<number, number[]>): boolean {
    const children = catDict[category.attributes.catId];

    if (children !== undefined && children.length > 0) {
      const immediateChildLayers = layerIds.some((activeId) => {
        return children.includes(parseInt(activeId.split('-')[1], 10));
      });

      const childAncestorLayers = children.some((child) => {
        return this._hasActiveChildren({ attributes: { catId: child } } as CategoryEntry, layerIds, catDict);
      });

      return immediateChildLayers || childAncestorLayers;
    }

    return false;
  }
}
