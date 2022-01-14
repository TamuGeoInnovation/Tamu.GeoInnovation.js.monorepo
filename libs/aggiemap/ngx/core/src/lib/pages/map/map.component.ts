import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { loadModules } from 'esri-loader';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { MapServiceInstance, MapConfig } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

import esri = __esri;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  public map: esri.Map;
  public view: esri.MapView;
  public isMobile: boolean;
  public config: ReplaySubject<MapConfig> = new ReplaySubject(undefined);

  private _destroy$: Subject<boolean> = new Subject();
  private _connections: { [key: string]: string };

  constructor(private responsiveService: ResponsiveService, private env: EnvironmentService) {}

  public ngOnInit() {
    this._connections = this.env.value('Connections');

    this.responsiveService.isMobile.pipe(takeUntil(this._destroy$)).subscribe((value) => {
      this.isMobile = value;

      this.config.next({
        basemap: {
          basemap: {
            baseLayers: [
              {
                type: 'TileLayer',
                url: this._connections.basemapUrl,
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
  }

  public ngOnDestroy() {
    this._destroy$.next(undefined);
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
}
