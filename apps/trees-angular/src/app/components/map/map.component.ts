import { Component, OnInit } from '@angular/core';

import esri = __esri;
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public filterFeatures: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);

  public spatialFeatures: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);

  constructor() {}

  public config = {
    basemap: {
      basemap: {
        baseLayers: [
          {
            type: 'TileLayer',
            url: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/BaseMap_20190813/MapServer',
            spatialReference: {
              wkid: 102100
            },
            listMode: 'hide',
            visible: true,
            minScale: 100000,
            maxScale: 0,
            title: 'Base Map'
          }
        ],
        id: 'aggie_basemap',
        title: 'Aggie Basemap'
      }
    },
    view: {
      mode: '2d',
      properties: {
        // container: this.mapViewEl.nativeElement,
        map: undefined, // Reference to the map object created before the scene
        center: [-96.344672, 30.61306],
        spatialReference: {
          wkid: 102100
        },
        constraints: {
          minScale: 100000, // minZoom is the max you can zoom OUT into space
          maxScale: 0 // maxZoom is the max you can zoom INTO the ground
        },
        zoom: 16,
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

  public ngOnInit() {}
}
