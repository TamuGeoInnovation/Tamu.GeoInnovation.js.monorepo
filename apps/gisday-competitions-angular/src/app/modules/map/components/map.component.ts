import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';

import { EsriMapService, MapServiceInstance, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public filterFeatures: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);

  constructor(private readonly mapService: EsriMapService, private readonly moduleProvider: EsriModuleProviderService) {
    from(this.mapService.store).subscribe((mapInstance: MapServiceInstance) => {
      this.moduleProvider
        .require(['Graphic', 'Point'])
        .then(
          ([Graphic, Point]: [
            esri.GraphicConstructor,
            esri.PointConstructor,
            esri.TrackConstructor,
            esri.CompassConstructor
          ]) => {
            // })
            // var simpleMarkerSymbol = {
            //   type: "simple-marker",
            //   color: [226, 119, 40],  // orange
            //   outline: {
            //     color: [255, 255, 255], // white
            //     width: 1
            //   }
            // };
            // points.map((val, i) => {
            //   var point = new Point({
            //     latitude: val.latitude,
            //     longitude: val.longitude,
            //   });
            //   var graphic = new Graphic({
            //     geometry: point,
            //     symbol: simpleMarkerSymbol,
            //   })
            //   this._view.graphics.add(graphic);
            // });
            // const track: esri.Track = new Track({
            //   view: this._view,
            //   useHeadingEnabled: true,
            //   goToLocationEnabled: false
            // });
            // const compass = new Compass({
            //   view: this._view
            // });
            // this._view.ui.add(track, 'bottom-right');
            // if (this.isMobile) {
            //   this._view.ui.add(track, 'bottom-right');
            // } else {
            //   this._view.ui.add(track, 'top-left');
            //   this._view.ui.add(compass, 'top-left');
            // }
          }
        )
        .catch((err) => {
          console.error(err);
        });
    });
  }

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

  public ngOnInit() {}
}
