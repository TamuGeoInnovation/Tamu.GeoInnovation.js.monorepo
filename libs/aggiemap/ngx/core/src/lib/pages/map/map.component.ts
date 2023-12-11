import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';

import { loadModules } from 'esri-loader';

import { LayerSource } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { MapServiceInstance, MapConfig, EsriMapService } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { BetaPromptComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

import esri = __esri;
@Component({
  selector: 'tamu-gisc-aggiemap-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  public map: esri.Map;
  public view: esri.MapView;
  public isMobile: boolean;
  public config: ReplaySubject<MapConfig> = new ReplaySubject(undefined);

  public threeDLayers: Array<LayerSource>;

  public isDev: Observable<boolean>;
  public urlBasemap: string;

  private _destroy$: Subject<boolean> = new Subject();
  private _connections: { [key: string]: string };

  constructor(
    private responsiveService: ResponsiveService,
    private env: EnvironmentService,
    private readonly ms: ModalService,
    private readonly ss: SettingsService,
    private readonly ts: TestingService,
    private readonly http: HttpClient,
    private readonly mss: EsriMapService
  ) {}

  public ngOnInit() {
    this._connections = this.env.value('Connections');
    this.isDev = this.ts.get('isTesting');

    // TODO: This needs to be updated when settings service is updated to support settings branch get without feature component/module being loaded.
    // https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/274
    const preferencesString = localStorage.getItem('user-preferences');
    const preferencesSettings = preferencesString !== null ? JSON.parse(preferencesString) : { experiments: null };
    const experimentSettings = preferencesSettings.experiments || {};

    this.responsiveService.isMobile.pipe(takeUntil(this._destroy$)).subscribe((value) => {
      this.isMobile = value;

      this.config.next({
        basemap: {
          basemap: {
            baseLayers: [
              {
                type: 'TileLayer',
                url: experimentSettings.basemap_url ? experimentSettings.basemap_url : this._connections['basemapUrl'],
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
            ui: {
              components: this.isMobile ? ['attribution'] : ['attribution', 'zoom']
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
      });

      this.threeDLayers = this.env.value('ThreeDLayers', true);
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

    this.ss
      .init({
        storage: {
          subKey: 'modals'
        },
        settings: {
          beta_acknowledge: {
            value: false,
            persistent: true
          }
        }
      })
      .pipe(
        filter((settings) => {
          return settings['beta_acknowledge'] === false;
        }),
        withLatestFrom(this.isDev)
      )
      .subscribe(([settingValue, isDev]) => {
        this.openBetaModal(isDev);
      });
  }

  public ngOnDestroy() {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public async continue(instances: MapServiceInstance) {
    const oal_url = `${this.env.value('oalApiUrl')}/directory`;
    const live_url = `${this.env.value('oalApiUrl')}/`;

    this.mss.loadLayers([
      {
        type: 'geojson',
        url: oal_url,
        id: 'oals',
        title: 'OAL Directory',
        visible: false,
        native: {
          renderer: {
            type: 'simple',
            symbol: {
              type: 'cim',
              data: {
                type: 'CIMSymbolReference',
                primitiveOverrides: [
                  {
                    type: 'CIMPrimitiveOverride',
                    primitiveName: 'textGraphic',
                    propertyName: 'TextString',
                    valueExpressionInfo: {
                      type: 'CIMExpressionInfo',
                      title: 'Custom',
                      expression: '$feature.sum_Workstations',
                      returnType: 'Default'
                    }
                  }
                ],
                symbol: {
                  type: 'CIMPointSymbol',
                  symbolLayers: [
                    {
                      type: 'CIMVectorMarker',
                      enable: true,
                      size: 20,
                      colorLocked: true,
                      anchorPointUnits: 'Relative',
                      frame: { xmin: -5, ymin: -5, xmax: 5, ymax: 5 },
                      markerGraphics: [
                        {
                          type: 'CIMMarkerGraphic',
                          primitiveName: 'textGraphic',
                          geometry: { x: 0, y: 0 },
                          symbol: {
                            type: 'CIMTextSymbol',
                            fontFamilyName: 'Arial',
                            fontStyleName: 'Bold',
                            height: 4.5,
                            horizontalAlignment: 'Center',
                            offsetX: 0,
                            offsetY: 1.5,
                            symbol: {
                              type: 'CIMPolygonSymbol',
                              symbolLayers: [
                                {
                                  type: 'CIMSolidFill',
                                  enable: true,
                                  color: [255, 255, 255, 255]
                                }
                              ]
                            },
                            verticalAlignment: 'Center'
                          },
                          textString: ''
                        }
                      ],
                      scaleSymbolsProportionally: true,
                      respectFrame: true
                    },
                    {
                      type: 'CIMPictureMarker',
                      enable: true,
                      anchorPoint: { x: 0, y: 0 },
                      anchorPointUnits: 'Relative',
                      size: 20,
                      scaleX: 1,
                      url: '/assets/images/markers/computer-screen.png'
                    }
                  ]
                }
              }
            }
          }
        }
      },
      {
        type: 'geojson',
        url: live_url,
        id: 'live-oals',
        title: 'Live OALs',
        visible: true,
        native: {
          refreshInterval: 2.5,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'cim',
              data: {
                type: 'CIMSymbolReference',
                primitiveOverrides: [
                  {
                    type: 'CIMPrimitiveOverride',
                    primitiveName: 'textGraphic',
                    propertyName: 'TextString',
                    valueExpressionInfo: {
                      type: 'CIMExpressionInfo',
                      title: 'Custom',
                      expression: '$feature.soap_available',
                      returnType: 'Default'
                    }
                  }
                ],
                symbol: {
                  type: 'CIMPointSymbol',
                  symbolLayers: [
                    {
                      type: 'CIMVectorMarker',
                      enable: true,
                      size: 20,
                      colorLocked: true,
                      anchorPointUnits: 'Relative',
                      frame: { xmin: -5, ymin: -5, xmax: 5, ymax: 5 },
                      markerGraphics: [
                        {
                          type: 'CIMMarkerGraphic',
                          primitiveName: 'textGraphic',
                          geometry: { x: 0, y: 0 },
                          symbol: {
                            type: 'CIMTextSymbol',
                            fontFamilyName: 'Arial',
                            fontStyleName: 'Bold',
                            height: 4.5,
                            horizontalAlignment: 'Center',
                            offsetX: 0,
                            offsetY: 1.5,
                            symbol: {
                              type: 'CIMPolygonSymbol',
                              symbolLayers: [
                                {
                                  type: 'CIMSolidFill',
                                  enable: true,
                                  color: [255, 255, 255, 255]
                                }
                              ]
                            },
                            verticalAlignment: 'Center'
                          },
                          textString: ''
                        }
                      ],
                      scaleSymbolsProportionally: true,
                      respectFrame: true
                    },
                    {
                      type: 'CIMPictureMarker',
                      enable: true,
                      anchorPoint: { x: 0, y: 0 },
                      anchorPointUnits: 'Relative',
                      size: 20,
                      scaleX: 1,
                      url: '/assets/images/markers/computer-screen-available.png'
                    }
                  ]
                }
              }
            }
          }
        }
      }
    ]);

    loadModules(['esri/widgets/Track', 'esri/widgets/Compass'])
      .then(([Track, Compass]) => {
        instances.view.when(() => {
          //
          // Loader disable
          //
          document.querySelector('.loader .progress-bar')?.classList.remove('anim');

          setTimeout(() => {
            document.querySelector('.loader')?.classList.add('fade-out');

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
          instances.view.ui.add(track, 'top-left');
          instances.view.ui.add(compass, 'top-left');
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  /**
   * Toggles a class on a DOM Element. While the .toggle() method can be used in code,
   * it cannot be used in HTML templates
   */
  public toggleClass = (event: Event, className: string) => {
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

  public openBetaModal(shouldOpen: boolean) {
    if (shouldOpen) {
      this.ms
        .open<boolean>(BetaPromptComponent)
        .pipe(
          filter((acknowledged) => {
            return acknowledged;
          })
        )
        .subscribe(() => {
          this.updateModalSettings();
        });
    }
  }

  private updateModalSettings() {
    this.ss.updateSettings({
      beta_acknowledge: true
    });
  }
}
