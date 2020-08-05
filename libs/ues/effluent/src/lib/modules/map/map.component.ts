import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { loadModules } from 'esri-loader';

import { MapServiceInstance, MapConfig, EsriMapService } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IEffluentSample } from '@tamu-gisc/ues/common/ngx';

import esri = __esri;
import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';
import { layer } from 'esri/views/3d/support/LayerPerformanceInfo';

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  public map: esri.Map;
  public view: esri.MapView;
  public isMobile: boolean;
  public config: MapConfig;

  private _destroy$: Subject<boolean> = new Subject();
  private _effluentSamplesResource: Array<IEffluentSample>;

  constructor(
    private responsiveService: ResponsiveService,
    private environment: EnvironmentService,
    private mapService: EsriMapService,
    private layerListService: LayerListService
  ) {}

  public ngOnInit() {
    const connections = this.environment.value('Connections');
    this._effluentSamplesResource = this.environment.value('effluentSamples');

    this.responsiveService.isMobile.pipe(takeUntil(this._destroy$)).subscribe((value) => {
      this.isMobile = value;
    });

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
          }
        }
      }
    };

    // Set loader phrases and display a random one.
    const phrases = [
      'An Aggie does not lie, cheat or steal or tolerate those who do.',
      'Home of the 12th Man',
      'Whoop!',
      "Gig 'Em!",
      'Howdy Ags!'
    ];
    (<HTMLInputElement>document.querySelector('.phrase')).innerText = phrases[Math.floor(Math.random() * phrases.length)];

    // this.mapService.store.subscribe(({map, view}) => {

    // })

    this.layerListService.layers({ watchProperties: ['visible'], layers: ['sampling-zone-3'] }).subscribe(([result]) => {
      const l = result.layer as esri.FeatureLayer;

      if (l) {
        const t = this.generateUniqueValueRenderer(3);

        l.renderer = (t as unknown) as any;
      }
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

  private generateUniqueValueRenderer(level: number) {
    // Get a list of samples which match the given level
    const eligible = this._effluentSamplesResource.filter((sample) => {
      return sample.sample.split('-')[0] === level.toString();
    });

    // Map to latest value
    const infos = eligible.reduce((acc, curr) => {
      const info = {
        value: curr.sample.toString(),
        symbol: {
          type: 'simple-fill',
          color: this.getSymbolColorForValue(curr.entries.pop().result)
        }
      };

      return [...acc, info];
    }, []);

    const renderer = {
      type: 'unique-value',
      field: 'SampleNumb',
      defaultSymbol: { type: 'simple-fill' },
      uniqueValueInfos: infos
    };

    return renderer;
  }

  private getSymbolColorForValue(measurement: number) {
    if (measurement === undefined) {
      return [20, 158, 206, 0.4];
    } else if (measurement < 0.45) {
      return [102, 187, 106, 0.4];
    } else if (measurement < 0.6) {
      return [255, 202, 40, 0.4];
    } else if (measurement < 1) {
      return [239, 83, 80, 0.4];
    }
  }
}
