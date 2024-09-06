import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { take } from 'rxjs';

import { EsriMapService, MapConfig } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-result-map',
  templateUrl: './result-map.component.html',
  styleUrls: ['./result-map.component.scss'],
  providers: [EsriMapService]
})
export class ResultMapComponent implements OnInit {
  @Input()
  public points: Array<{ latitude: number; longitude: number }>;

  @Input()
  public size: 'sm' | 'lg' = 'sm';

  public baseConfig: MapConfig;

  @HostBinding('class')
  public get styleClasses() {
    return [this.size];
  }

  constructor(private readonly ms: EsriMapService) {}

  public ngOnInit(): void {
    const [first] = this.points;
    const center = [(first as esri.Point)?.longitude, (first as esri.Point)?.latitude];

    this.baseConfig = {
      basemap: {
        basemap: 'streets-navigation-vector'
      },
      view: {
        mode: '2d',
        properties: {
          center,
          zoom: 12
        }
      }
    } as MapConfig;

    this.ms.store.pipe(take(1)).subscribe(() => {
      const graphics = this.points.map((p) => {
        return {
          attributes: { lat: p.latitude, lon: p.longitude },
          geometry: {
            type: 'point',
            latitude: p.latitude,
            longitude: p.longitude
          } as esri.PointProperties,
          symbol: {
            type: 'simple-marker',
            color: [255, 0, 0],
            size: '12px',
            outline: {
              color: [255, 255, 255],
              width: 2
            }
          } as esri.SimpleMarkerSymbolProperties
        };
      });

      this.ms.loadLayers([
        {
          type: 'graphics',
          id: 'geoprocess-result',
          title: 'Geoprocessing Result',
          native: {
            graphics
          },
          visible: true,
          popupTemplate: {
            title: 'Geocoding Result',
            content: 'Lat: {lat}, Lon: {lon}'
          }
        }
      ]);
    });
  }
}
