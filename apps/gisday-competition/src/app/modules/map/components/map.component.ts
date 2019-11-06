import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';

import { EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import esri = __esri;

import { MapService } from '../providers/map.service';

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public filterFeatures: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);
  private _personalSubmissionsLayer: esri.FeatureLayer;
  private _view: esri.MapView;

  constructor(
    private readonly competitionService: MapService,
    private readonly mapService: EsriMapService,
  ) {
    from(mapService.store).subscribe((mapInstance: MapServiceInstance) => {
      this._view = mapInstance.view;
    });
  }

  public config = {
    basemap: {
      basemap: 'streets-navigation-vector'
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

  public ngOnInit() {
    this.competitionService.getUserSubmissions('BLAH BLAH').subscribe((results) => {
      console.log(results);
    });
    const points = this.competitionService.generateFakeMapData();
    // this._personalSubmissionsLayer = new esri.FeatureLayer({

    // })
    var simpleMarkerSymbol = {
      type: "simple-marker",
      color: [226, 119, 40],  // orange
      outline: {
        color: [255, 255, 255], // white
        width: 1
      }
    };

    points.map((val, i) => {
      var point = new esri.Point({
        latitude: val.latitude,
        longitude: val.longitude,
      });
      var graphic = new esri.Graphic({
        geometry: point,
        symbol: simpleMarkerSymbol,
      })
      this._view.graphics.add(graphic);
    });
    


  }
}
