import { Injectable } from '@angular/core';
import { combineLatest, firstValueFrom, from, map, switchMap } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { aggiemapBasemap, NearmapCSBasemap } from '../../shared/basemaps.definition';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class BasemapGalleryService {
  constructor(
    private readonly mp: EsriModuleProviderService,
    private readonly ms: EsriMapService,
    private readonly ts: TestingService
  ) {}

  public gallery() {
    return combineLatest([
      this.mp.require([
        'BaseMapGalleryViewModel',
        'LocalBasemapsSource',
        'Basemap',
        'TileLayer',
        'VectorTileLayer',
        'WMSLayer',
        'projection'
      ]),
      this.ms.store
    ]).pipe(
      switchMap(
        ([
          [BasemapGalleryViewModel, LocalBasemapsSource, Basemap, TileLayer, VectorTileLayer, WMSLayer, projection],
          instances
        ]: [
          [
            esri.BasemapGalleryViewModelConstructor,
            esri.LocalBasemapsSourceConstructor,
            esri.BasemapConstructor,
            esri.TileLayerConstructor,
            esri.VectorTileLayerConstructor,
            esri.WMSLayerConstructor,
            esri.projection
          ],
          MapServiceInstance
        ]) => {
          // On dev the Aggieland basemap is published in EPSG:32139 and the rest of the gallery is in Web Mercator.
          // Switching between them changes the view's spatial reference, which the API supports from 4.23 -
          // but only with the projection engine loaded. Without it the view's center does not survive the
          // switch. Loading it before the gallery exists means the first switch is already safe.
          return from(projection.load()).pipe(
            map(() => {
              // There is a bug in the current version of the JS API (4.23) that prevents Aggiemap basemap from loading
              // from an auto-castable source because the baseLayers are not an instance of a class and the load() method does not exist.
              // To work around this, we need ton construct a new instance of the layer class and pass in the base

              // Vector tiles on dev, raster on production, until the vector tiles are published there (#1229).
              const campusBasemap = aggiemapBasemap(this.ts.isTesting);

              // Clone the base layer JSON object
              const baseLayerJSON = JSON.parse(JSON.stringify(campusBasemap.baseLayers[0]));
              const baseLayerType = baseLayerJSON.type;
              const nearmapJSON = JSON.parse(JSON.stringify(NearmapCSBasemap.baseLayers[0]));

              // Remove the type property to prevent read-only property assignment error.
              delete baseLayerJSON.type;
              delete nearmapJSON.type;

              const baseLayers =
                baseLayerType === 'VectorTileLayer'
                  ? new VectorTileLayer({ ...baseLayerJSON })
                  : new TileLayer({ ...baseLayerJSON });
              const nearmapCSLayer = new WMSLayer({ ...nearmapJSON });

              const instancedAggiemapBasemap = new Basemap({ ...campusBasemap, baseLayers: [baseLayers] });
              const nearmapCSBasemap = new Basemap({ ...NearmapCSBasemap, baseLayers: [nearmapCSLayer] });

              const model = new BasemapGalleryViewModel({
                view: instances.view,
                source: new LocalBasemapsSource({
                  basemaps: [
                    instancedAggiemapBasemap,
                    Basemap.fromId('topo-vector'),
                    Basemap.fromId('streets-relief-vector'),
                    Basemap.fromId('streets-navigation-vector'),
                    Basemap.fromId('streets-vector'),
                    Basemap.fromId('gray-vector'),
                    nearmapCSBasemap
                  ]
                })
              });

              return model;
            })
          );
        }
      )
    );
  }

  /**
   * Applies a basemap, moving the view to that basemap's spatial reference when they differ.
   *
   * The gallery mixes projections: the campus basemap is a vector tile cache in EPSG:32139 while the
   * Esri basemaps and Nearmap are Web Mercator. From 4.23 a view can change its spatial reference at
   * runtime, but only when the basemap is changed *through the BasemapGallery or BasemapToggle
   * widget*. This sets `map.basemap` directly, which does not carry the view with it - the basemap
   * swaps, the view stays put, and the new basemap silently draws nothing.
   *
   * So the view is moved explicitly. `projection` is loaded in `gallery()` above, without which the
   * view's center does not survive the change.
   */
  public async setBasemap(basemap: esri.Basemap): Promise<void> {
    const instance = await firstValueFrom(this.ms.store);

    await basemap.load();

    const baseLayer = basemap.baseLayers.getItemAt(0);

    if (baseLayer && 'load' in baseLayer) {
      await baseLayer.load();
    }

    instance.map.basemap = basemap;

    const target = baseLayer && (baseLayer as unknown as { spatialReference?: esri.SpatialReference }).spatialReference;
    const current = instance.view.spatialReference;

    if (target && current && !target.equals(current)) {
      instance.view.spatialReference = target;
    }

    await this.whenViewIdle(instance.view);
  }

  /**
   * Resolves once the view has finished redrawing.
   *
   * `map.basemap = ...` returns immediately; the tiles arrive afterwards. Callers showing a loading
   * state need the later moment, which is what makes the Aerial Imagery wait visible rather than
   * looking like nothing happened.
   */
  private whenViewIdle(view: esri.MapView | esri.SceneView): Promise<void> {
    if (!view.updating) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const handle = view.watch('updating', (updating: boolean) => {
        if (!updating) {
          handle.remove();
          resolve();
        }
      });
    });
  }
}
