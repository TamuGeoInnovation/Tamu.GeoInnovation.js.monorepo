import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, pluck, take, takeUntil, tap } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService, MapConfig } from '@tamu-gisc/maps/esri';

import { ViewerService } from './services/viewer.service';

@Component({
  selector: 'tamu-gisc-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {
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

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private readonly vs: ViewerService,
    private readonly route: ActivatedRoute,
    private readonly ms: EsriMapService,
    private readonly env: EnvironmentService
  ) {}

  public ngOnInit() {
    this.route.queryParams
      .pipe(
        pluck('season'),
        filter((s) => s),
        distinctUntilChanged(),
        tap((s) => {
          this.vs.updateSeason(s);
        }),
        takeUntil(this._$destroy)
      )
      .subscribe((seasonGuid) => {
        this.loadSeasonLayer();
      });
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public loadSeasonLayer() {
    this.ms.store.pipe(take(1)).subscribe((instance) => {
      const layerId = 'submissions-layer';

      const layer = this.ms.findLayerById(layerId);

      if (layer) {
        this.ms.removeLayerById(layerId);
      }

      const api_url = this.env.value('api_url');

      this.ms.loadLayers([
        {
          type: 'geojson',
          id: layerId,
          title: 'Submissions',
          url: `${api_url}/map/geojson`,
          listMode: 'show',
          loadOnInit: true,
          visible: true,
          native: {
            outFields: ['*'],
            fields: [
              {
                name: 'status',
                alias: 'status',
                type: 'string',
                defaultValue: 'unverified'
              },
              {
                name: 'guid',
                alias: 'guid',
                type: 'string',
                editable: true
              }
            ],
            renderer: {
              type: 'unique-value',
              field: 'status',
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
