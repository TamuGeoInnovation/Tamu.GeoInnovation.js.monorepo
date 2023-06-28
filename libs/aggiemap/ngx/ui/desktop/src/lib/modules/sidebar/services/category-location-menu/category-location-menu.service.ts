import { Injectable } from '@angular/core';
import { Observable, debounceTime, forkJoin, from, map, mergeMap, scan, take } from 'rxjs';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { CategoryEntry, LocationEntry } from '@tamu-gisc/aggiemap/ngx/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class CategoryLocationMenuService {
  private _resource: string;
  private _layers: Observable<Array<string>>;

  constructor(
    private readonly ms: EsriMapService,
    private readonly env: EnvironmentService,
    private readonly ll: LayerListService
  ) {
    this._resource = this.env.value('Connections').cms_base;

    this._layers = this.ll.layers().pipe(
      mergeMap((items) => items),
      map((layerItem) => layerItem.layer.id),
      scan((acc, curr) => [...acc, curr], []),
      debounceTime(100)
    );

    this._layers.subscribe((res) => {
      console.log(res);
    });
  }

  /**
   * Accepts a location entry and adds it to the map.
   *
   * Relies on location parent category because it contains the symbology for the location.
   */
  public mapLocation(location: LocationEntry, category: CategoryEntry) {
    const layer = this.ms.findLayerOrCreateFromSource({
      type: 'graphics',
      id: `cat-${category.attributes.catId}`,
      title: category.attributes.name
    }) as Promise<esri.GraphicsLayer>;

    const graphicId = `loc-${location.attributes.mrkId}`;

    const graphic = {
      geometry: {
        type: 'point',
        longitude: location.attributes.lng,
        latitude: location.attributes.lat
      },
      symbol: {
        type: 'picture-marker',
        url: `${this._resource}/${category.attributes.icon.data.attributes.url}`,
        height: category.attributes.icon.data.attributes.height / 2,
        width: category.attributes.icon.data.attributes.width / 2
      },
      attributes: {
        id: graphicId
      }
    } as unknown as esri.Graphic;

    forkJoin([
      this.ms.store.pipe(
        take(1),
        map((store) => store.map)
      ),
      from(layer)
    ]).subscribe(([map, newOrExistingLayer]) => {
      // New layer, add to map
      if (newOrExistingLayer.loaded) {
        // Check if location is already on the map. If it is, remove it.
        const existingGraphic = newOrExistingLayer.graphics.find((g) => g.attributes.id === graphicId);

        if (existingGraphic) {
          newOrExistingLayer.remove(existingGraphic);
        } else {
          newOrExistingLayer.add(graphic);
        }
      } else {
        newOrExistingLayer.add(graphic);

        map.add(layer);
      }
    });
  }
}

