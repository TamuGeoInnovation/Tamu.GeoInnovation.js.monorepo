import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { loadModules } from 'esri-loader';

import { MapServiceInstance, MapConfig } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { Connections } from '../../environments/environment';

import esri = __esri;
@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.scss']
})
export class EsriMapComponent implements OnInit, OnDestroy {
  public map: esri.Map;
  public view: esri.MapView;
  public isMobile: boolean;
  public config: MapConfig;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(private responsiveService: ResponsiveService) {
    this.config = {
      basemap: {
        basemap: {
          baseLayers: [
            {
              type: 'TileLayer',
              url: Connections.basemapUrl,
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
    };
  }

  public ngOnInit() {
    this.responsiveService
      .getStatus()
      .pipe(takeUntil(this._destroy$))
      .subscribe((value) => {
        this.isMobile = value;
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
    this._destroy$.next();
    this._destroy$.complete();
  }

  public continue(instances: MapServiceInstance) {
    // TODO: This is a debugging event used for feature zoom calculation.
    // this.view.on('mouse-wheel', (e) => {
    //   this.moduleProvider.require(['Point', 'GeometryEngine'])
    //     .then(([Point, GeometryEngine]: [esri.PointConstructor, esri.geometryEngine]) => {
    //       // Get the view xmin and xmax distance in meters
    //       const viewXMin = new Point({
    //         x: this.view.extent.xmax,
    //         y: this.view.extent.ymin,
    //         spatialReference: this.view.spatialReference
    //       });

    //       const viewXMax = new Point({
    //         x: this.view.extent.xmin,
    //         y: this.view.extent.ymin,
    //         spatialReference: this.view.spatialReference
    //       });

    //       const viewScreenPointXMin = this.view.toScreen(viewXMin);
    //       const viewScreenPointXMax = this.view.toScreen(viewXMax);

    //       const viewScreenXDiff = viewScreenPointXMin.x - viewScreenPointXMax.x;

    //       const decimalDegreeDistance = Math.abs(viewXMax.longitude) - Math.abs(viewXMin.longitude);
    //       const viewDistance = GeometryEngine.distance(viewXMin, viewXMax, 'meters');

    //       const ratio = decimalDegreeDistance / viewDistance;

    //       console.log(viewDistance)
    //     })
    // })

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
}
