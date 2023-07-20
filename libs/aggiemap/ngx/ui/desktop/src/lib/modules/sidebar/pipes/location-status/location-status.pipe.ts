import { Pipe, PipeTransform } from '@angular/core';
import { Observable, filter, fromEventPattern, map, mergeMap, startWith, switchMap } from 'rxjs';

import { LocationEntry } from '@tamu-gisc/aggiemap/ngx/data-access';

import { CategoryLocationMenuService } from '../../services/category-location-menu/category-location-menu.service';

import esri = __esri;

@Pipe({
  name: 'locationStatus'
})
export class LocationStatusPipe implements PipeTransform {
  constructor(private readonly ms: CategoryLocationMenuService) {}

  public transform(location: LocationEntry): Observable<boolean> {
    return this.ms.layers.pipe(
      mergeMap((layers) => layers),
      filter((layer) => layer.id === `cat-${location.attributes.catId}`),
      switchMap((layer) => {
        let handle: esri.Handle;

        const add = (cb) => {
          handle = layer.graphics.watch('length', cb);
        };

        const remove = () => {
          handle.remove();
        };

        return fromEventPattern(add, remove).pipe(
          map(() => {
            return this._isLocationActive(layer, location);
          }),
          startWith(this._isLocationActive(layer, location))
        );
      })
    );
  }

  private _isLocationActive(layer: esri.GraphicsLayer, location: LocationEntry): boolean {
    return layer.graphics.findIndex((g) => g.attributes.id === `loc-marker-${location.attributes.mrkId}`) > -1;
  }
}

