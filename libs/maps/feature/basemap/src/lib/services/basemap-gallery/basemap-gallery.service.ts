import { Injectable } from '@angular/core';
import { combineLatest, from, map, Observable, shareReplay, take } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import { AggiemapBasemap, NearmapCSBasemap } from '../../shared/basemaps.definition';

import esri = __esri;

interface BasemapGalleryModules {
  basemapGalleryViewModel: esri.BasemapGalleryViewModelConstructor;
  localBasemapsSource: esri.LocalBasemapsSourceConstructor;
  basemap: esri.BasemapConstructor;
  tileLayer: esri.TileLayerConstructor;
  wmsLayer: esri.WMSLayerConstructor;
}

@Injectable({
  providedIn: 'root'
})
export class BasemapGalleryService {
  constructor(private readonly mp: EsriModuleProviderService, private readonly ms: EsriMapService) {}

  public modules(): Observable<BasemapGalleryModules> {
    return from(
      this.mp.require(['BaseMapGalleryViewModel', 'LocalBasemapsSource', 'Basemap', 'TileLayer', 'WMSLayer'])
    ).pipe(
      map((modules) => {
        return {
          basemapGalleryViewModel: modules[0],
          localBasemapsSource: modules[1],
          basemap: modules[2],
          tileLayer: modules[3],
          wmsLayer: modules[4]
        };
      }),
      shareReplay(1)
    );
  }

  public gallery() {
    return combineLatest([this.modules(), this.ms.store]).pipe(
      map(([modules, instances]: [BasemapGalleryModules, MapServiceInstance]) => {
        // There is a bug in the current version of the JS API (4.23) that prevents Aggiemap basemap from loading
        // from an auto-castable source because the baseLayers are not an instance of a class and the load() method does not exist.
        // To work around this, we need ton construct a new instance of the TileLayer class and pass in the base

        // Clone the base layer JSON object
        const baseLayerJSON = JSON.parse(JSON.stringify(AggiemapBasemap.baseLayers[0]));
        const nearmapJSON = JSON.parse(JSON.stringify(NearmapCSBasemap.baseLayers[0]));

        // Remove the type property to prevent read-only property assignment error.
        delete baseLayerJSON.type;
        delete nearmapJSON.type;

        const baseLayers = new modules.tileLayer({ ...baseLayerJSON });
        const nearmapCSLayer = new modules.wmsLayer({ ...nearmapJSON });

        const instancedAggiemapBasemap = new modules.basemap({ ...AggiemapBasemap, baseLayers: [baseLayers] });
        const nearmapCSBasemap = new modules.basemap({ ...NearmapCSBasemap, baseLayers: [nearmapCSLayer] });

        const model = new modules.basemapGalleryViewModel({
          view: instances.view,
          source: new modules.localBasemapsSource({
            basemaps: [
              instancedAggiemapBasemap,
              modules.basemap.fromId('topo-vector'),
              modules.basemap.fromId('streets-relief-vector'),
              modules.basemap.fromId('streets-navigation-vector'),
              modules.basemap.fromId('streets-vector'),
              modules.basemap.fromId('gray-vector'),
              nearmapCSBasemap
            ]
          })
        });

        return model;
      }, shareReplay())
    );
  }

  public setBasemap(basemap: esri.Basemap) {
    this.ms.store.subscribe((instance) => {
      instance.map.basemap = basemap;
    });
  }

  public resolveBasemapFromId(basemapIds: Array<string>) {
    return this.modules().pipe(
      map((modules) => {
        const firstNotFalsy = basemapIds.find((id) => !!id);

        switch (firstNotFalsy) {
          case 'aggie_basemap':
            return new modules.basemap(AggiemapBasemap);
          case 'nearmap_cs_basemap':
            return new modules.basemap(NearmapCSBasemap);
          default:
            return modules.basemap.fromId('topo-vector');
        }
      })
    );
  }
}
