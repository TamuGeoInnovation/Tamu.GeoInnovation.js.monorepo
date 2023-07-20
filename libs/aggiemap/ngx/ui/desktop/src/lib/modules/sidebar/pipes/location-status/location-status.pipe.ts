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
            // Graphics can be markers or shapes and differ by id prefix (loc-marker or loc-shape). We don't care about the prefix.
            // We only care about the id suffix, which is the location id.
            //
            // Question: Why not just use the location id as the graphic id without the prefix? This might come back to bite us.
            return parseInt(g.attributes.id.split('-').pop(), 10) === location.attributes.mrkId;
          }) > -1
        );
      })
    );
  }
}

