import { Injectable } from '@angular/core';
import { Observable, debounceTime, filter, forkJoin, from, map, mergeMap, of, scan, shareReplay, take, toArray } from 'rxjs';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { CategoryEntry, LocationEntry, LocationPolygon, LocationPolyline } from '@tamu-gisc/aggiemap/ngx/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class CategoryLocationMenuService {
  private _resource: string;
  private _layers: Observable<Array<string>>;
  private _color: Observable<esri.ColorConstructor>;

  constructor(
    private readonly mp: EsriModuleProviderService,
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

    this._color = from(this.mp.require(['Color'])).pipe(
      map(([Color]) => Color),
      shareReplay()
    );
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

    const graphics = this._generateGraphics(location, category);

    forkJoin([
      this.ms.store.pipe(
        take(1),
        map((store) => store.map)
      ),
      from(layer),
      graphics
    ]).subscribe(([map, newOrExistingLayer, generatedGraphics]) => {
      // New layer, add to map
      if (newOrExistingLayer.loaded) {
        // Check if location graphics are already on the map.
        // This will determine whether to add or remove the graphics.
        const existingGraphics = newOrExistingLayer.graphics
          .filter((g) => {
            return (
              generatedGraphics.findIndex((genGraphic) => {
                return g.attributes.id === genGraphic.attributes.id;
              }) > -1
            );
          })
          .toArray();

        // If there are existing graphics, remove them.
        if (existingGraphics.length > 0) {
          newOrExistingLayer.removeMany(existingGraphics);
        } else {
          //
          newOrExistingLayer.addMany(generatedGraphics);
        }
      } else {
        // If no layer exists on the map yet, add graphics to the layer and then add layer to map.
        newOrExistingLayer.addMany(generatedGraphics);

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
  private _generateGraphics(location: LocationEntry, category: CategoryEntry) {
    const marker = this._generateLocationMarker(location, category);
    const additionalGraphics: Array<Observable<esri.Graphic>> = [];

    if (location.attributes.shape) {
      if (location.attributes.shape.type === 'polyline') {
        additionalGraphics.push(
          this._generatePolylineGeometry(location.attributes.shape as LocationPolyline, location.attributes.mrkId)
        );
      } else if (location.attributes.shape.type === 'polygon') {
        additionalGraphics.push(
          this._generatePolygonGeometry(location.attributes.shape as LocationPolygon, location.attributes.mrkId)
        );
      }
    }

    return forkJoin([...additionalGraphics, marker]).pipe(
      mergeMap((layers) => layers),
      // Marker can be undefined if location has shape data but the icon prop is set to false.
      filter((graphic) => graphic !== undefined),
      toArray()
    ) as Observable<Array<esri.Graphic>>;
  }

  /**
   * Generates location marker (picture marker graphic).
   *
   * Can optionally return undefined if the location has shape data but the icon prop is set to false.
   */
  private _generateLocationMarker(location: LocationEntry, category: CategoryEntry) {
    const graphicId = `loc-marker-${location.attributes.mrkId}`;
    let latitude, longitude;

    // If the icon prop is set to false, the marker should not be added to the map
    if (location.attributes.shape.icon === false) {
      return of(undefined);
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

    return of(graphic);
  }

  private _generatePolylineGeometry(shape: LocationPolyline, locationId: number) {
    return this._color.pipe(
      map((Color) => {
        const c = Color.fromHex(shape.color);
        c.a = shape.opacity;

        return {
          geometry: {
            type: 'polyline',
            paths: this._invertCoordinates(shape.path)
          },
          symbol: {
            type: 'simple-line',
            color: c,
            width: shape.weight
          },
          attributes: {
            id: `loc-shape-${locationId}`
          }
        } as unknown as esri.Graphic;
      })
    );
  }

  private _generatePolygonGeometry(shape: LocationPolygon, locationId: number) {
    return this._color.pipe(
      map((Color) => {
        const fillColor = Color.fromHex(shape.color);
        const outlineColor = fillColor.clone();
        fillColor.a = shape.fillOpacity;
        outlineColor.a = shape.opacity;

        return {
          geometry: {
            type: 'polygon',
            rings: this._invertCoordinates(shape.paths)
          },
          symbol: {
            type: 'simple-fill',
            color: fillColor,
            width: shape.weight,
            outline: {
              color: outlineColor,
              width: shape.weight
            }
          },
          attributes: {
            id: `loc-shape-${locationId}`
          }
        } as unknown as esri.Graphic;
      })
    );
  }

  /**
   * Inverts the coordinate order of a path.
   *
   * This is necessary because the CMS stores coordinates in [lat, lon] order, but the ESRI API expects [lon, lat].
   */
  private _invertCoordinates(paths: Array<Array<[number, number]>>) {
    return paths.map((path) => {
      return [path[1], path[0]];
    });
  }
}

