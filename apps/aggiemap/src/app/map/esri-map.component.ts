import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { loadModules } from 'esri-loader';
import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '../modules/services/esri/esri-map.service';
import { TripPlannerService } from '../modules/services/trip-planner/trip-planner.service';
import { TripPoint } from '../modules/services/trip-planner/core/trip-planner-core';
import { ResponsiveService } from '../modules/services/ui/responsive.service';
import { EsriModuleProviderService } from '../modules/services/esri/esri-module-provider.service';
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

  private _destroy$: Subject<boolean> = new Subject();

  @ViewChild('mapViewNode', { static: true }) private mapViewEl: ElementRef;

  constructor(
    private analytics: Angulartics2,
    private mapService: EsriMapService,
    private plannerService: TripPlannerService,
    private url: Router,
    private responsiveService: ResponsiveService,
    private moduleProvider: EsriModuleProviderService
  ) {}

  ngOnInit() {
    this.responsiveService
      .getStatus()
      .pipe(takeUntil(this._destroy$))
      .subscribe((value) => {
        this.isMobile = value;
      });

    // Trigger load map by service
    this.loadMap();

    // Subscribe to the service store, and continue execution then
    this.mapService.store.pipe(takeUntil(this._destroy$)).subscribe((res) => {
      this.map = res.map;
      this.view = res.view;

      this.continue();
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

    // if (!!navigator.platform.match(/iPhone|iPod|iPad/)) {
    //   let lastY = 0;

    //   window.addEventListener('touchmove', (e) => {
    //     console.log(e)
    //     const { pageY } = e.changedTouches[0]
    //     const scrollY = window.pageYOffset || window.scrollY || 0;
    //     if (pageY > lastY && scrollY === 0) {
    //       e.preventDefault()
    //     }
    //     lastY = pageY
    //   }, { passive: false })
    // }
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Loads and stores map from central service.
   *
   * @returns Instance of Esri Map and View
   * @memberof EsriMapComponent
   */
  loadMap() {
    return this.mapService.loadMap(
      {
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
      {
        mode: '2d',
        properties: {
          container: this.mapViewEl.nativeElement,
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
    );
  }

  continue() {
    this.view.on('click', (e: esri.MapViewClickEvent) => {
      const layer: any = this.map.findLayerById('buildings-layer');
      // Allow click coordinates only when on the trip planner route
      if (this.url.url.includes('trip')) {
        this.mapService.featuresIntersectingPoint(layer, e.mapPoint).then((res) => {
          // If the query returns a feature in the value use the first item in that list
          if (res.features.length > 0) {
            this.plannerService.setStops([
              new TripPoint({
                source: 'map-event',
                originAttributes: res.features[0].attributes,
                originGeometry: { latitude: e.mapPoint.latitude, longitude: e.mapPoint.longitude },
                originParameters: {
                  type: 'map-event',
                  value: {
                    latitude: e.mapPoint.latitude,
                    longitude: e.mapPoint.longitude
                  }
                }
              })
            ]);
          } else {
            // If the query does not retrun a feature in the value, use the event coordinates.
            this.plannerService.setStops([
              new TripPoint({
                source: 'map-event',
                originGeometry: { latitude: e.mapPoint.latitude, longitude: e.mapPoint.longitude },
                originParameters: {
                  type: 'map-event',
                  value: {
                    latitude: e.mapPoint.latitude,
                    longitude: e.mapPoint.longitude
                  }
                }
              })
            ]);
          }
        });
      }
    });

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
        this.view.when(() => {
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
          view: this.view,
          useHeadingEnabled: true,
          goToLocationEnabled: false
        });

        const compass = new Compass({
          view: this.view
        });

        if (this.isMobile) {
          this.view.ui.add(track, 'bottom-right');
        } else {
          this.view.ui.add(track, 'top-left');
          this.view.ui.add(compass, 'top-left');
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  /**
   * Binds normal click and selected keyup handlers for ADA keyboard accessibility.
   * Can delegate events for dynamic content.
   *
   * @param {string} target Target element selector.
   * @param {*} parent If delegating event, the parent element that exists on DOM load. Else boolean false.
   * @param {string[]} events String array with events that need binding.
   * @param {*} cb Callback function that executes once the event is fired.
   */
  addAccessibleEventHandlers = (target: string, parent: any, events: string[], cb) => {
    events.forEach((e) => {
      if (e == 'click' || e == 'mousedown' || e == 'mouseup') {
        if (parent) {
          // If parent provided, delegate event
          document.querySelector(parent).addEventListener(e, (nativeEvent: MouseEvent) => {
            if (
              Array.from((<HTMLElement>nativeEvent.target).classList).includes(target.replace('.', '')) ||
              (<HTMLElement>nativeEvent.target).id == target.replace('#', '')
            ) {
              cb(nativeEvent);
            }
          });
        } else {
          // Set standard click handler
          document.querySelector(target).addEventListener(e, cb);
        }
      }

      if (e == 'keyup' || e == 'keydown') {
        /**
         * Tests whether the pressed key will be considered accessible. Default is SPACE and ENTER
         *
         * @param {*} event Keyboard event object
         * @returns {boolean} Returns Boolean true or false
         */
        const isAccessibleKey = (event) => {
          let ret = false;

          // Keys that will trigger along with click. In this case, SPACE and ENTER should also trigger the click event
          const accessibleKeys = [13, 32];

          if (accessibleKeys.includes(event.keyCode)) {
            // Execute callback function
            ret = true;
          }

          return ret;
        };

        // If parent provided, delegate event
        if (parent) {
          document.querySelector(parent).addEventListener(e, (nativeEvent: MouseEvent) => {
            if (isAccessibleKey(nativeEvent)) {
              if (
                Array.from((<HTMLElement>nativeEvent.target).classList).includes(target.replace('.', '')) ||
                (<HTMLElement>nativeEvent.target).id == target.replace('#', '')
              ) {
                cb(nativeEvent);
              }
            }
          });
        } else {
          // Set specific key handlers to target
          document.querySelector(target).addEventListener(e, (nativeEvent: KeyboardEvent) => {
            if (isAccessibleKey(nativeEvent)) {
              cb(nativeEvent);
            }
          });
        }
      }
    });
  };

  /**
   * Toggles a class on a DOM Element. While the .toggle() method can be used in code,
   * it cannot be used in HTML templates
   *
   * @param {*} event Event object
   * @param {*} className Class to be toggled
   */
  toggleClass = (event: KeyboardEvent | MouseEvent, className: string) => {
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
