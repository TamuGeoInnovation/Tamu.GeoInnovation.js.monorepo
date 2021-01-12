import { Component, OnInit, OnDestroy } from '@angular/core';
import { combineLatest, from, Observable, Subject } from 'rxjs';
import { filter, map, pluck, shareReplay } from 'rxjs/operators';

import { loadModules } from 'esri-loader';

import { MapServiceInstance, MapConfig, EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { FeatureSelectorService } from '@tamu-gisc/maps/feature/feature-selector';
import { FeatureHighlightService } from '@tamu-gisc/maps/feature/feature-highlight';
import { Location } from '@tamu-gisc/ues/recycling/common/entities';

import { LocationsService } from '../data-access/locations/locations.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [FeatureSelectorService]
})
export class MapComponent implements OnInit, OnDestroy {
  public map: esri.Map;
  public view: esri.MapView | esri.SceneView;
  public isMobile: Observable<boolean>;
  public config: MapConfig;

  public searchSource: Observable<esri.Graphic[]>;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private responsiveService: ResponsiveService,
    private environment: EnvironmentService,
    private mapService: EsriMapService,
    private highlightService: FeatureHighlightService,
    private selectionService: FeatureSelectorService,
    private locationsService: LocationsService,
    private loader: EsriModuleProviderService
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
        mode: '3d',
        properties: {
          // container: this.mapViewEl.nativeElement,
          map: undefined, // Reference to the map object created before the scene
          center: [-96.344672, 30.61306],
          spatialReference: {
            wkid: 102100
          },
          // constraints: {
          //   minScale: 100000, // minZoom is the max you can zoom OUT into space
          //   maxScale: 0 // maxZoom is the max you can zoom INTO the ground
          // },
          constraints: {
            // altitude: {
            //   min: 0,
            //   max: 10000
            // },
            tilt: {
              max: 179
            }
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

    // Set loader phrases and display a random one.
    const phrases = [
      'An Aggie does not lie, cheat or steal or tolerate those who do.',
      'Home of the 12th Man',
      'Whoop!',
      "Gig 'Em!",
      'Howdy Ags!'
    ];
    (<HTMLInputElement>document.querySelector('.phrase')).innerText = phrases[Math.floor(Math.random() * phrases.length)];

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
        instances.view.when(() => {
          //
          // Loader disable
          //
          document.querySelector('.loader .progress-bar').classList.remove('anim');

          setTimeout(() => {
            document.querySelector('.loader').classList.add('fade-out');

            setTimeout(() => {
              (<HTMLElement>document.querySelector('.loader')).style.display = 'none';
            }, 300);
          }, 300);
        });

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
   * Toggles a class on a DOM Element. While the .toggle() method can be used in code,
   * it cannot be used in HTML templates
   *
   * @param {*} event Event object
   * @param {*} className Class to be toggled
   */
  public toggleClass = (event: KeyboardEvent | MouseEvent, className: string) => {
    if ((<HTMLElement>event.currentTarget).classList) {
      if ((<HTMLElement>event.currentTarget).classList.contains(className)) {
        (<HTMLElement>event.currentTarget).classList.remove(className);
      } else {
        (<HTMLElement>event.currentTarget).classList.add(className);
      }
    } else {
      throw new Error('No event provided.');
    }
  };

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

  public clearHighlight() {
    this.highlightService.clearAll();
  }

  public toggle3dLayer() {
    const layerName = 'recycling-layer-three';

    const existingLayer = this.map.findLayerById(layerName);

    if (!existingLayer) {
      combineLatest([
        this.searchSource,
        this.locationsService.getLocationsResults(),
        this.loader.require(['FeatureLayer', 'Circle'])
      ]).subscribe(
        ([searchSource, locs, [FeatureLayer, Circle]]: [
          esri.Graphic[],
          Location[],
          [esri.FeatureLayerConstructor, esri.CircleConstructor]
        ]) => {
          const cloned = searchSource.reduce((collection, graphic) => {
            const c = graphic.clone();
            const cg = new Circle({
              center: {
                latitude: (c.geometry as esri.Point).latitude,
                longitude: (c.geometry as esri.Point).longitude
              },
              spatialReference: c.geometry.spatialReference,
              radius: 10,
              radiusUnit: 'meters'
            });

            c.geometry = cg;

            const matchedLocation = locs.find((location) => {
              if (c.attributes.bldNum) {
                return parseInt(c.attributes.bldNum, 10) === parseInt(location.id, 10);
              } else {
                return c.attributes.Name === location.id;
              }
            });

            if (matchedLocation === undefined) {
              return collection;
            }

            c.attributes.total = matchedLocation.results.reduce((acc, curr) => {
              const isDouble = curr.value % 1 !== 0;
              if (isDouble) {
                return acc + parseInt((curr.value * 2000).toFixed(0), 10);
              } else {
                return acc + curr.value;
              }
            }, 0);

            return [...collection, c];
          }, []);

          const layer = new FeatureLayer({
            id: layerName,
            source: cloned,
            objectIdField: 'OBJECTID',
            fields: [
              {
                name: 'OBJECTID',
                type: 'oid'
              },
              {
                name: 'total',
                type: 'integer'
              }
            ],
            elevationInfo: {
              mode: 'relative-to-scene'
            },
            renderer: {
              type: 'simple',
              symbol: {
                type: 'polygon-3d',
                symbolLayers: [{ type: 'extrude', material: { color: '#71C96E' } }]
              },
              label: '% population in poverty by county',
              visualVariables: [
                {
                  type: 'size',
                  field: 'total',
                  stops: [
                    {
                      value: 0,
                      size: 0
                    },
                    {
                      value: 100000,
                      size: 250
                    },
                    {
                      value: 1000000,
                      size: 500
                    }
                  ]
                }
              ]
            } as esri.RendererProperties
          });

          this.map.add(layer);
        }
      );
    } else {
      this.view.goTo(existingLayer);
    }
  }
}
