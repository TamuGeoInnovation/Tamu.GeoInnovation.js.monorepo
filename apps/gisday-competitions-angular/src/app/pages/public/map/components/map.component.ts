import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public filterFeatures: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);

  constructor(private ms: EsriMapService, private env: EnvironmentService) {}

  public config = {
    basemap: {
      basemap: 'streets-navigation-vector'
    },
    view: {
      mode: '2d',
      properties: {
        map: undefined, // Reference to the map object created before the scene
        center: [-96.344672, 30.61306],
        spatialReference: {
          wkid: 102100
        },
        zoom: 15,
        popup: {
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
            position: 'bottom-right'
          }
        },
        highlightOptions: {
          haloOpacity: 0,
          fillOpacity: 0
        }
      }
    }
  };

  public ngOnInit() {
    this.ms.store.subscribe((instance) => {
      const api_url = this.env.value('api_url');

      this.ms.loadLayers([
        {
          type: 'geojson',
          id: 'submissions-layer',
          title: 'Submissions',
          url: `${api_url}/map/geojson`,
          listMode: 'show',
          loadOnInit: true,
          visible: true,
          native: {
            renderer: {
              type: 'simple',
              symbol: {
                type: 'simple-marker',
                style: 'circle',
                size: 10,
                color: '#ffc5c5'
              }
            }
          }
        }
      ]);
    });
  }
}
