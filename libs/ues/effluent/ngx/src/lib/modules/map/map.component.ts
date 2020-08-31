import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, map, withLatestFrom } from 'rxjs/operators';

import { loadModules } from 'esri-loader';

import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';
import { MapServiceInstance, MapConfig } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import esri = __esri;
import { ResultsService } from '../data-access/results/results.service';

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

  constructor(
    private responsiveService: ResponsiveService,
    private environment: EnvironmentService,
    private layerListService: LayerListService,
    private resultsService: ResultsService
  ) {}

  public ngOnInit() {
    const connections = this.environment.value('Connections');

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

    this.layerListService
      .layers({ watchProperties: ['visible'], layers: ['sampling-zone-3'] })
      .pipe(withLatestFrom(this.generateUniqueValueRenderer()))
      .subscribe(([[result], renderer]) => {
        const l = result.layer as esri.FeatureLayer;

        if (l) {
          l.renderer = renderer;
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

  private generateUniqueValueRenderer() {
    return this.resultsService.getLatestResults().pipe(
      map((results) => {
        const infos = results.map((result, index) => {
          // Pluck the top result from the result array for this sampling location

          const baseColor = this.getSymbolColorForValue(result.value);
          const fillColor = [...baseColor, 0.4];
          const strokeColor = [...baseColor, 1];

          const info = {
            value: `${result.location.tier}-${result.location.sample}`,
            symbol: {
              type: 'simple-fill',
              color: fillColor,
              outline: {
                color: strokeColor,
                width: 1.5
              }
            }
          };

          return info;
        });

        const renderer = ({
          type: 'unique-value',
          field: 'SampleNumber',
          defaultSymbol: { type: 'simple-fill' },
          uniqueValueInfos: infos
        } as unknown) as esri.UniqueValueRenderer;

        return renderer;
      })
    );
  }

  private getSymbolColorForValue(measurement: number) {
    if (measurement === undefined) {
      return [20, 158, 206];
    } else if (measurement < 0.45) {
      return [102, 187, 106];
    } else if (measurement < 0.6) {
      return [255, 152, 0];
    } else if (measurement < 1) {
      return [239, 83, 80];
    }
  }
}
