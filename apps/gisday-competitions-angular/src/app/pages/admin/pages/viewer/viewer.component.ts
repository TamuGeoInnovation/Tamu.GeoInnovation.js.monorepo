import { Component, OnInit } from '@angular/core';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { MapConfig, EsriMapService } from '@tamu-gisc/maps/esri';

@Component({
  selector: 'tamu-gisc-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  public mapConfig: MapConfig = {
    basemap: {
      basemap: 'dark-gray-vector'
    },
    view: {
      mode: '2d',
      properties: {
        center: [-96.34553, 30.61252],
        zoom: 15
      }
    }
  };

  constructor(private ms: EsriMapService, private env: EnvironmentService) {}

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
            fields: [
              {
                name: 'status',
                alias: 'status',
                type: 'string'
              },
              {
                name: 'guid',
                alias: 'guid',
                type: 'string'
              }
            ],
            renderer: {
              type: 'unique-value',
              field: 'status',
              defaultSymbol: {
                type: 'simple-marker',
                style: 'circle',
                size: 8,
                color: '#E0E0E0'
              } as unknown,
              uniqueValueInfos: [
                {
                  value: 'verified',
                  symbol: {
                    type: 'simple-marker',
                    style: 'circle',
                    size: 11,
                    color: '#00E676'
                  } as unknown
                },
                {
                  value: 'unverified',
                  symbol: {
                    type: 'simple-marker',
                    style: 'circle',
                    size: 8,
                    color: '#E0E0E0'
                  } as unknown
                },
                {
                  value: 'discarded',
                  symbol: {
                    type: 'simple-marker',
                    style: 'square',
                    size: 11,
                    color: '#F44336'
                  } as unknown
                }
              ]
            }
          }
        }
      ]);
    });
  }
}
