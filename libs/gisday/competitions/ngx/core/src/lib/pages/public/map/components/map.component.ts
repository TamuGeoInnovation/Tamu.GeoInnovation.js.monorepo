import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, map, take } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService, MapConfig } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public filterFeatures: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);

  constructor(private ms: EsriMapService, private env: EnvironmentService, private at: ActivatedRoute) {}

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
        constraints: {
          maxZoom: 21
        },
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
  } as MapConfig;

  public ngOnInit() {
    const url: Observable<string> = this.at.queryParams.pipe(
      map((params) => params['user']),
      map((guid): string => {
        const api_url = this.env.value('api_url');

        if (guid !== undefined) {
          return `${api_url}/competitions/maps/seasons/active/user/${guid}?format=geojson`;
        } else {
          return `${api_url}/competitions/maps/seasons/active?format=geojson`;
        }
      })
    );

    forkJoin([url.pipe(take(1)), this.ms.store.pipe(take(1))]).subscribe(([url]) => {
      this.ms.loadLayers([
        {
          type: 'geojson',
          id: 'submissions-layer',
          title: 'Submissions',
          url: url,
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
