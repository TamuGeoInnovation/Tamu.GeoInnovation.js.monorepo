import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { fromEventPattern, Observable, Subject } from 'rxjs';
import { map, mapTo, shareReplay, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { TemplateRenderer } from '@tamu-gisc/common/utils/string';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriModuleProviderService, MapServiceInstance, EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map-viewfinder',
  templateUrl: './viewfinder.component.html',
  styleUrls: ['./viewfinder.component.scss']
})
export class MapViewfinderComponent implements OnInit, OnDestroy {
  /**
   * Valid layer source ID which features will be focused.
   *
   * Referenced layer id must be that of a feature layer.
   */
  @Input()
  public layer: string;

  /**
   * Display template for listed focused features.
   */
  @Input()
  public template: string;

  /**
   * Determines the maximum number of features that will display in the
   * list of focused features.
   *
   * Defaults to the maximum of 10 features.
   */
  @Input()
  public listLimit = 9;

  /**
   * Store for selected features within the viewfinder. Used in template to render list.
   */
  public viewFinderFeatures: IViewfinderResult[];

  /**
   * Determines when the view finder is visible.
   */
  public $accessibleNavigation: Subject<boolean> = new Subject();

  private $mapView: Observable<MapServiceInstance['view']>;

  /**
   * Map view DOM reference
   */
  private _mapViewEl: HTMLDivElement;

  /**
   * Viewfinder DOM reference.
   */
  @ViewChild('viewfinder', { static: true })
  private _viewfinder: ElementRef;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private mp: EsriModuleProviderService,
    private mapService: EsriMapService,
    private environment: EnvironmentService
  ) {}

  public ngOnInit() {
    const sources = this.environment.value('LayerSources');

    const source = sources.find((s) => s.id === this.layer);

    // Isolate the map view for easier access
    this.$mapView = this.mapService.store.pipe(
      map((instances) => instances.view),
      shareReplay()
    );

    // Setup the key up event handler on the view with resubscription on view swap
    this.$mapView
      .pipe(
        switchMap((view) => {
          let handle: esri.Handle;

          const add = (handler) => {
            handle = view.on('key-up', handler);
          };

          const remove = () => {
            handle.remove();
          };

          return fromEventPattern<esri.MapViewKeyUpEvent>(add, remove).pipe(withLatestFrom(this.$mapView));
        }),
        takeUntil(this._$destroy)
      )
      .subscribe(([event, view]) => {
        const viewContainer = view.container;

        // Catch a select few keys to query buildings feature layer
        if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', '-', '=', '+'].includes(event.key)) {
          this.$accessibleNavigation.next(true);

          // Set timeout required to allow the state variables to reflect in the UI.
          // Else, the feature intersection calculation does not work as there is no pause for rendering
          // in the event loop until the next event cycle
          setTimeout(() => {
            const viewfinder = this._viewfinder.nativeElement;

            // Get vertices coordinates of the on-screen viewfinder
            const screenCoords = [
              [
                viewfinder.offsetLeft - viewfinder.offsetWidth / 2,
                viewfinder.offsetTop - viewfinder.offsetHeight / 2 - viewContainer.offsetTop
              ], // First vertex
              [
                viewfinder.offsetLeft + viewfinder.offsetWidth / 2,
                viewfinder.offsetTop - viewfinder.offsetHeight / 2 - viewContainer.offsetTop
              ],
              [
                viewfinder.offsetLeft + viewfinder.offsetWidth / 2,
                viewfinder.offsetTop + viewfinder.offsetHeight / 2 - viewContainer.offsetTop
              ],
              [
                viewfinder.offsetLeft - viewfinder.offsetWidth / 2,
                viewfinder.offsetTop + viewfinder.offsetHeight / 2 - viewContainer.offsetTop
              ],
              [
                viewfinder.offsetLeft - viewfinder.offsetWidth / 2,
                viewfinder.offsetTop - viewfinder.offsetHeight / 2 - viewContainer.offsetTop
              ] // Closing vertex, same as first
            ];

            // Transform screen point coordinates to map point coordinates
            const mapCoords: number[][] = screenCoords
              .map((point) => {
                return view.toMap({
                  x: point[0],
                  y: point[1]
                });
              })
              .map((coord) => {
                return [coord.longitude, coord.latitude];
              });

            // Use module provider to get polygon class object
            this.mp.require(['Polygon']).then(([Polygon]: [esri.PolygonConstructor]) => {
              // Create a polygon that will be used to query the feature layer to get intersecting features
              const polygon = new Polygon({
                rings: [mapCoords]
              });

              this.mapService.findLayerOrCreateFromSource(source).then((layer: esri.FeatureLayer) => {
                layer
                  .queryFeatures({
                    geometry: polygon,
                    returnGeometry: true,
                    outFields: ['*']
                  })
                  .then((features) => {
                    // Limit viewfinder results by the first 5 returned.
                    this.viewFinderFeatures = features.features.slice(0, this.listLimit).map((f): IViewfinderResult => {
                      return {
                        display: new TemplateRenderer({ template: this.template, lookup: f }).render(),
                        graphic: f
                      };
                    });
                  });
              });
            });
          }, 0);
        }

        // If viewfinder has features, and a number selection is made.
        if (
          this.viewFinderFeatures &&
          this.viewFinderFeatures.length > 0 &&
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(event.key)
        ) {
          if (this.viewFinderFeatures[parseInt(event.key, 10) - 1]) {
            // Clear the results layer

            this.mapService.selectFeatures({
              graphics: [this.viewFinderFeatures[parseInt(event.key, 10) - 1].graphic.clone()],
              shouldShowPopup: true
            });
          }
        }
      });

    this.$mapView
      .pipe(
        switchMap((view) => {
          let handle: esri.Handle;

          const addHandler = (handler) => {
            handle = view.on('click', handler);
          };

          const removeHandler = () => {
            handle.remove();
          };

          return fromEventPattern<esri.ViewClickEvent>(addHandler, removeHandler);
        }),
        mapTo(false),
        takeUntil(this._$destroy)
      )
      .subscribe(this.$accessibleNavigation);
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }
}

interface IViewfinderResult {
  display: string;
  graphic: esri.Graphic;
}
