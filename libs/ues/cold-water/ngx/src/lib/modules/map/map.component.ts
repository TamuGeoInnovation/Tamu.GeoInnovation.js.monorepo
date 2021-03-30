import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, skip, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import { loadModules } from 'esri-loader';

import { MapServiceInstance, MapConfig, EsriMapService } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { FeatureSelectorService } from '@tamu-gisc/maps/feature/feature-selector';
import { FeatureHighlightService } from '@tamu-gisc/maps/feature/feature-highlight';

import { ColdWaterValvesService } from '../core/services/cold-water-valves/cold-water-valves.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  public map: esri.Map;
  public view: esri.MapView | esri.SceneView;
  public isMobile: Observable<boolean>;
  public config: MapConfig;
  public loaded: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private _destroy$: Subject<boolean> = new Subject();
  constructor(
    private responsiveService: ResponsiveService,
    private environment: EnvironmentService,
    private mapService: EsriMapService,
    private highlightService: FeatureHighlightService,
    private selectionService: FeatureSelectorService,
    private coldWaterValveService: ColdWaterValvesService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.isMobile = this.responsiveService.isMobile.pipe(shareReplay());

    const connections = this.environment.value('Connections');

    this.config = {
      basemap: {
        basemap: {
          baseLayers: [
            {
              type: 'TileLayer',
              url: connections.basemapUrl,
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
          ui: {
            components: this.isMobile ? ['attribution'] : ['attribution', 'zoom']
          }
        }
      }
    };

    this.mapService.store.subscribe((instance) => {
      this.map = instance.map;
      this.view = instance.view;

      this.view.when(() => {
        const l = this.map.findLayerById('cold-water-valves-layer') as esri.FeatureLayer;

        // When layer is loaded, overwrite the default renderer
        l.when((layer: esri.FeatureLayer) => {
          this.coldWaterValveService.valves.pipe(skip(1), takeUntil(this._destroy$)).subscribe((res) => {
            const closedIdValues = res
              .filter((v) => {
                return v.attributes.CurrentPosition_1 === v.attributes.NormalPosition_1;
              })
              .map((v) => {
                return ({
                  value: v.attributes.OBJECTID,
                  symbol: {
                    type: 'simple-marker',
                    style: 'circle',
                    color: 'red',
                    size: '9pt'
                  }
                } as unknown) as esri.UniqueValueInfo;
              });

            const clone = (layer.renderer as esri.UniqueValueRenderer).clone();

            clone.uniqueValueInfos = closedIdValues;

            layer.renderer = clone;
          });
        });
      });
    });

    this.selectionService.snapshot
      .pipe(
        map((features) => {
          return features.filter((g) => g.layer.id === 'cold-water-valves-layer');
        }),
        filter((features) => features !== undefined && features.length > 0),
        takeUntil(this._destroy$)
      )
      .subscribe((res) => {
        this.router.navigate(['details', res[0].attributes.OBJECTID]);
      });

    this.coldWaterValveService.selectedValve
      .pipe(
        filter((p) => p !== undefined),
        takeUntil(this._destroy$)
      )
      .subscribe((res) => {
        this.highlight(res, true);
      });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public continue(instances: MapServiceInstance) {
    loadModules(['esri/widgets/Track', 'esri/widgets/Compass'])
      .then(([Track, Compass]) => {
        const track: esri.Track = new Track({
          view: instances.view,
          useHeadingEnabled: true,
          goToLocationEnabled: false
        });

        const compass = new Compass({
          view: instances.view
        });

        if (this.isMobile) {
          instances.view.ui.add(track, 'bottom-right');
        } else {
          instances.view.ui.add(track, 'top-right');
          instances.view.ui.add(compass, 'top-right');
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  /**
   * Highlights the provided features.
   *
   * Provides ability to zoom to features.
   */
  public highlight(features: esri.Graphic | esri.Graphic[], focus: boolean) {
    const feats = features instanceof Array ? features : [features];

    this.highlightService.highlight({
      features: feats
    });

    if (focus) {
      this.view.goTo(feats);
    }
  }
}
