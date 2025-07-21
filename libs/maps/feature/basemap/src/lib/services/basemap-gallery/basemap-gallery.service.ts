import { Injectable } from '@angular/core';
import { combineLatest, map } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import { AggiemapBasemap, NearmapCSBasemap } from '../../shared/basemaps.definition';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class BasemapGalleryService {
  constructor(private readonly mp: EsriModuleProviderService, private readonly ms: EsriMapService) {}

  public gallery() {
    return combineLatest([
      this.mp.require(['BaseMapGalleryViewModel', 'LocalBasemapsSource', 'Basemap', 'TileLayer', 'WMSLayer']),
      this.ms.store
    ]).pipe(
      map(
        ([[BasemapGalleryViewModel, LocalBasemapsSource, Basemap, TileLayer, WMSLayer], instances]: [
          [
            esri.BasemapGalleryViewModelConstructor,
            esri.LocalBasemapsSourceConstructor,
            esri.BasemapConstructor,
            esri.TileLayerConstructor,
            esri.WMSLayerConstructor
          ],
          MapServiceInstance
        ]) => {
          // There is a bug in the current version of the JS API (4.23) that prevents Aggiemap basemap from loading
          // from an auto-castable source because the baseLayers are not an instance of a class and the load() method does not exist.
          // To work around this, we need ton construct a new instance of the TileLayer class and pass in the base

          // Clone the base layer JSON object
          const baseLayerJSON = JSON.parse(JSON.stringify(AggiemapBasemap.baseLayers[0]));
          const nearmapJSON = JSON.parse(JSON.stringify(NearmapCSBasemap.baseLayers[0]));

          // Remove the type property to prevent read-only property assignment error.
          delete baseLayerJSON.type;
          delete nearmapJSON.type;

          const baseLayers = new TileLayer({ ...baseLayerJSON });
          const nearmapCSLayer = new WMSLayer({ ...nearmapJSON });

          const instancedAggiemapBasemap = new Basemap({ ...AggiemapBasemap, baseLayers: [baseLayers] });
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
        }
      )
    );
  }

  public setBasemap(basemap: esri.Basemap) {
    this.ms.store.subscribe((instance) => {
      instance.map.basemap = basemap;
    });
  }
}
