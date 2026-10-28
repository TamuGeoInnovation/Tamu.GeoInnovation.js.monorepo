import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, map, take } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService, MapConfig, HIDDEN_DEFAULT_HIGHLIGHT } from '@tamu-gisc/maps/esri';
import { EsriMapComponent } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EsriMapComponent]
})
export class MapComponent implements OnInit {
  private ms = inject(EsriMapService);
  private env = inject(EnvironmentService);
  private at = inject(ActivatedRoute);

  public filterFeatures: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);

  public config = {
    basemap: {
      basemap: 'streets-navigation-vector'
    },
    view: {
      properties: {
        map: undefined, // Reference to the map object created before the scene
        center: [-96.344672, 30.61306],
        spatialReference: {
          wkid: 102100
        },
        zoom: 15,
        constraints: {
          // maxZoom: 21
        },
        popup: {
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
            position: 'bottom-right'
          }
        },
        highlights: HIDDEN_DEFAULT_HIGHLIGHT
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
        // Where things were already found last season (#2166), so participants look elsewhere. Listed
        // first, so this season's submissions draw on top. GIS Day's API publishes no symbology, so the
        // definition is the only source: an open maroon ring, apart from this season's grey dots, and not
        // clustered, because the point is to see each one.
        {
          type: 'geojson',
          id: 'already-found-layer',
          title: 'Already found last year',
          url: `${this.env.value('api_url')}/competitions/maps/seasons/active/already-found?format=geojson`,
          listMode: 'show',
          loadOnInit: true,
          visible: true,
          native: {
            renderer: {
              type: 'simple',
              symbol: {
                type: 'simple-marker',
                style: 'circle',
                size: 9,
                color: [0, 0, 0, 0],
                outline: { color: '#500000', width: 2 }
              }
            },
            popupTemplate: {
              title: 'Already found in {year}',
              content: '{typeName}'
            }
          }
        },
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
                color: '#424242'
              }
            },
            featureReduction: {
              type: 'cluster',
              clusterRadius: 45,
              labelingInfo: [
                {
                  deconflictionStrategy: 'none',
                  labelExpressionInfo: {
                    expression: "Text($feature.cluster_count, '#,###')"
                  },
                  symbol: {
                    type: 'text',
                    color: '#f5f5f5',
                    font: {
                      family: 'Noto Sans',
                      size: '14px'
                    }
                  },
                  labelPlacement: 'center-center'
                }
              ]
            }
          }
        }
      ]);
    });
  }
}
