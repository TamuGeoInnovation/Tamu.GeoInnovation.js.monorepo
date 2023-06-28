import { Injectable } from '@angular/core';
import { Observable, debounceTime, forkJoin, from, map, mergeMap, scan, take } from 'rxjs';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { CategoryEntry, LocationEntry, LocationShape } from '@tamu-gisc/aggiemap/ngx/data-access';
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

    const graphics = this.generateGraphics(location, category);

    forkJoin([
      this.ms.store.pipe(
        take(1),
        map((store) => store.map)
      ),
      from(layer)
    ]).subscribe(([map, newOrExistingLayer]) => {
      // New layer, add to map
      if (newOrExistingLayer.loaded) {
        // Check if location graphics are already on the map. If they are, they should be removed.
        const existingGraphics = newOrExistingLayer.graphics
          .filter((g) => {
            return (
              graphics.findIndex((graphic) => {
                return g.attributes.id === graphic.attributes.id;
              }) > -1
            );
          })
          .toArray();

        if (existingGraphics.length > 0) {
          newOrExistingLayer.removeMany(existingGraphics);
        } else {
          newOrExistingLayer.addMany(graphics);
        }
      } else {
        newOrExistingLayer.addMany(graphics);

        map.add(layer);
      }
    });
  }

  /**
   * Generates a graphic based on the location.
   *
   * Some locations only have lat and lon point data.
   *
   * Others have polygon data.
   *
   * Some have a combination.
   */
  private generateGraphics(location: LocationEntry, category: CategoryEntry) {
    const marker = this.generateLocationMarker(location, category);
    const additionalGraphics = [];

    if (location.attributes.shape) {
      if (location.attributes.shape.type === 'polyline') {
        additionalGraphics.push(this.generatePolylineGeometry(location.attributes.shape, location.attributes.mrkId));
      }
    }

    // Marker can be undefined if location has shape data but the icon prop is set to false.
    return [marker, ...additionalGraphics].filter((g) => g !== undefined);
  }

  private generateLocationMarker(location: LocationEntry, category: CategoryEntry) {
    const graphicId = `loc-marker-${location.attributes.mrkId}`;
    let latitude, longitude;

    // If the icon prop is set to false, the marker should not be added to the map
    if (location.attributes.shape.icon === false) {
      return;
    }

    // If there is a shape, the marker position should be inherited form the position property
    if (location.attributes.shape) {
      [latitude, longitude] = location.attributes.shape.position;
    } else {
      longitude = location.attributes.lng;
      latitude = location.attributes.lat;
    }

    const graphic = {
      geometry: {
        type: 'point',
        longitude,
        latitude
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

    return graphic;
  }

  private generatePolylineGeometry(shape: LocationShape, locationId: number) {
    // Reverse the order of the paths because the API returns them in the wrong order.
    const flippedPaths = shape.path.map((path) => {
      return [path[1], path[0]];
    });

    return {
      geometry: {
        type: 'polyline',
        paths: flippedPaths
      },
      symbol: {
        type: 'simple-line',
        color: shape.color,
        width: shape.weight
      },
      attributes: {
        id: `loc-shape-${locationId}`
      }
    } as unknown as esri.Graphic;
  }
}

