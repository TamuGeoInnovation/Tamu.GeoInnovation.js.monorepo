import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  debounceTime,
  filter,
  forkJoin,
  from,
  map,
  merge,
  mergeMap,
  of,
  reduce,
  scan,
  shareReplay,
  switchMap,
  take,
  toArray
} from 'rxjs';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import {
  CategoryEntry,
  CategoryService,
  LocationEntry,
  LocationPolygon,
  LocationPolyline,
  LocationService
} from '@tamu-gisc/aggiemap/ngx/data-access';
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
    private readonly ll: LayerListService,
    private readonly cs: CategoryService,
    private readonly ls: LocationService
  ) {
    this._resource = this.env.value('Connections').cms_base;

    // Leverage layer list service to rely on the map instance to determine if a layer is already on the map.
    // This will save us from having to keep track of the layers ourselves.
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

  public toggleCategory(category: CategoryEntry) {
    // const layer = this._getCategoryLayer(category);

    // // Get all immediate location children of the category and generate graphics for them.
    // const graphics = this._getCategoryChildLocationGraphics(category);

    const resCat = this._resolveCategoryLayer(category);

    forkJoin([
      this.ms.store.pipe(
        take(1),
        map((store) => store.map)
      ),
      resCat
    ]).subscribe(([map, categories]) => {
      categories.forEach(({ graphics, layer }) => {
        this._mapLocation(map, layer, graphics);
      });
    });
  }

  /**
   * Accepts a location entry and adds it to the map.
   *
   * Relies on location parent category because it contains the symbology for the location.
   */
  public toggleLocation(location: LocationEntry, category: CategoryEntry) {
    const layer = this._getCategoryLayer(category);
    const locationGraphics = this._generateGraphics(location, category);

    forkJoin([
      this.ms.store.pipe(
        take(1),
        map((store) => store.map)
      ),
      layer,
      locationGraphics
    ]).subscribe(([map, newOrExistingLayer, locGraphics]) => {
      this._mapLocation(map, newOrExistingLayer, locGraphics);
    });
  }

  /**
   * Accepts a category entry and returns an array of observables that resolve to the layers and graphics.
   *
   * Each array item is a category layer and its associated graphics.
   *
   * If the input category has any immediate children, the first array will be the category layer and its location graphics.
   */
  private _resolveCategoryLayer(
    category: CategoryEntry
  ): Observable<Array<{ layer: esri.GraphicsLayer; graphics: Array<esri.Graphic> }>> {
    const subCategories = this.cs.getCategories(category.attributes.catId).pipe(mergeMap((c) => c.data));

    return merge(of(category), subCategories).pipe(
      mergeMap((cat) => {
        // If the category is the input category, return location graphics, no need to process subcategories since we are already doing that
        if (cat.id === category.id) {
          return forkJoin([this._getCategoryChildLocationGraphics(category), this._getCategoryLayer(category)]).pipe(
            map(([graphics, layer]) => ({ graphics, layer }))
          );
        } else {
          return this._resolveCategoryLayer(cat).pipe(mergeMap((subCat) => subCat));
        }
      }),
      // If anything fails in generating category graphics, layers, or subcategories, filter it out.
      // This will allow the rest of the categories to be processed.
      catchError((err) => {
        console.error(`Error resolving category layer: ${category.attributes.name}`, err);
        return of(undefined);
      }),
      filter((cat) => cat !== undefined),
      toArray()
    );
  }

  private _getCategoryChildLocationGraphics(category: CategoryEntry): Observable<Array<esri.Graphic>> {
    return this.ls.getLocations(category.attributes.catId).pipe(
      mergeMap((locations) => locations.data),
      switchMap((location) => this._generateGraphics(location, category)),
      reduce((acc, curr) => [...acc, ...curr], [])
    );
  }

  private _mapLocation(map: esri.Map, layer: esri.GraphicsLayer, graphics: Array<esri.Graphic>) {
    // Check if location graphics are already on the map.
    // This will determine whether to add or remove the graphics.
    const existingGraphics = layer.graphics
      .filter((g) => {
        return (
          graphics.findIndex((genGraphic) => {
            return g.attributes.id === genGraphic.attributes.id;
          }) > -1
        );
      })
      .toArray();

    // If there are existing graphics, remove them.
    if (existingGraphics.length > 0) {
      layer.removeMany(existingGraphics);
    } else {
      //
      layer.addMany(graphics);
    }
  }

  private _getCategoryLayer(category: CategoryEntry) {
    return from(
      this.ms.findLayerOrCreateFromSource({
        type: 'graphics',
        id: `cat-${category.attributes.catId}`,
        title: category.attributes.name
      }) as Promise<esri.GraphicsLayer>
    );
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
        height: category.attributes.icon.data.attributes.height / 2.75,
        width: category.attributes.icon.data.attributes.width / 2.75
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

