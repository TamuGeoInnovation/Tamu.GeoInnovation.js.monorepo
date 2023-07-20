import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';

import { LocationEntry } from '@tamu-gisc/aggiemap/ngx/data-access';

import { CategoryLocationMenuService } from '../../services/category-location-menu/category-location-menu.service';

@Pipe({
  name: 'locationStatus'
})
export class LocationStatusPipe implements PipeTransform {
  constructor(private readonly ms: CategoryLocationMenuService) {}

  public transform(location: LocationEntry): Observable<boolean> {
    return this.ms.layers.pipe(
      map((layers) => {
        const activeLayer = layers.find((layer) => {
          return layer.id === `cat-${location.attributes.catId}`;
        });

        if (!activeLayer) {
          return false;
        }

        return (
          activeLayer.graphics.findIndex((g) => {
            return g.attributes.id === `loc-marker-${location.attributes.mrkId}`;
          }) > -1
        );
      })
    );
  }
}

