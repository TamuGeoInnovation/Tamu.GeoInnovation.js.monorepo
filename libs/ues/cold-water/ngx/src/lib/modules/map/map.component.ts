import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { filter, map, pluck, shareReplay } from 'rxjs/operators';

import { loadModules } from 'esri-loader';

import { MapServiceInstance, MapConfig, EsriMapService } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { FeatureSelectorService } from '@tamu-gisc/maps/feature/feature-selector';
import { FeatureHighlightService } from '@tamu-gisc/maps/feature/feature-highlight';

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

  public searchSource: Observable<esri.Graphic[]>;

  private _destroy$: Subject<boolean> = new Subject();
  constructor(
    private responsiveService: ResponsiveService,
    private environment: EnvironmentService,
    private mapService: EsriMapService,
    private highlightService: FeatureHighlightService,
    private selectionService: FeatureSelectorService
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
        const l = this.map.findLayerById('recycling-layer') as esri.FeatureLayer;

        this.searchSource = from(
          l.queryFeatures({
            outFields: ['*'],
            where: '1=1',
            returnGeometry: true
          })
        ).pipe(pluck('features'));
      });
    });

    this.selectionService.snapshot
      .pipe(
        map((features) => {
          return features.filter((g) => g.layer.id === 'recycling-layer');
        }),
        filter((features) => features !== undefined)
      )
      .subscribe((res) => {
        this.highlight(res, false);
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
