import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { MapConfig, EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse } from '../../types/types';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-kissingbugs-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public config: MapConfig = {
    basemap: {
      basemap: 'dark-gray-vector'
    },
    view: {
      mode: '2d',
      properties: {
        center: [-99.20987760767717, 31.225356084754477],
        zoom: 6
      }
    }
  };

  public map: esri.Map;
  public view: esri.MapView;

  public pageContents: Observable<IStrapiPageResponse>;

  constructor(private ss: StrapiService, private mapService: EsriMapService, private mp: EsriModuleProviderService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage('map', language).pipe(shareReplay(1));

    this.mapService.store.subscribe((instances) => {
      this.map = instances.map;
      this.view = instances.view as esri.MapView;
    });

    this.mp
      .require(['FeatureLayer', 'GeoJSONLayer', 'GraphicsLayer', 'Graphic', 'Symbol', 'Geometry'])
      .then(
        ([FeatureLayer, GeoJSONLayer, GraphicsLayer, Graphic]: [
          esri.FeatureLayerConstructor,
          esri.GeoJSONLayerConstructor,
          esri.GraphicsLayerConstructor,
          esri.GraphicConstructor
        ]) => {
          const geojsonLayer = new GeoJSONLayer({
            url: 'http://localhost:1337/uploads/counties20m_696b17e926.json',
            legendEnabled: true
          });
          this.map.add(geojsonLayer);
        }
      );
  }
}
