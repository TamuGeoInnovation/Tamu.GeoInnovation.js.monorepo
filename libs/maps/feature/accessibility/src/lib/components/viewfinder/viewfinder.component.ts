import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TemplateRenderer } from '@tamu-gisc/common/utils/string';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { EsriMapService } from '@tamu-gisc/maps/esri';

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
  public accessibleNavigation = false;

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

    this.mapService.store.pipe(takeUntil(this._$destroy)).subscribe((instance) => {
      this._mapViewEl = instance.view.container;

      instance.view.on('key-up', (e: esri.MapViewKeyDownEvent) => {
        // Catch a select few keys to query buildings feature layer
        if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', '-', '=', '+'].includes(e.key)) {
          this.accessibleNavigation = true;

          // Set timeout required to allow the state variables to reflect in the UI.
          // Else, the feature intersection calculation does not work as there is no pause for rendering
          // in the event loop until the next event cycle
          setTimeout(() => {
            const viewfinder = this._viewfinder.nativeElement;

            // Get vertices coordinates of the on-screen viewfinder
            const screenCoords = [
              [
                viewfinder.offsetLeft - viewfinder.offsetWidth / 2,
                viewfinder.offsetTop - viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ], // First vertex
              [
                viewfinder.offsetLeft + viewfinder.offsetWidth / 2,
                viewfinder.offsetTop - viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ],
              [
                viewfinder.offsetLeft + viewfinder.offsetWidth / 2,
                viewfinder.offsetTop + viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ],
              [
                viewfinder.offsetLeft - viewfinder.offsetWidth / 2,
                viewfinder.offsetTop + viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ],
              [
                viewfinder.offsetLeft - viewfinder.offsetWidth / 2,
                viewfinder.offsetTop - viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ] // Closing vertex, same as first
            ];

            // Transform screen point coordinates to map point coordinates
            const mapCoords: number[][] = screenCoords
              .map((point) => {
                return instance.view.toMap({
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
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(e.key)
        ) {
          if (this.viewFinderFeatures[parseInt(e.key, 10) - 1]) {
            // Clear the results layer

            this.mapService.selectFeatures({
              graphics: [this.viewFinderFeatures[parseInt(e.key, 10) - 1].graphic.clone()],
              shouldShowPopup: true
            });
          }
        }
      });

      // On any map view click, disable the keyboard accessible navigation overlay
      instance.view.on('click', (e) => {
        this.accessibleNavigation = false;
      });
    });
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
